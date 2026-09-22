# WATERLINE Runbook — Deployment & Rollback

> **SLA**: 99.9% availability target  
> **Platform**: Vercel (Next.js 15 App Router + Payload 3)  
> **Repository Rules**: Spec §1.2, §19, CLAUDE.md

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
