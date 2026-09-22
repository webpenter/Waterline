import { describe, expect, it } from 'vitest';

import { chunkEntries, escapeXml, sitemapIndexXml, urlsetXml } from './sitemap';

describe('sitemap builders (§14)', () => {
  it('escapes XML-hostile characters', () => {
    expect(escapeXml(`Côte <d'Azur> & "waterfront"`)).toBe(
      'Côte &lt;d&apos;Azur&gt; &amp; &quot;waterfront&quot;',
    );
  });

  it('chunks at the 50k limit and never returns zero chunks', () => {
    expect(chunkEntries([], 3)).toEqual([[]]);
    expect(chunkEntries([1, 2, 3, 4, 5, 6, 7], 3).map((c) => c.length)).toEqual([3, 3, 1]);
  });

  it('urlset carries loc, lastmod and all locale alternates', () => {
    const xml = urlsetXml([
      { path: '/property/villa-portofino', lastmod: '2026-09-22T10:00:00.000Z' },
    ]);
    expect(xml).toContain('<loc>');
    expect(xml).toContain('/en/property/villa-portofino</loc>');
    expect(xml).toContain('<lastmod>2026-09-22T10:00:00.000Z</lastmod>');
    for (const locale of ['en', 'it', 'fr', 'de', 'es', 'ru', 'x-default']) {
      expect(xml).toContain(`hreflang="${locale}"`);
    }
  });

  it('index points at typed children', () => {
    const xml = sitemapIndexXml([{ name: 'properties' }, { name: 'landing' }]);
    expect(xml).toContain('/sitemaps/properties.xml');
    expect(xml).toContain('/sitemaps/landing.xml');
    expect(xml).toContain('<sitemapindex');
  });
});
