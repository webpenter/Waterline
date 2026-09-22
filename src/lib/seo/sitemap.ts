import { brand } from '@/config/brand';
import { LOCALES } from '@/i18n/routing';

/**
 * §14 sitemaps: an index of typed children, ≤50,000 URLs per child, correct
 * lastmod, every URL carrying its locale alternates. Pure builders — routes
 * feed them data, tests feed them fixtures.
 */

export const SITEMAP_URL_LIMIT = 50_000;

export interface SitemapEntry {
  /** Locale-less path, e.g. '/property/villa-portofino'. */
  path: string;
  lastmod?: string;
}

export function siteBase(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? brand.siteUrl).replace(/\/$/, '');
}

export function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function chunkEntries<T>(entries: T[], limit = SITEMAP_URL_LIMIT): T[][] {
  if (entries.length === 0) return [[]];
  const chunks: T[][] = [];
  for (let i = 0; i < entries.length; i += limit) {
    chunks.push(entries.slice(i, i + limit));
  }
  return chunks;
}

function urlBlock(entry: SitemapEntry): string {
  const base = siteBase();
  const suffix = entry.path === '/' ? '' : entry.path;
  const loc = `${base}/en${suffix}`;
  const alternates = [
    ...LOCALES.map(
      (locale) =>
        `    <xhtml:link rel="alternate" hreflang="${locale}" href="${escapeXml(`${base}/${locale}${suffix}`)}"/>`,
    ),
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(loc)}"/>`,
  ].join('\n');
  const lastmod = entry.lastmod
    ? `\n    <lastmod>${escapeXml(new Date(entry.lastmod).toISOString())}</lastmod>`
    : '';
  return `  <url>\n    <loc>${escapeXml(loc)}</loc>${lastmod}\n${alternates}\n  </url>`;
}

export function urlsetXml(entries: SitemapEntry[]): string {
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...entries.map(urlBlock),
    '</urlset>',
  ].join('\n');
}

export function sitemapIndexXml(children: Array<{ name: string; lastmod?: string }>): string {
  const base = siteBase();
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...children.map((child) => {
      const lastmod = child.lastmod
        ? `\n    <lastmod>${escapeXml(new Date(child.lastmod).toISOString())}</lastmod>`
        : '';
      return `  <sitemap>\n    <loc>${escapeXml(`${base}/sitemaps/${child.name}.xml`)}</loc>${lastmod}\n  </sitemap>`;
    }),
    '</sitemapindex>',
  ].join('\n');
}
