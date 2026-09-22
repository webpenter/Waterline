import { test, expect } from '@playwright/test';

// Phase 4 live acceptance: home (Prompt 9), search (Prompt 7), detail (Prompt 8).

test.describe('Home (§10.1)', () => {
  test('hero carries the copy deck and the boat-length search field', async ({ page }) => {
    await page.goto('/en');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Property where the water begins.',
    );
    await expect(page.locator('input[name="boatLoa"]')).toBeVisible();
  });

  test('the hero search form lands on /search with the URL contract', async ({ page }) => {
    await page.goto('/en');
    await page.locator('select[name="water"]').selectOption('sea');
    await page.locator('input[name="boatLoa"]').fill('24');
    await page.getByRole('button', { name: 'Search waterfront' }).click();
    await page.waitForURL('**/en/search**');
    const url = new URL(page.url());
    expect(url.searchParams.get('water')).toBe('sea');
    expect(url.searchParams.get('boatLoa')).toBe('24');
  });

  test('the Will-it-fit slider updates the result line instantly', async ({ page }) => {
    await page.goto('/en');
    const slider = page.getByRole('slider', { name: 'Boat length' });
    await slider.fill('40');
    await expect(page.locator('section', { hasText: 'Will it fit?' })).toContainText('40');
  });

  test('water tiles link into filtered search', async ({ page }) => {
    await page.goto('/en');
    await expect(page.locator('a[href*="water=lagoon"]').first()).toBeVisible();
    await expect(page.locator('a[href*="type=private_island"]').first()).toBeVisible();
  });
});

test.describe('Search (§10.2 / §5.5)', () => {
  test('renders the aria-live result count and sort control', async ({ page }) => {
    await page.goto('/en/search');
    await expect(page.locator('[aria-live="polite"]').first()).toContainText('properties');
    await expect(page.getByRole('combobox').first()).toBeVisible();
  });

  test('active filters appear as removable pills', async ({ page }) => {
    await page.goto('/en/search?water=sea&boatLoa=24&draft=2.5&minFrontage=25');
    await expect(page.getByRole('link', { name: /Fits 24 m · draft 2.5 m/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /Frontage ≥ 25 m/ })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Clear all filters' }).first()).toBeVisible();
  });

  test('removing a pill drops exactly that filter from the URL', async ({ page }) => {
    await page.goto('/en/search?water=sea&minFrontage=25');
    await page.getByRole('link', { name: /Frontage ≥ 25 m/ }).click();
    await page.waitForURL('**/en/search?water=sea');
    expect(new URL(page.url()).searchParams.get('minFrontage')).toBeNull();
    expect(new URL(page.url()).searchParams.get('water')).toBe('sea');
  });

  test('sort selection writes the sort param and survives back/forward', async ({ page }) => {
    await page.goto('/en/search?water=sea');
    await page.getByRole('combobox').first().selectOption('frontage_desc');
    await page.waitForURL('**sort=frontage_desc**');
    await page.goBack();
    await page.waitForURL((url) => !url.searchParams.has('sort'));
    expect(new URL(page.url()).searchParams.get('water')).toBe('sea');
  });

  test('filtered search pages are noindex,follow (§5.5)', async ({ page }) => {
    await page.goto('/en/search?water=sea');
    const robots = page.locator('meta[name="robots"]');
    await expect(robots).toHaveAttribute('content', /noindex/);
    await expect(robots).toHaveAttribute('content', /follow/);
  });
});

test.describe('Listing detail (§10.3)', () => {
  test('unknown slugs 404', async ({ request }) => {
    const response = await request.get('/en/property/does-not-exist');
    expect(response.status()).toBe(404);
  });
});
