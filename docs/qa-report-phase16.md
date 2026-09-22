# Phase 16 — Final QA Gate Report

**Date:** 2026-09-22 · **Commit under test:** post-`efdb68f` working tree ·
**Environment:** development sandbox (no database/search services — DB-backed
items run in GitHub Actions' service containers and on staging)

Every LAUNCH-CHECKLIST.md item mapped to one of:
**✅ VERIFIED-LOCAL** (executed here, this run) · **🔄 CI** (verified by the
GitHub Actions pipeline with real Postgres/Typesense) · **⏳ STAGING** (needs
the deployed environment) · **👤 CLIENT** (an account/action only the owner
can perform).

## Critical hard gates

| Item | Status | Evidence |
|---|---|---|
| No sample listings in production index | ⏳ STAGING | `pnpm sample:purge` + SQL count run at cutover; admin dashboard shows a sample-leak alert if violated |
| `SAMPLE_DATA_ENABLED=false` in production | 👤 CLIENT | Vercel env (deploy.md §0.5) |
| Clean CI pipeline | 🔄 CI + ✅ local mirror | This run: typecheck ✓, lint ✓, 218 unit tests ✓, budgets ✓, full e2e ✓ (see below), dep audit exit 0 ✓ |

## 1 · Performance & budgets

| Item | Status | Evidence |
|---|---|---|
| First-load JS budgets | ✅ | home **109.6/110**, search **110.4/160**, listing **124.7/130** kB gz (true gzip, prod build) |
| 50 kB dependency tripwire fails CI | ✅ | `--simulate-50kb` → exit 1 |
| Core Web Vitals (LCP<1.2s, CLS, INP) | ⏳ STAGING | Real-network numbers need the CDN; lab proxy: Lighthouse CI asserts LCP≤1200 ms |
| Lighthouse assertions (A11y=100, SEO=100…) | 🔄 CI | lhci job with service containers; unattainable in the font-stubbed sandbox |

## 2 · Search & discovery

| Item | Status | Evidence |
|---|---|---|
| Filter facets correct | ✅ (fallback data) + 🔄 CI (DB) | phase4/phase5 e2e + unit filter-translation tests |
| Nautical LOA/draft/beam filter | ✅ | unit tests + phase4 e2e |
| Map ssr:false, markers, hover sync | ✅ code-level; ⏳ STAGING visual | MapLibre 6.10 upgrade needs one visual pass with a live MapTiler key (checklist item) |

## 3 · Multi-agency backoffice

| Item | Status | Evidence |
|---|---|---|
| RBAC (admin / agency_admin / agency_agent) | 🔄 CI | `tests/int/tenancy.int.spec.ts` — cross-agency listings/leads/profile denial, publish rights |
| CSV import + dry-run | 🔄 CI | `tests/int/*` + import unit tests |
| Feed ingestion + fingerprint dedupe | 🔄 CI | token-auth e2e (401 verified locally) + unit fingerprint tests |
| Moderation queue | 🔄 CI | int tests; pre-checks unit-tested locally ✓ |
| Expiry sweep scheduled | ✅ | `vercel.json` crons (incl. retention 45 3 * * *); CRON_SECRET guard e2e ✓ |

## 4 · Content & localization

| Item | Status | Evidence |
|---|---|---|
| 6 locales routed | ✅ | i18n e2e 12/12; all 214 UI strings translated (de/es/fr/it/ru), zero empty values (unit-enforced) |
| Hreflang on public pages | ✅ | phase9 e2e + audit:seo |
| Currency conversion | ✅ | FX snapshot unit tests; switcher e2e |
| Metric/imperial cookie toggle | ✅ | unit + e2e |

## 5 · SEO & AI discovery

| Item | Status | Evidence |
|---|---|---|
| Combo pages with valid copy | ⏳ STAGING/👤 | pages publish via CMS after the sourced editorial pass (§13.9); engine fully tested with demo fallback |
| Sitemaps valid, 0 broken links | ✅ | phase14 e2e + audit:seo over sitemap |
| `pnpm audit:seo` 0 errors | ✅ | **0 errors, 0 warnings** after lengthening two legal meta descriptions this run |
| JSON-LD schemas valid | ✅ | phase9 e2e + unit builders |
| llms.txt / robots.txt | ✅ | 200 + content e2e |

## 6 · Accessibility

| Item | Status | Evidence |
|---|---|---|
| Zero axe violations on 8 routes | ✅ (7 routes) + 🔄 CI (admin login) | a11y e2e both browser profiles |
| Keyboard-only search + enquiry | ✅ | phase11 §15 journeys |
| Focus rings, target sizes, contrast | ✅ | axe + styleguide focus test |
| Human screen-reader pass | ⏳ STAGING | recommended at sign-off (DECISIONS Prompt 16g) |

## 7 · Leads & privacy

| Item | Status | Evidence |
|---|---|---|
| /api/leads honeypot + rate limit | ✅ | phase7 e2e (6th POST → 429) |
| Resend notifications | ⏳ STAGING | needs RESEND_API_KEY + verified domain; seam no-ops loudly without |
| Consent banner granular, non-blocking | ✅ | phase7 e2e |
| One-click GDPR anonymisation | ✅ auth-gating; 🔄 CI full flow | 401 unauth verified; `tests/int/privacy.int.spec.ts` in CI |

## 8 · Production hardening & operations

| Item | Status | Evidence |
|---|---|---|
| Strict CSP + full header set | ✅ | live on the prod build this run (CSP/HSTS/XCTO/XFO/Referrer/Permissions/COOP); zero CSP violations e2e |
| Signed /api/revalidate | ✅ | phase12 e2e (401/400/200 paths) |
| Edge cache headers | ✅ config; ⏳ STAGING HIT check | next.config headers verified in responses |
| Sentry + Plausible, zero PII | ✅ code + tests; 👤 DSN/domain | scrubbers unit-tested; consent-gated loader e2e |
| Runbooks published | ✅ | 5 runbooks + provisioning §0 |
| PITR/backups | 👤 CLIENT | Neon setting |
| **DB migrations exist & apply on deploy** | 👤 CLIENT (one command) | workflow shipped in Phase 15; initial migration must be generated against the first live DB (`src/migrations/README.md`) |
| TOTP 2FA enrolment | ⏳ STAGING | after first deploy |
| Visual-regression baselines | 🔄 CI | `VISUAL=1` harness ready |
| Uptime monitor on /api/health | 👤 CLIENT | health endpoint verified this run |

## Full e2e suite (this run)

Recorded in the commit message / CI logs — the suite that ran with this
report covers phases 4–14, i18n, a11y (8 routes), console-errors, health and
visual harness gating, on desktop + mobile Chrome.

## Verdict

**Everything executable without cloud credentials passes.** No code defects
open. The path to DNS cutover is exactly the ⏳/👤 items above — all of them
provisioning or staging-verification steps documented in
`docs/runbooks/deploy.md` §0 and re-checked by this checklist against the
staging URL.
