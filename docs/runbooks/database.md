# WATERLINE Runbook — Database Management & Disaster Recovery

> **Database**: PostgreSQL 16 + PostGIS 3.4  
> **Provider**: Neon Cloud (Serverless Postgres)  
> **Spec**: §7, §19

---

## 1. Architecture & Backups

- **Branching Strategy**:
  - `main`: Production database only. Never connects to dev or staging.
  - `staging`: Dedicated Neon branch. Cloned from production schema, populated with sanitised data.
  - `dev`: Developer ephemeral branches or local Docker containers.
- **Backup Schedule**:
  - Daily automated snapshots retained for 30 days.
  - **7-Day Point-in-Time Recovery (PITR)** active continuously.

---

## 2. Pre-Migration Protocol (Non-Destructive Guarantee)

Before applying any schema migration in production:
1. **Review raw SQL**:
   Verify the migration does not perform table rewrites, full table locks, or unindexed constraints on hot tables (`properties`, `leads`).
2. **Take PITR Timestamp**:
   Record the exact ISO-8601 timestamp in [`DECISIONS.md`](file:///var/www/html/WATERLINE/DECISIONS.md).
3. **Dry-run on Staging**:
   Apply migration to staging branch first and run full Playwright suite.
4. **Mandatory Down-Migration**:
   Every up-migration must be accompanied by an automated down-migration SQL script.

---

## 3. Disaster Recovery & Restoration

### Scenario A: Accidental Data Corruption or Bad Migration
1. Open Neon Console → **Branches** → **Point-in-Time Recovery**.
2. Select timestamp 5 minutes prior to the corruption event.
3. Restore to a recovery branch: `main-recovered-YYYYMMDD-HHMM`.
4. Run verification queries to ensure data integrity:
   ```sql
   SELECT count(*) FROM properties WHERE is_sample = false;
   SELECT count(*) FROM leads;
   ```
5. Update Vercel environment variable `DATABASE_URL` to point to the recovery branch, or promote the recovery branch to primary.
6. Trigger redeploy and verify `/api/health`.

### Scenario B: Database Outage / Failover
1. Neon automatically handles compute failover in < 15 seconds.
2. The application layer in `/src/lib/db/` contains connection pooling and retry circuits (`search-fallback.ts`).
3. If PostgreSQL is temporarily unreachable, public search and read operations gracefully serve cached responses or static ISR pages.
