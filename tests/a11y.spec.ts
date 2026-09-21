import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility', () => {
  test('homepage has no automatically detectable a11y violations', async ({ page }) => {
    await page.goto('/');
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
