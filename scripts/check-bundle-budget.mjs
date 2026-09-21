import { execSync } from 'node:child_process';

// Budgets from CLAUDE.md's non-negotiable rule #1. Routes not listed here are unbudgeted (yet).
const BUDGETS_KB = {
  '/': 110,
  '/[locale]': 110,
  '/[locale]/property/[slug]': 130,
  '/[locale]/search': 160,
};

const ROUTE_LINE = /^[│├└┌]\s*[○ƒ●]\s+(\S+)\s+[\d.]+\s\w+\s+([\d.]+)\s(k?B)$/;

function parseFirstLoadJs(buildOutput) {
  const results = [];
  for (const line of buildOutput.split('\n')) {
    const match = ROUTE_LINE.exec(line.trim());
    if (!match) continue;
    const [, route, sizeValue, unit] = match;
    const kb = unit === 'kB' ? Number(sizeValue) : Number(sizeValue) / 1000;
    results.push({ route, kb });
  }
  return results;
}

const buildOutput = execSync('pnpm exec next build', {
  encoding: 'utf8',
  env: { ...process.env, NEXT_TELEMETRY_DISABLED: '1' },
});
process.stdout.write(buildOutput);

const routes = parseFirstLoadJs(buildOutput);
if (routes.length === 0) {
  console.error('check-bundle-budget: could not parse any routes from the build output.');
  process.exit(1);
}

let failed = false;
for (const { route, kb } of routes) {
  const budget = BUDGETS_KB[route];
  if (budget === undefined) continue;
  const status = kb <= budget ? 'OK' : 'OVER BUDGET';
  console.log(`[bundle-budget] ${route}: ${kb}kB / ${budget}kB — ${status}`);
  if (kb > budget) failed = true;
}

if (failed) {
  console.error('\nOne or more routes exceeded their JS budget.');
  process.exit(1);
}

console.log('\nAll budgeted routes are within their JS budget.');
