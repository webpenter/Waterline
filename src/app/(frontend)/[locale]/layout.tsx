import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import React from 'react';

import { brand } from '@/config/brand';
import { LOCALES, type AppLocale } from '@/i18n/routing';
import { hreflangAlternates } from '@/lib/seo/hreflang';
import { bodyFont, displayFont } from '@/tokens/fonts';

import '../styles.css';

export function generateStaticParams(): Array<{ locale: string }> {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  await params;
  return {
    title: brand.name,
    description: brand.description,
    alternates: hreflangAlternates('/'),
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!LOCALES.includes(locale as AppLocale)) notFound();
  setRequestLocale(locale);

  return (
    // suppressHydrationWarning covers ONLY this element's attributes: browser
    // extensions inject attrs into <html> before React hydrates. Real
    // mismatches deeper in the tree still surface, and
    // tests/console-errors.spec.ts keeps the tree hydration-clean in CI.
    <html
      lang={locale}
      className={`${displayFont.variable} ${bodyFont.variable}`}
      suppressHydrationWarning
    >
      {/* Performance budget (CLAUDE.md rule 1): no NextIntlClientProvider —
          all translation happens in Server Components; client components
          receive translated strings as props. The next-intl client runtime
          (~20 kB gz) must never enter the bundle. */}
      <body>{children}</body>
    </html>
  );
}
