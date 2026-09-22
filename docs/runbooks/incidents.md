# WATERLINE Runbook — Incident Response Protocol

> **Availability SLA**: 99.9% Target (Max ~43 minutes downtime/month)  
> **Monitoring**: Sentry (Errors/Performance) + Plausible (Traffic) + Uptime Robot (5-min HTTP ping)  
> **Spec**: §16, §19

---

## 1. Severity Levels

| Severity | Definition | Target Response | Target Resolution |
|---|---|---|---|
| **P1 - Critical** | Production site down, search returning 500s, or lead intake completely broken. | < 15 minutes | < 1 hour |
| **P2 - Major** | Degraded search performance, sample data leakage, or admin login failure. | < 30 minutes | < 4 hours |
| **P3 - Minor** | Minor styling inconsistency, single locale translation typo, non-critical cron warning. | < 4 hours | < 2 business days |

---

## 2. P1 Incident Response Steps

1. **Acknowledge & Triage**:
   - Check Sentry dashboard for active issue spikes.
   - Check Vercel deployment status and Neon database connectivity.
   - Verify health check endpoint: `https://waterline.com/api/health`.

2. **Mitigate Immediately**:
   - **If caused by recent deployment**: Trigger Vercel Instant Rollback (see `deploy.md`).
   - **If database connection exhausted**: Restart pool / check Neon compute metrics.
   - **If Typesense down**: Confirm Postgres fallback is serving results (see `search-index.md`).

3. **Status Communication**:
   - Update internal stakeholders with incident status every 30 minutes.

4. **Post-Mortem & Resolution**:
   - Identify root cause (code bug, third-party dependency, configuration drift).
   - Write regression tests preventing recurrences.
   - Record incident post-mortem in [`DECISIONS.md`](file:///var/www/html/WATERLINE/DECISIONS.md).
