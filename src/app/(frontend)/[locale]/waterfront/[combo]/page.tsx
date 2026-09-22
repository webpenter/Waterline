import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { RichText } from '@payloadcms/richtext-lexical/react';

import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { EnquiryForm } from '@/components/property/EnquiryForm';
import { StatsStrip } from '@/components/property/StatsStrip';
import { SearchResultCard } from '@/components/search/SearchResultCard';
import { Link } from '@/i18n/navigation';
import {
  getAggregatesForScope,
  getLandingPageBySlug,
  getPublishedLandingPages,
  searchPropertiesPostgres,
  type Locale,
  type ScopeAggregates,
} from '@/lib/db';
import type { SearchHit } from '@/lib/search/client';
import {
  comboToFilters,
  comboToSearchQuery,
  normalizeComboSlug,
  passesEditorialGate,
  rankSiblings,
} from '@/lib/seo/combos';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { breadcrumbJsonLd, faqPageJsonLd } from '@/lib/seo/jsonld';
import type { LandingPage } from '@/payload-types';

// Programmatic landing pages (§5.4, §10.4): SSG over published records + ISR.
export const revalidate = 900;

interface ComboPageProps {
  params: Promise<{ locale: string; combo: string }>;
}

export async function generateStaticParams(): Promise<Array<{ combo: string }>> {
  try {
    const pages = await getPublishedLandingPages();
    return pages.filter(passesEditorialGate).map((page) => ({ combo: page.slug }));
  } catch {
    return [];
  }
}

async function loadGatedPage(combo: string, locale: string): Promise<LandingPage | null> {
  try {
    const page = await getLandingPageBySlug(combo, locale as Locale);
    return page && passesEditorialGate(page) ? page : null;
  } catch (err) {
    console.warn('[landing] load failed, treating as not found:', err);
    return null;
  }
}

async function safeAggregates(page: LandingPage): Promise<ScopeAggregates> {
  try {
    const filters = comboToFilters(page);
    return await getAggregatesForScope({
      country: filters.country,
      waterBodyType: filters.waterBodyTypes?.[0],
      propertyType: filters.propertyTypes?.[0],
      destinationId: filters.destinationId,
    });
  } catch {
    return { count: 0, medianPriceEur: null, medianFrontageM: null, topPropertyType: null };
  }
}

async function safeListings(page: LandingPage): Promise<SearchHit[]> {
  try {
    const result = await searchPropertiesPostgres({ ...comboToFilters(page), limit: 12 });
    return result.hits;
  } catch {
    return [];
  }
}

