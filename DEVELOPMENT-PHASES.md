# WATERLINE — Complete Development Phases

## Phase 0 — Project Governance & Environment
**Goal**: Establish the rules before writing application code.

### Tasks
- [ ] Initialize Git repository
- [ ] Install/verify Node + pnpm
- [ ] Create `CLAUDE.md`
- [ ] Create `.cursor/rules/waterline.mdc`
- [ ] Create `DECISIONS.md`
- [ ] Define branch strategy
- [ ] Define environment-variable strategy
- [ ] Define development/staging/production environments
- [ ] Decide local Docker vs cloud development services
- [ ] Verify Next.js 15 / Payload 3 compatibility

### Deliverable
```
WATERLINE/
├── CLAUDE.md
├── DECISIONS.md
├── .cursor/
│   └── rules/
│       └── waterline.mdc
└── .git/
```
**Gate**: No feature development until governance files exist.

---

## Phase 1 — Foundation & Infrastructure

### Prompt 1 — Application Scaffold
Build the actual application foundation.

**Stack**:
- Next.js 15 App Router
- TypeScript strict
- Payload CMS 3
- PostgreSQL 16
- PostGIS
- Typesense
- Tailwind CSS v4
- Zod
- Docker Compose
- CI

**Implement**:
```
src/
├── app/
├── components/
├── config/
├── lib/
├── collections/
├── hooks/
├── providers/
└── types/
```

Also:
- `docker-compose.yml`
- `.env.example`
- Zod environment validation
- Payload configuration
- `/api/health`
- CI checks (TypeScript, ESLint, testing foundation)

**Gate**:
`pnpm typecheck` && `pnpm lint` && `pnpm test` && `pnpm build` (All must pass).

### Prompt 2 — Design System
Create the visual foundation before building pages.

**Implement**:
- Design tokens (`/src/tokens/tokens.ts`)
- Tailwind v4 integration
- Colors, Spacing, Radius, Shadows
- Typography (Inter body font, Display serif font)
- Base components (Buttons, Inputs, Cards, Badges, Modal, Dropdown, Tabs, Skeletons, Loading states, Error states)
- Create `/dev/styleguide` route for visual reference.

**Gate**: Components must use tokens instead of random hard-coded styling.

---

## Phase 2 — Data & Backend Architecture

### Prompt 3 — Property System
Create the main `Property` Payload collection.

**Important fields**:
`title`, `slug`, `description`, `price`, `currency`, `location`, `coordinates`, `water access`, `water body`, `distance to water`, `berth information`, `yacht dimensions`, `amenities`, `media`, `agency`, `agent`, `status`

**Critical Validation**:
Publishing requires:
`waterAccessType.length >= 1` AND `distanceToWaterM <= 50`

Validation must exist server-side/Payload-side so the frontend cannot bypass it.

Also implement:
- FX conversion & price normalization
- Validation hooks
- Slug generation
- Audit information

**Gate**: Automated tests must prove invalid properties cannot publish.

### Prompt 4 — Supporting Collections & Multi-Tenancy
Implement:
`Media`, `Agency`, `Agent`, `Lead`, `LandingPage`, `Destination`, `WaterBody`, `User`, `AuditLog`

Implement **Multi-Tenancy**: Agencies must only access their own permitted data.

**Gate**: Access-control integration tests.

### Prompt 5 — Database & Search Layer
Build the application's data-access abstraction in `/src/lib/db/`.

**Implement**:
- PostgreSQL access & PostGIS spatial helpers (radius, bounding-box, distance calculations)
- Typesense integration (indexing, filtering, sorting)
- PostgreSQL fallback path when Typesense is unreachable

**Gate**: Unit & integration tests for search, fallback, and geo queries.

---

## Phase 3 — Internationalization & Core User Experience

### Prompt 6 — i18n + Currency + Units
- Localize into `en`, `it`, `fr`, `de`, `es`, `ru` using `next-intl`.
- EUR default with daily FX conversion snapshot.
- Metric/imperial unit toggle stored in cookie.
- Localized numbers, dates, and locale-aware URL routing.

**Gate**: No hard-coded user-facing strings where localization is required.

---

## Phase 4 — Search & Property Discovery

### Prompt 7 — Search Experience
Build `/[locale]/search` with virtualized property list + MapLibre GL split map.
Features:
- Live facet counts, price, location, water type, distance to water, bedrooms, amenities.
- **Yacht compatibility filter ("Will my yacht fit?")**: LOA, draft, beam, bridge clearance, berth length.

### Prompt 8 — Property Detail
Build `/[locale]/property/[slug]` (SSG + ISR 600s).
Include image gallery, water credentials table, yacht compatibility panel, agency details, contact form, static map, and JSON-LD RealEstateListing schema.

