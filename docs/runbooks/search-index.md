# WATERLINE Runbook — Search Index Management (Typesense)

> **Search Engine**: Typesense 27.1  
> **Host**: Typesense Cloud (Production) / Local Docker (CI/Dev)  
> **Spec**: §6.6, §7.1, §19

---

## 1. Golden Rule: Zero-Downtime Reindexing

> **NEVER reindex into the active collection directly.**  
> Always reindex into a timestamped collection, verify document counts and search queries, then atomically swap the alias.

---

## 2. Full Reindex Procedure

To perform a complete search reindex without downtime:

1. **Run the Reindex Script**:
   ```bash
   pnpm search:reindex
   ```
   **What the script does under the hood**:
   - Creates a new collection: `properties_YYYYMMDD_HHMMSS`.
   - Streams all approved, public, non-sample listings from PostgreSQL through the privacy sanitizer (`sanitizePropertyForPublic`).
   - Inserts batches of 100 documents with coordinate jitter intact.
   - Runs a test search query against the new collection.
   - Atomically updates the `properties` alias pointer to `properties_YYYYMMDD_HHMMSS`.
   - Deletes the previous collection after a 10-minute grace period.

2. **Verify Search Functionality**:
   ```bash
   curl -s "https://waterline.com/api/search?water=sea" | jq .total
   ```

---

## 3. Typesense Failure & PostgreSQL Fallback

If Typesense experiences an outage or becomes unreachable:

1. **Automatic Fallback Circuit**:
   - The application data abstraction in `/src/lib/db/index.ts` monitors Typesense reachability.
   - When Typesense fails or times out (> 1500 ms), the app transparently shifts queries to PostgreSQL (`searchPropertiesPostgres`).
   - Bounding-box and radius queries execute via PostGIS spatial indexes (`ST_DWithin`, `ST_MakeEnvelope`).
2. **Monitoring & Recovery**:
   - Fallback activations emit structured warnings: `[search] Typesense unavailable, using Postgres fallback`.
   - Once Typesense returns healthy, queries automatically resume against Typesense with full live faceting.