async function safeSiblings(page: LandingPage, locale: string): Promise<LandingPage[]> {
  try {
    const all = await getPublishedLandingPages(locale as Locale);
    return rankSiblings(page, all.filter(passesEditorialGate), 8);
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: ComboPageProps): Promise<Metadata> {
  const { combo, locale } = await params;
  const page = await loadGatedPage(combo, locale);
  if (!page) return {};
  const aggregates = await safeAggregates(page);

  // §11.4 landing templates with §14.2 fallbacks; count keeps titles unique.
  const generatedDescription = [
    `Browse ${aggregates.count} verified waterfront listings.`,
    aggregates.medianPriceEur != null
      ? `Median price €${Math.round(aggregates.medianPriceEur / 1000)}k.`
      : null,
    aggregates.medianFrontageM != null
      ? `Median frontage ${aggregates.medianFrontageM} m.`
      : null,
  ]
    .filter(Boolean)
    .join(' ');

  return buildPageMetadata({
    title: page.metaTitle ?? `${page.title} — ${aggregates.count} for sale`,
    description: page.metaDescription ?? generatedDescription,
    path: `/waterfront/${combo}`,
    locale,
    ogImage: `/api/og/landing/${combo}`,
  });
}

export default async function ComboPage({ params }: ComboPageProps) {
  const { locale, combo } = await params;
  setRequestLocale(locale);

  // §5.4: exactly one canonical URL per combination — aliases 301.
  const canonical = normalizeComboSlug(combo);
  if (canonical !== combo) {
    permanentRedirect(`/${locale}/waterfront/${canonical}`);
  }

  const page = await loadGatedPage(combo, locale);
  if (!page) notFound();

  const t = await getTranslations('landing');
  const ts = await getTranslations('search');
  const tl = await getTranslations('listing');

  const [aggregates, listings, siblings] = await Promise.all([
    safeAggregates(page),
    safeListings(page),
    safeSiblings(page, locale),
  ]);

  const faq = (page.faq ?? []).map((entry) => ({
    question: entry.question,
    answer: entry.answer,
  }));
  const jsonLd = [
    breadcrumbJsonLd(locale, [
      { name: tl('breadcrumbHome'), path: '' },
      { name: page.title, path: `/waterfront/${combo}` },
    ]),
    ...(faqPageJsonLd(faq) ? [faqPageJsonLd(faq)] : []),
  ];

  return (
    <>
      <SiteHeader />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main>
        {/* Editorial first (§10.4): the intro opens with a direct answer (§14.6). */}
        <div className="max-w-[74ch] px-7 pb-2 pt-7">
          <h1 className="mb-3 font-display text-2xl text-ink">{page.title}</h1>
          <div className="text-sm leading-relaxed text-ink-soft">
            {page.intro ? <RichText data={page.intro} /> : null}
          </div>
        </div>

        <StatsStrip aggregates={aggregates} />

        {listings.length > 0 ? (
          <section className="px-7 py-7">
            <div className="flex flex-col gap-3">
              {listings.map((hit) => (
                <SearchResultCard key={hit.id} hit={hit} />
              ))}
            </div>
            <Link
              href={`/search${comboToSearchQuery(page)}`}
              className="mt-5 inline-block bg-abyss px-5 py-3 text-xs uppercase tracking-[0.14em] text-white"
            >
              {t('viewAllCta', { count: aggregates.count })}
            </Link>
          </section>
        ) : null}

        {page.body ? (
          <section className="max-w-[74ch] px-7 pb-4 text-sm leading-relaxed text-ink-soft">
            <RichText data={page.body} />
          </section>
        ) : null}

        {siblings.length > 0 ? (
          <nav aria-label={t('siblingsTitle')} className="px-7 py-5">
            <h2 className="mb-3 font-display text-lg text-ink">{t('siblingsTitle')}</h2>
            <div className="flex flex-wrap gap-2">
              {siblings.map((sibling) => (
                <Link
                  key={sibling.id}
                  href={`/waterfront/${sibling.slug}`}
                  className="border border-line px-3 py-1.5 text-xs text-tide hover:bg-shell"
                >
                  {sibling.title}
                </Link>
              ))}
            </div>
          </nav>
        ) : null}

        {faq.length > 0 ? (
          <section className="max-w-[74ch] px-7 py-5">
            <h2 className="mb-3 font-display text-lg text-ink">{t('faqTitle')}</h2>
            {faq.map((entry) => (
              <details key={entry.question} className="border-b border-line py-3">
                <summary className="cursor-pointer text-sm font-medium text-ink">
                  {entry.question}
                </summary>
                <p className="pt-2 text-sm leading-relaxed text-ink-soft">{entry.answer}</p>
              </details>
            ))}
          </section>
        ) : null}

        <section className="max-w-md px-7 py-7">
          <h2 className="mb-1 font-display text-lg text-ink">{t('enquiryTitle')}</h2>
          <p className="mb-4 text-xs text-ink-soft">{t('enquirySub')}</p>
          <EnquiryForm
            source="landing"
            locale={locale}
            labels={{
              name: tl('formName'),
              email: tl('formEmail'),
              phone: tl('formPhone'),
              message: tl('formMessage'),
              consent: tl('enquiryConsent'),
              submit: tl('formSubmit'),
              sending: tl('formSending'),
              success: tl('formSuccess'),
              error: tl('formError'),
              consentRequired: tl('formConsentRequired'),
            }}
          />
        </section>

        <p className="sr-only">{ts('resultsCount', { count: aggregates.count })}</p>
      </main>
      <SiteFooter />
    </>
  );
}
