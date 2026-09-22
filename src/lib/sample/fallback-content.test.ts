import { beforeEach, describe, expect, it, vi } from 'vitest';

import { passesEditorialGate } from '@/lib/seo/combos';

import {
  fallbackArticle,
  fallbackArticles,
  fallbackLandingPages,
  findFallbackArticle,
  findFallbackLandingPage,
  isFallbackContent,
} from './fallback-content';

describe('fallback content (gated demo inventory)', () => {
  beforeEach(() => {
    vi.stubEnv('SAMPLE_DATA_ENABLED', 'true');
  });

  it('serves the demo article by exact slug only', () => {
    const article = fallbackArticle();
    expect(findFallbackArticle(article.slug)).toEqual(article);
    expect(findFallbackArticle('some-other-slug')).toBeNull();
  });

  it('is disabled when SAMPLE_DATA_ENABLED is not true', () => {
    vi.stubEnv('SAMPLE_DATA_ENABLED', 'false');
    expect(fallbackArticles()).toEqual([]);
    expect(findFallbackArticle(fallbackArticle().slug)).toBeNull();
    expect(fallbackLandingPages()).toEqual([]);
    expect(findFallbackLandingPage('villas-sea-liguria')).toBeNull();
  });

  it('provides a landing page for every seed combo, passing the editorial gate', () => {
    const pages = fallbackLandingPages();
    expect(pages.length).toBeGreaterThanOrEqual(15);
    for (const page of pages) {
      expect(passesEditorialGate(page)).toBe(true);
      expect(isFallbackContent(page)).toBe(true);
    }
  });

  it('matches landing combos by exact slug only', () => {
    expect(findFallbackLandingPage('villas-sea-liguria')?.slug).toBe('villas-sea-liguria');
    expect(findFallbackLandingPage('villas-sea-atlantis')).toBeNull();
  });

  it('keeps demo copy free of digits that could read as market statistics', () => {
    for (const page of fallbackLandingPages()) {
      const text = (JSON.stringify(page.intro).match(/"text":"([^"]*)"/g) ?? []).join(' ');
      expect(text.length).toBeGreaterThan(0);
      expect(text).not.toMatch(/\d/);
    }
  });
});
