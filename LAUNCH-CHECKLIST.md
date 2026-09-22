# WATERLINE — Launch Checklist & Definition of Done

This document implements **Spec §19 (Content Freeze & Launch Protocol)** and **Spec §20 (Definition of Done)**. Every item must be verified and checked off prior to production DNS cutover.

---

## 🚫 Critical Hard Gates (Zero Exceptions)

- [ ] **No Sample Listings in Production Index**:
  - `pnpm sample:purge` executed against production database.
  - Verification query confirms `SELECT count(*) FROM properties WHERE is_sample = true;` returns 0.
- [ ] **Sample Mode Disabled**:
  - `SAMPLE_DATA_ENABLED=false` set in production environment variables.
- [ ] **Clean CI Quality Pipeline**:
  - All CI steps passing: `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm bundle:budget`, `pnpm test:e2e`, and `lhci autorun`.

---

## 📋 Definition of Done Checklist (§20)

### 1. Performance & Budgets (§12.1)
- [ ] **First-load JS budgets met**:
  - Home: < 110 kB gz (current: ~108.9 kB gz)
  - Search: < 160 kB gz (current: ~109.6 kB gz)
  - Listing: < 130 kB gz (current: ~122.8 kB gz)
- [ ] **Core Web Vitals**:
  - LCP < 1.2s mobile (throttled 4G)
  - CLS < 0.02
  - INP < 150ms
- [ ] **Lighthouse CI hard assertions**:
  - Accessibility = 100 on Home, Search, Listing
  - Performance ≥ 90
  - SEO = 100
  - Best Practices ≥ 95

### 2. Search & Discovery Experience
- [ ] All filter facets (water body, access, price, bedrooms, amenities) return correct listings and counts.
- [ ] Nautical filter ("Will my yacht fit?": LOA, draft, beam) correctly filters matching berths/moorings.
- [ ] MapLibre GL dynamic split map loads on demand (`ssr: false`) with responsive markers and synchronized hover state.

### 3. Multi-Agency Backoffice & Workflows
- [ ] Role-based access control verified:
  - `admin`: Full portal access.
  - `agency_admin`: Can manage listings, agents, and leads belonging strictly to their own agency.
  - `agency_agent`: Can view assigned leads and edit own listings.
- [ ] Bulk CSV import working with dry-run error reports and column validation.
- [ ] XML/JSON feed ingestion operational with deduplication fingerprinting.
- [ ] Moderation queue workflow operational (`unreviewed` → `approved`/`rejected`).
- [ ] Listing expiry sweeps scheduled (`30 4 * * *`) and active.

### 4. Content & Localization
- [ ] 6 supported locales (`en`, `it`, `fr`, `de`, `es`, `ru`) fully routed with `next-intl`.
- [ ] Hreflang alternates (`rel="alternate" hreflang="..."`) on all public pages.
- [ ] Currency conversion with daily EUR snapshot (`EUR`, `USD`, `GBP`, `CHF`, `AED`, `CAD`).
- [ ] Metric / Imperial unit toggle (`m` vs `ft`, `sqm` vs `sqft`) stored in cookies.

### 5. Programmatic SEO & AI Discovery
- [ ] Programmatic waterfront combo pages (`/waterfront/[combo]`) published with valid copy.
- [ ] Sitemaps (`/sitemap.xml` + child sitemaps) returning valid XML with 0 broken links.
- [ ] `pnpm audit:seo` passes with 0 errors.
- [ ] Structured JSON-LD schemas (`RealEstateListing`, `BreadcrumbList`, `Organization`, `WebSite`, `FAQPage`) valid.
- [ ] AI discovery endpoints (`/llms.txt`, `/llms-full.txt`, `robots.txt`) served and crawler policies enforced.

### 6. Accessibility (WCAG 2.2 AA)
- [ ] Zero axe-core violations on all 8 core routes.
- [ ] Keyboard-only user can perform a search and complete an enquiry form.
- [ ] Visible focus rings on all interactive elements.
- [ ] Target sizes ≥ 24px and contrast ratios ≥ 4.5:1.

### 7. Lead Generation & Privacy Compliance
- [ ] Lead intake endpoint `/api/leads` honeypotted and rate-limited.
- [ ] Transactional enquiry notification via Resend operational.
- [ ] Cookie consent banner non-blocking with granular analytics/marketing preferences.
- [ ] One-click GDPR lead anonymization action operational in admin.

### 8. Production Hardening & Operations
- [ ] Strict Content Security Policy (CSP) headers enabled.
- [ ] Signed ISR revalidation webhook `/api/revalidate` operational.
- [ ] Edge cache headers (`s-maxage`, `stale-while-revalidate`) verified.
- [ ] Sentry error logging and Plausible analytics live (zero PII in events).
- [ ] Operational runbooks published in `/docs/runbooks/`.
- [ ] 7-day PITR and automated Neon backups verified.
- [ ] TOTP 2FA enrolled for every `admin` and `agency_admin` account (deploy-time plugin — see DECISIONS.md Prompt 18 entry).
- [ ] Visual-regression baselines generated in CI (`VISUAL=1`, `tests/visual.spec.ts`) and diffs green on the release candidate.
- [ ] MapTiler key live and the map visually verified after the MapLibre 6 upgrade.
- [ ] External uptime monitor pointed at `/api/health` and alerting.
