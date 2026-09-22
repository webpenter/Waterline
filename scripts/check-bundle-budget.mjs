import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';

// Budgets from CLAUDE.md rule 1, measured the way the spec states them:
// gzipped bytes of every first-load JS chunk, computed from the app build
// manifest — not Next's table estimates.
const BUDGETS_KB = {
  '/(frontend)/[locale]/page': { label: 'home', budget: 110 },
  '/(frontend)/[locale]/search/page': { label: 'search', budget: 160 },
  '/(frontend)/[locale]/property/[slug]/page': { label: 'listing', budget: 130 },
};

const SHARED_LAYOUT = '/(frontend)/[locale]/layout';

if (!existsSync('.next/app-build-manifest.json') || process.env.BUDGET_SKIP_BUILD !== '1') {
  execSync('pnpm build', { stdio: 'inherit', env: { ...process.env, NEXT_TELEMETRY_DISABLED: '1' } });
}

const manifest = JSON.parse(readFileSync('.next/app-build-manifest.json', 'utf8'));

function gzKb(routeKeys) {
  const files = [
    ...new Set(routeKeys.flatMap((key) => manifest.pages[key] ?? [])),
  ].filter((f) => f.endsWith('.js'));
  if (files.length === 0) return null;
  let bytes = 0;
  for (const f of files) {
    if (!existsSync(`.next/${f}`)) {
      // Unhashed filenames appear when a dev server rewrote the manifest —
      // measuring a dev build would be meaningless.
      throw new Error(
        `Chunk ${f} missing on disk: .next is not a clean production build. Run without BUDGET_SKIP_BUILD.`,
      );
    }
    bytes += gzipSync(readFileSync(`.next/${f}`), { level: 9 }).length;
  }
  return bytes / 1024;
}

let failed = false;
for (const [route, { label, budget }] of Object.entries(BUDGETS_KB)) {
  const size = gzKb([route, SHARED_LAYOUT]);
  if (size === null) {
    console.log(`[bundle-budget] ${label}: route not present in this build — skipped`);
    continue;
  }
  const ok = size <= budget;
  console.log(
    `[bundle-budget] ${label}: ${size.toFixed(1)} kB gz / ${budget} kB — ${ok ? 'OK' : 'OVER BUDGET'}`,
  );
  if (!ok) failed = true;
}

if (failed) {
  console.error('\nOne or more routes exceeded their gzipped first-load JS budget.');
  process.exit(1);
}
console.log('\nAll budgeted routes are within their gzipped JS budget.');
