import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import React from 'react';

import { AnalyticsScript } from '@/components/layout/AnalyticsScript';
import { CookieConsent } from '@/components/layout/CookieConsent';
import { brand } from '@/config/brand';
import { LOCALES, type AppLocale } from '@/i18n/routing';
import { organizationJsonLd, webSiteJsonLd } from '@/lib/seo/jsonld';
import { buildPageMetadata } from '@/lib/seo/metadata';
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
  const { locale } = await params;
  return buildPageMetadata({
    title: brand.name,
    description: brand.description,
    path: '/',
    locale,
  });
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
  const t = await getTranslations('consent');

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
      <body>
        {/* §14.3/§14.6: Organization + WebSite (SearchAction) on every page —
            entity clarity for search engines and assistants alike. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([organizationJsonLd(), webSiteJsonLd()]),
          }}
        />
        <NextIntlClientProvider locale={locale}>{children}</NextIntlClientProvider>
        {/* §4 decision 7: consent is non-blocking, deferred, never
            layout-shifting — fixed-position and rendered post-hydration. */}
        <CookieConsent
          locale={locale}
          labels={{
            title: t('title'),
            description: t('description'),
            acceptAll: t('acceptAll'),
            necessaryOnly: t('necessaryOnly'),
            customize: t('customize'),
            save: t('save'),
            analytics: t('analytics'),
            marketing: t('marketing'),
          }}
        />
        <AnalyticsScript />
      </body>
    </html>
  );
}
