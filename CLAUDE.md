# WATERLINE — project rules for AI assistants

## What this is
A worldwide property portal that lists ONLY properties with direct water access (sea, ocean, lake, river, lagoon, canal, fjord). Next.js 15 App Router + Payload 3 + Postgres/PostGIS + Typesense, deployed on Vercel.

## Non-negotiable rules
1. Performance budgets are acceptance criteria, not goals. Home first-load JS < 110KB gzip, listing < 130KB, search < 160KB. LCP < 1.2s mobile. Never add a dependency that pushes a route over budget — check with `pnpm analyze` before committing.
2. No component or route queries the database directly. Everything goes through `/src/lib/db` with explicit return types.
3. No hardcoded colours, spacing, font sizes or radii outside `/src/tokens`. ESLint enforces this; do not disable the rule.
4. Every public page is SSG or ISR. `force-dynamic` is forbidden on indexable routes.
5. Controlled enums over free text, always. If a field could be an enum, it is one.
6. The water rule: a listing cannot publish without `>=1 waterAccessType` and `distanceToWaterM <= 50`. Never weaken this validation.
7. All user-facing strings come from `/src/messages/*.json`. No literal strings in JSX.
8. Sample/demo listings always carry `isSample=true`, render a SAMPLE badge, emit `noindex`, and are excluded from sitemaps.
9. Accessibility: WCAG 2.2 AA. Every interactive element keyboard-reachable with a visible focus ring. Never ship a div with onClick.
10. Multi-agency: every query that returns listings must respect agency scoping and moderation status. An `agent` role never sees another agency's data.

## Definition of done for any task
- TypeScript compiles with zero errors (`pnpm typecheck`)
- ESLint passes (`pnpm lint`)
- Relevant tests pass (`pnpm test`), and new logic has a test
- `pnpm analyze` shows no route over its JS budget
- The feature works with JavaScript-heavy throttling (Slow 4G, 4x CPU)
- No console errors or hydration warnings

## Commands
`pnpm dev` · `pnpm build` · `pnpm typecheck` · `pnpm lint` · `pnpm test` · `pnpm test:e2e` · `pnpm analyze` · `pnpm payload generate:types` · `pnpm seed` · `pnpm sample:purge` · `pnpm search:reindex` · `pnpm audit:seo` · `pnpm audit:a11y`

## Conventions
- Server Components by default; `'use client'` only where interaction requires it.
- Data fetching in Server Components or route handlers, never in `useEffect`.
- Zod schemas shared client/server, colocated in `/src/lib/schemas`.
- File naming: kebab-case files, PascalCase components, camelCase functions.
- Commits: conventional commits (`feat:`, `fix:`, `perf:`, `chore:`, `docs:`).