### Prompt 9 — Homepage
Build `/[locale]` homepage featuring hero LCP element, featured listings, destinations, and interactive "Will it fit?" yacht search strip.

---

## Phase 5 — SEO & Destination Architecture

### Prompt 10 — Programmatic SEO & Destination Hub
Build `/[locale]/waterfront/[combo]` and destination hub (`/[locale]/destinations`).
Implement canonical URLs, metadata helpers, breadcrumbs, structured JSON-LD, internal linking, and sitemap integration.

---

## Phase 6 — Agency & Business Workflows

### Prompt 11 — Multi-Agency Import & Feeds
Build bulk import (CSV/XLSX) and feed ingestion (Kyero XML / generic JSON) with dry-run validation, column error reports, deduplication, feed polling, moderation queue, and listing expiry sweeps.

---

## Phase 7 — Leads & Conversion

### Prompt 12 — Lead Routing & Cookie Consent
Build inquiry workflow (`Visitor → Property → Inquiry → Lead → Agency → Agent`) with email notifications via Resend, honeypot/rate-limiting, consent logging, and non-blocking cookie consent banner.

---

## Phase 8 — Content & Sample Data

### Prompt 13 — Sample Data Generator
Deterministic sample generator script (`pnpm seed`, `pnpm sample:purge`) producing 60 realistic properties, 12 destinations, water bodies, agencies, agents, and media with `isSample=true` and `noindex`.

---

## Phase 9 — AI / Discovery Layer

### Prompt 14 — SEO & AI Discovery Layer
Implement dynamic OG images, sitemap index, `robots.txt` AI crawler policies, `llms.txt` / `llms-full.txt`, 301/410 lifecycle rules, and public aggregate API endpoints.

---

## Phase 10 — Brochures & Dashboards

### Prompt 15 — Property Brochure PDF & Dashboards
- `@react-pdf/renderer` brochure generator at `/api/property/[slug]/brochure.pdf`.
- Agency and Admin analytics dashboards using Recharts.

---

## Phase 11 — Accessibility Pass

### Prompt 16 — WCAG 2.2 AA Compliance
Bring all routes to WCAG 2.2 AA standard. Run automated axe-core Playwright checks across 8 key routes and manual keyboard navigation scripts.

---

## Phase 12 — Performance Engineering

### Prompt 17 — Performance Optimization
Enforce performance budgets (Home JS < 110KB, Listing < 130KB, Search < 160KB). Optimize images, bundle sizes, static generation, edge caching, and Lighthouse CI thresholds.

---

## Phase 13 — Security & Production Hardening

### Prompt 18 — Security Audit & Privacy
Strict CSP headers, 2FA, rate limiting, Sentry error monitoring with PII scrubbing, granular cookie consent, lead anonymization, and anti-scraping rules.

---

## Phase 14 — Production Layer

### Prompt 19 — Operational Runbooks & Final Analytics
Final SEO audit, error tracking setup, sitemap verification, edge caching headers, monitoring, and runbooks.

---

## Phase 15 — Deployment

### Prompt 20 — Production Staging & Launch
Deploy to Vercel (Next.js + Payload), Neon (Postgres + PostGIS), Typesense Cloud, Cloudflare R2/Images, and Resend. Configure dev, staging, and production environments.

---

## Phase 16 — Final QA & Launch Gate

Run comprehensive acceptance criteria checklist across functional, technical, accessibility, security, and performance domains before DNS cutover.

---

## 🗺️ Overall Dependency Map

```
PHASE 0 (Governance)
   │
   ▼
PHASE 1 (Infrastructure & Design System)
   │
   ▼
PHASE 2 (Data + Waterfront Rules)
   │
   ▼
PHASE 3 (i18n + Core UX)
   │
   ▼
PHASE 4 (Search + Property Pages)
   │
   ▼
PHASE 5 (SEO + Destinations)
   │
   ├───────────────┐
   ▼               ▼
PHASE 6          PHASE 7
(Agencies)       (Leads)
   │               │
   └───────┬───────┘
           ▼
PHASE 8 (Sample / Data Operations)
           │
           ▼
PHASE 9 (AI Discovery)
           │
           ▼
PHASE 10 (Brochures & Dashboards)
           │
           ▼
PHASE 11 (Accessibility)
           │
           ▼
PHASE 12 (Performance)
           │
           ▼
PHASE 13 (Security)
           │
           ▼
PHASE 14 (SEO & Analytics)
           │
           ▼
PHASE 15 (Deployment)
           │
           ▼
PHASE 16 (QA + Launch Gate)
```
