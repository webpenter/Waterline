import createIntlMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';

import { DEFAULT_LOCALE, LOCALES, routing, type AppLocale } from './i18n/routing';

const intlMiddleware = createIntlMiddleware(routing);

function detectLocale(request: NextRequest): AppLocale {
  const header = request.headers.get('accept-language') ?? '';
  for (const part of header.split(',')) {
    const code = part.split(';')[0]?.trim().slice(0, 2).toLowerCase();
    if (LOCALES.includes(code as AppLocale)) return code as AppLocale;
  }
  return DEFAULT_LOCALE;
}

// §14.5/§8.7: expired listing URLs answer 410 Gone. Redirect records are
// looked up through the cached /api/gone route; results memoised per instance.
const PROPERTY_PATH = /^\/(en|it|fr|de|es|ru)(\/property\/[^/]+)$/;
const goneCache = new Map<string, { gone: boolean; at: number }>();
const GONE_TTL_MS = 5 * 60 * 1000;

async function isGone(request: NextRequest, path: string): Promise<boolean> {
  const cached = goneCache.get(path);
  if (cached && Date.now() - cached.at < GONE_TTL_MS) return cached.gone;
  try {
    const res = await fetch(
      `${request.nextUrl.origin}/api/gone?path=${encodeURIComponent(path)}`,
      { signal: AbortSignal.timeout(1500) },
    );
    const data = (await res.json()) as { statusCode: string | null };
    const gone = data.statusCode === '410';
    goneCache.set(path, { gone, at: Date.now() });
    return gone;
  } catch {
    return false;
  }
}

export default async function middleware(request: NextRequest): Promise<NextResponse> {
  // Spec §5.1: "/" performs a 302 language-detect redirect and is never cached.
  if (request.nextUrl.pathname === '/') {
    const url = request.nextUrl.clone();
    url.pathname = `/${detectLocale(request)}`;
    const response = NextResponse.redirect(url, 302);
    response.headers.set('Cache-Control', 'no-store');
    response.headers.set('Vary', 'Accept-Language');
    return response;
  }

  const propertyMatch = PROPERTY_PATH.exec(request.nextUrl.pathname);
  if (propertyMatch && (await isGone(request, propertyMatch[2] as string))) {
    const url = request.nextUrl.clone();
    url.pathname = `/${propertyMatch[1]}/gone`;
    return NextResponse.rewrite(url, { status: 410 });
  }

  return intlMiddleware(request) as NextResponse;
}

export const config = {
  // Everything except Payload admin, API routes, Next internals, dev-only
  // pages, and static files.
  matcher: ['/((?!admin|api|_next|dev|.*\\..*).*)'],
};
