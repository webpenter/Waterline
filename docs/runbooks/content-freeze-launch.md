# WATERLINE Runbook — Content Freeze & Production Launch Protocol

> **Cutover Window**: 48 hours pre-launch  
> **Mandatory Gates**: Spec §19, §20, CLAUDE.md

---

## 1. 48-Hour Pre-Launch Checklist (T - 48h)

- [ ] **Content Freeze**:
  - Disable automated agency feed polling (`CRON_POLL_FEEDS=false`).
  - Announce backoffice freeze to agency partners.
- [ ] **Final Ingestion Sweep**:
  - Run all queued XML/CSV imports.
  - Review and clear the moderation queue in Payload admin (`moderation=unreviewed`).
- [ ] **DNS Preparation**:
  - Reduce DNS TTL to **300 seconds** (5 minutes) across apex and `www` records on Cloudflare/DNS provider.

---

## 2. 24-Hour Pre-Launch Verification (T - 24h)

- [ ] **Sitemap & SEO Audit**:
  ```bash
  pnpm audit:seo
  ```
  - Verify `sitemap.xml` returns 200 and references all child sitemaps.
  - Verify `robots.txt` disallows `/admin`, `/api`, and search facet queries while allowing AI crawlers on public routes.
  - Verify `llms.txt` and `llms-full.txt` serve valid markdown.
- [ ] **Redirect Verification**:
  - Confirm HTTP 410 for expired test listings (`/gone`).
  - Confirm HTTP 301 for renamed/slugified URLs.

---

## 3. Launch Day Protocol (T - 2h to T - 0)

### Step 1: Purge Sample Data (CRITICAL HARD GATE)
> **BLOCKING ITEM**: Zero sample listings may exist in production index!
1. Execute purge script:
   ```bash
   pnpm sample:purge
   ```
2. Verify zero sample listings remain:
   ```sql
   SELECT count(*) FROM properties WHERE is_sample = true;
   -- Must return 0!
   ```
3. Set production environment variable in Vercel:
   ```
   SAMPLE_DATA_ENABLED=false
   ```

### Step 2: Trigger Full Search Reindex
```bash
pnpm search:reindex
```
Verify total indexed count matches approved production properties.

### Step 3: Trigger Production Revalidation
```bash
curl -X POST https://waterline.com/api/revalidate \
  -H "x-revalidate-secret: $REVALIDATE_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"paths": ["/", "/search", "/destinations", "/journal"]}'
```

### Step 4: DNS Cutover
1. Point production A/CNAME records to Vercel production edge:
   - `cname.vercel-dns.com`
2. Verify SSL certificate issuance and HTTPS termination.
3. Test edge cache HIT:
   ```bash
   curl -I https://waterline.com/en
   # Check headers: x-vercel-cache: HIT
   ```
4. Restore DNS TTL to 86400 (24h) once traffic stabilizes.
