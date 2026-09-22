import { NextResponse } from 'next/server';

import { sitemapIndexXml } from '@/lib/seo/sitemap';

export const revalidate = 3600;

// §14: sitemap index; children are split by content type.
export function GET(): NextResponse {
  const xml = sitemapIndexXml([
    { name: 'static' },
    { name: 'properties' },
    { name: 'landing' },
    { name: 'destinations' },
    { name: 'articles' },
  ]);
  return new NextResponse(xml, {
    headers: { 'Content-Type': 'application/xml', 'Cache-Control': 'public, s-maxage=3600' },
  });
}
