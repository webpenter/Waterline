import { test, expect } from '@playwright/test';

// Phase 5 live acceptance (§5.4, §10.4/§10.5): the engine's gates and
// canonicalisation, verifiable without inventory.

test('destinations hub renders with h1 and hreflang', async ({ page }) => {
  await page.goto('/en/destinations');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Waterfront destinations');
  await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveCount(1);
});

test('an unpublished/unknown combo 404s (§5.4 gate)', async ({ request }) => {
  const response = await request.get('/en/waterfront/villas-sea-liguria');
  expect(response.status()).toBe(404);
});

test('alias combos 301 to the canonical slug before gating', async ({ request }) => {
  const response = await request.get('/en/waterfront/villa-sea-liguria', {
    maxRedirects: 0,
  });
  expect(response.status()).toBe(308);
  expect(response.headers()['location']).toContain('/en/waterfront/villas-sea-liguria');
});

test('unknown destination slugs 404', async ({ request }) => {
  const response = await request.get('/en/destinations/atlantis');
  expect(response.status()).toBe(404);
});
