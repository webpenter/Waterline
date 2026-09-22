import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * §15 / Prompt 16: automated axe-core checks on the 8 routes the spec names —
 * home, search, listing, landing, journal article, contact, list-with-us and
 * the admin login. Zero violations is the acceptance criterion.
 */

const ROUTES: Array<{ name: string; path: string }> = [
  { name: 'home', path: '/en' },
  { name: 'search', path: '/en/search?water=sea&boatLoa=24' },
  { name: 'listing', path: '/en/property/sample-wl-sample-001' },
  { name: 'landing', path: '/en/waterfront/villas-sea-liguria' },
  { name: 'journal article', path: '/en/journal/sample-mooring-rights-private-berth' },
  { name: 'contact', path: '/en/contact' },
  { name: 'list-with-us', path: '/en/list-with-us' },
];

test.describe('Accessibility', () => {
  for (const route of ROUTES) {
    test(`${route.name} has no automatically detectable a11y violations`, async ({ page }) => {
      await page.goto(route.path);
      const results = await new AxeBuilder({ page }).analyze();
      expect(results.violations).toEqual([]);
    });
  }

  test('admin login has no automatically detectable a11y violations', async ({ page }) => {
    // The Payload admin needs a database; in DB-less sandboxes the route
    // errors and the check is skipped. CI (service containers) always runs it.
    const response = await page.goto('/admin/login');
    test.skip(
      !process.env.CI && (response == null || response.status() >= 500),
      'Payload admin unavailable without a database',
    );
    await page.waitForLoadState('networkidle');
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });

  test('styleguide has no automatically detectable a11y violations', async ({ page }) => {
    await page.goto('/dev/styleguide');
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });

  test('tabbing into the styleguide shows a visible focus ring', async ({ page }) => {
    await page.goto('/dev/styleguide');
    await page.keyboard.press('Tab');
    const outlineWidth = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el) return '0px';
      return getComputedStyle(el).outlineWidth;
    });
    expect(outlineWidth).not.toBe('0px');
  });
});
