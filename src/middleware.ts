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

export default function middleware(request: NextRequest): NextResponse {
  // Spec §5.1: "/" performs a 302 language-detect redirect and is never cached.
  if (request.nextUrl.pathname === '/') {
    const url = request.nextUrl.clone();
    url.pathname = `/${detectLocale(request)}`;
    const response = NextResponse.redirect(url, 302);
    response.headers.set('Cache-Control', 'no-store');
    response.headers.set('Vary', 'Accept-Language');
    return response;
  }

  return intlMiddleware(request) as NextResponse;
}

export const config = {
  // Everything except Payload admin, API routes, Next internals, dev-only
  // pages, and static files.
  matcher: ['/((?!admin|api|_next|dev|.*\\..*).*)'],
};
