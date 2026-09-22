import { NextResponse, type NextRequest } from 'next/server';

import { getPropertyForDetail, type Locale } from '@/lib/db';
import { renderBrochure } from '@/lib/pdf/render';
import { findFallbackProperty, sampleFallbackEnabled } from '@/lib/sample/fallback';
import type { Property } from '@/payload-types';

export const revalidate = 3600;

const LOCALES = ['en', 'it', 'fr', 'de', 'es', 'ru'];

// §22 Prompt 15A: the brochure endpoint. Same data rules as the listing page —
// database verdicts are final, the demo inventory answers only on the
// DB-error path in demo mode, unknown slugs 404.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
): Promise<NextResponse> {
  const { slug } = await params;
  const requested = new URL(request.url).searchParams.get('locale') ?? 'en';
  const locale = LOCALES.includes(requested) ? requested : 'en';

  let property: Property | null;
  try {
    property = await getPropertyForDetail(slug, locale as Locale);
  } catch (err) {
    console.warn('[brochure] load failed:', err);
    property = sampleFallbackEnabled() ? findFallbackProperty(slug) : null;
  }
  if (!property) return NextResponse.json({ ok: false }, { status: 404 });

  try {
    const pdf = await renderBrochure(property, locale);
    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${slug}-${locale}.pdf"`,
        'Cache-Control': 'public, s-maxage=3600',
      },
    });
  } catch (err) {
    console.warn('[brochure] render failed:', err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
