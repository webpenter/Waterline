# WATERLINE Runbook — Deployment & Rollback

> **SLA**: 99.9% availability target  
> **Platform**: Vercel (Next.js 15 App Router + Payload 3)  
> **Repository Rules**: Spec §1.2, §19, CLAUDE.md

---

## 0. One-Time Environment Provisioning (Prompt 20)

Three environments: **development** (local or cloud dev), **staging**
(password-protected Vercel preview + its own Neon branch + its own Typesense
collection prefix, `noindex` site-wide), **production**. Staging and
production never share a database or search index.

### 0.1 Neon (Postgres + PostGIS)
1. Create a Neon project → note the pooled connection string.
2. Create a `staging` branch off `main` (two connection strings total).
3. On BOTH branches run: `CREATE EXTENSION IF NOT EXISTS postgis; CREATE EXTENSION IF NOT EXISTS pg_trgm;`
4. Env: `DATABASE_URL` (per environment).

### 0.2 Typesense Cloud
1. Create a cluster → note host, port 443, protocol https.
2. Create an admin key and a search-only key.
3. Env: `TYPESENSE_HOST`, `TYPESENSE_PORT=443`, `TYPESENSE_PROTOCOL=https`,
   `TYPESENSE_API_KEY` (admin), `TYPESENSE_SEARCH_ONLY_KEY`.
4. After first deploy: `pnpm search:reindex` once per environment.

### 0.3 Cloudflare R2 (media)
1. Create a bucket per environment (`waterline-media`, `waterline-media-staging`).
2. Create an R2 API token (Object Read & Write, scoped to the buckets).
3. Env: `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`;
   `NEXT_PUBLIC_CF_IMAGES_URL` if serving through Cloudflare Images.
4. §16.3: keep object keys unguessable (the upload pipeline hashes filenames).

### 0.4 Resend (transactional email)
1. Add and verify the sending domain (SPF + DKIM records).
2. Env: `RESEND_API_KEY`, `AGENCY_NOTIFY_FROM` (verified address),
   `LEAD_NOTIFY_TO` (internal desk inbox).

### 0.5 Remaining keys
- `PAYLOAD_SECRET` — 32+ random chars, per environment: `openssl rand -hex 32`
- `REVALIDATE_SECRET`, `CRON_SECRET`, `FEED_INGEST_SECRET` — same generator,
  three distinct values per environment.
- `NEXT_PUBLIC_MAPTILER_KEY` — from MapTiler Cloud (a real key; `dev_*`
  prefixes render the map fallback by design).
- `NEXT_PUBLIC_SITE_URL` — `https://staging.waterline.example` / production URL.
- `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` — production only (analytics stays off staging).
- `SENTRY_DSN` — from Sentry project settings.
- `SAMPLE_DATA_ENABLED` — `true` on staging if demo inventory is wanted,
  **`false` in production (launch-blocking, LAUNCH-CHECKLIST.md)**.
- `FX_API_KEY`, `UNSPLASH_ACCESS_KEY` — optional (currency refresh, seed images).
- `NEXT_PUBLIC_DEFAULT_LOCALE=en`.

### 0.6 Vercel project
1. Import the GitHub repo (`Fayyaz-WebPenter/WATERLINE`); framework preset Next.js.
2. **Build Command: `pnpm build:deploy`** — runs `payload migrate` before the
   build so schema changes apply with the release. (First ever deploy: generate
   the initial migration per `src/migrations/README.md` and commit it first.)
3. Enter the env vars above, scoped: Production values on Production; staging
   values on Preview (or a dedicated staging project).
4. Staging protection: Project → Deployment Protection → Password.
5. Crons are read from `vercel.json` (poll-feeds, expiry-sweep, lead-reminders,
   retention) — verify they appear under Settings → Cron Jobs; they authorize
   with `CRON_SECRET` automatically via Vercel's cron header + our route guard.
6. After first deploy: create the first admin user at `/admin`, then enrol
   TOTP 2FA for every admin/agency_admin (LAUNCH-CHECKLIST.md).

### 0.7 First-deploy smoke
```bash
curl -s https://<host>/api/health | jq .        # { ok, db: true, search: true }
curl -sI https://<host>/en | grep -i strict-transport   # §16.1 headers live
```
Then run the LAUNCH-CHECKLIST.md top section against staging.

---

## 1. Routine Deployment Flow

1. **Feature Branch & PR**:
   - Create branch `feat/<prompt-number>-<short-description>`.
   - Never commit directly to `main`.
   - Open Pull Request targeting `main`.

2. **CI Gates (Hard Blockers)**:
   Every PR must pass automated CI checks before merge:
   ```bash
   pnpm typecheck            # Zero TypeScript errors
   pnpm lint                 # Zero ESLint warnings/errors
   pnpm test                 # Unit & integration tests green
   pnpm bundle:budget        # First-load JS within §12.1 budgets:
                             #   Home < 110 kB gz
                             #   Listing < 130 kB gz
                             #   Search < 160 kB gz
   pnpm test:e2e             # Playwright critical paths & multi-tenant isolation
   lhci autorun              # Lighthouse CI (Perf ≥ 90, A11y = 100, SEO = 100)
   ```

3. **Promotion to Production**:
   - Merge PR into `main` (Squash & Merge).
   - Vercel automatically builds and deploys to production.
   - Tag commit: `git tag -a v<NN>-<name> -m "Deploy v<NN>" && git push --tags`.

---

## 2. Emergency Rollback Procedure

If a production incident occurs immediately following a deployment:

### Step 1: Instant Vercel Rollback (< 60 seconds)
1. Go to **Vercel Dashboard** → **Deployments**.
2. Identify the last known healthy deployment prior to the broken release.
3. Click **Instant Rollback** to redirect production traffic immediately.
4. Verify HTTP 200 on `https://waterline.com/api/health`.

### Step 2: Database Reversion (if migrations were applied)
If the deployment introduced schema changes:
1. Check the down-migration file paired with the release (`/src/migrations/*-down.sql`).
2. Verify pre-migration backup timestamp in `DECISIONS.md`.
3. Apply the down-migration via Neon SQL console or CLI.
4. Verify database health:
   ```bash
   curl -s -f https://waterline.com/api/health | jq .
   ```

### Step 3: Git Revert & Post-Mortem
1. Revert the bad merge commit on `main`:
   ```bash
   git revert -m 1 <commit-hash>
   git push origin main
   ```
2. Log the incident and recovery steps in [`DECISIONS.md`](file:///var/www/html/WATERLINE/DECISIONS.md).
