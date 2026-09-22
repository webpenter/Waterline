import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getLocale, getTranslations, setRequestLocale } from 'next-intl/server';
import { RichText } from '@payloadcms/richtext-lexical/react';

import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { EnquiryForm } from '@/components/property/EnquiryForm';
import { GalleryGrid } from '@/components/property/GalleryGrid';
import { NauticalPanel } from '@/components/property/NauticalPanel';
import { PropertyCard } from '@/components/property/PropertyCard';
import { ViewBeacon } from '@/components/property/ViewBeacon';
import { WaterCredentialsTable } from '@/components/property/WaterCredentialsTable';
import { humanizeEnum } from '@/components/property/WaterChips';
import { Badge } from '@/components/ui/Badge';
import { Link } from '@/i18n/navigation';
import { getPropertyForDetail, getPublicSlugs, getPayloadClient, type Locale } from '@/lib/db';
import { sanitizePropertyForPublic } from '@/lib/db/sanitize';
import { formatArea, formatPriceEur } from '@/lib/intl/format';
import { getViewerPreferences } from '@/lib/intl/preferences';
import { soldPageIsNoindex } from '@/lib/expiry';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { breadcrumbJsonLd, realEstateListingJsonLd } from '@/lib/seo/jsonld';
import { findFallbackProperty, sampleFallbackEnabled } from '@/lib/sample/fallback';
import { rankSimilar, similarCandidatesWhere } from '@/lib/similar';
import type { Agency, Agent, Property } from '@/payload-types';

// SSG + ISR 600 s (§10.3).
export const revalidate = 600;

interface DetailPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
  const slugs = await getPublicSlugs();
  return slugs.map((slug) => ({ slug }));
}

async function loadProperty(slug: string, locale: string): Promise<Property | null> {
  try {
    // Database answered: its verdict is final — unknown slugs 404.
    return await getPropertyForDetail(slug, locale as Locale);
  } catch (err) {
    console.warn('[property-page] load failed:', err);
    // DB-error path only, demo mode only, exact slug only (§13.12).
    return sampleFallbackEnabled() ? findFallbackProperty(slug) : null;
  }
}

async function loadSimilar(property: Property): Promise<Property[]> {
  try {
    const payload = await getPayloadClient();
    const res = await payload.find({
      collection: 'properties',
      where: similarCandidatesWhere(property),
      limit: 24,
      depth: 1,
    });
    return rankSimilar(property, res.docs.map(sanitizePropertyForPublic), 3);
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: DetailPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const property = await loadProperty(slug, locale);
  if (!property) return {};

  // §11.4 meta template: {title} — {propertyType} with {accessType} in {locality}
  const access = property.waterAccessType?.[0];
  const parts = [
    property.title,
    '—',
    humanizeEnum(property.propertyType),
    access ? `with ${humanizeEnum(access).toLowerCase()}` : null,
    property.location?.locality ? `in ${property.location.locality}` : null,
  ].filter(Boolean);

  // §11.4 description template from structured fields when no manual meta.
  const generatedDescription = [
    property.bedrooms != null ? `${property.bedrooms} bedrooms` : null,
    property.builtAreaSqm != null ? `${property.builtAreaSqm} m²` : null,
    property.waterFrontageM != null
      ? `${property.waterFrontageM} m of private ${humanizeEnum(property.waterBodyType ?? 'water').toLowerCase()} frontage`
      : null,
    property.location?.locality ? `in ${property.location.locality}` : null,
  ]
    .filter(Boolean)
    .join(', ');

  const noindex =
    property.visibility === 'unlisted' ||
    property.isSample ||
    soldPageIsNoindex(property, new Date());

  return buildPageMetadata({
    title: property.metaTitle ?? parts.join(' '),
    description: property.metaDescription ?? generatedDescription ?? property.subtitle,
    path: `/property/${slug}`,
    locale,
    robots: noindex ? { index: false, follow: false } : undefined,
    ogImage: `/api/og/property/${slug}`,
  });
}

export default async function PropertyPage({ params }: DetailPageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const property = await loadProperty(slug, locale);
  if (!property) notFound();

  const t = await getTranslations('listing');
  const tc = await getTranslations('common');
  const viewerLocale = await getLocale();
  const { currency, units } = await getViewerPreferences();
  const similar = await loadSimilar(property);

  const agency =
    typeof property.agency === 'object' && property.agency !== null
      ? (property.agency as Agency)
      : null;
  const agent =
    typeof property.agent === 'object' && property.agent !== null
      ? (property.agent as Agent)
      : null;

  const price =
    property.priceType === 'fixed' && property.priceEur != null
      ? formatPriceEur(property.priceEur, currency, viewerLocale)
      : tc('priceOnRequest');

  const locality = [
    property.location?.locality,
    property.location?.region,
    property.location?.country,
  ]
    .filter(Boolean)
    .join(' · ');

  const facts: Array<[string, string]> = [];
  if (property.bedrooms != null) facts.push([t('factBedrooms'), String(property.bedrooms)]);
  if (property.bathrooms != null) facts.push([t('factBathrooms'), String(property.bathrooms)]);
  if (property.builtAreaSqm != null)
    facts.push([t('factBuiltArea'), formatArea(property.builtAreaSqm, units, viewerLocale)]);
  if (property.plotAreaSqm != null)
    facts.push([t('factPlotArea'), formatArea(property.plotAreaSqm, units, viewerLocale)]);
  if (property.terraceAreaSqm != null)
    facts.push([t('factTerrace'), formatArea(property.terraceAreaSqm, units, viewerLocale)]);
  if (property.yearBuilt != null) facts.push([t('factYearBuilt'), String(property.yearBuilt)]);
  if (property.renovatedYear != null)
    facts.push([t('factRenovated'), String(property.renovatedYear)]);
  if (property.condition) facts.push([t('factCondition'), humanizeEnum(property.condition)]);
  if (property.tenure) facts.push([t('factTenure'), humanizeEnum(property.tenure)]);

  const stateNotice =
    property.status === 'sold'
      ? t('soldNotice')
      : property.status === 'expired'
        ? t('expiredNotice')
        : property.status === 'under_offer'
          ? t('underOfferNotice')
          : null;

  const jsonLd = [
    realEstateListingJsonLd(property, locale),
    breadcrumbJsonLd(locale, [
      { name: t('breadcrumbHome'), path: '' },
      { name: t('breadcrumbSearch'), path: '/search' },
      { name: property.title, path: `/property/${slug}` },
    ]),
  ];

  return (
    <>
      <SiteHeader />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ViewBeacon propertyId={property.id} />
      <main>

      {property.isSample ? (
        <p className="bg-sand px-7 py-2 text-center text-xs uppercase tracking-[0.12em] text-abyss">
          {t('sampleBadge')}
        </p>
      ) : null}
      {property.visibility === 'unlisted' ? (
        <p className="bg-shell px-7 py-2 text-center text-xs text-ink-soft">
          {t('unlistedNotice')}
        </p>
      ) : null}
      {stateNotice ? (
        <p className="bg-abyss px-7 py-2.5 text-center text-xs uppercase tracking-[0.12em] text-white">
          {stateNotice}
        </p>
      ) : null}

      <GalleryGrid property={property} />

      <header className="grid gap-6 border-b border-line px-7 pb-5 pt-6 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <p className="text-[length:var(--text-xs)] uppercase tracking-[0.18em] text-ink-soft">
            {locality}
            {property.reference ? ` · ${t('factReference')} ${property.reference}` : ''}
          </p>
          <h1 className="mb-1 mt-1.5 font-display text-2xl text-ink">{property.title}</h1>
          {property.subtitle ? (
            <p className="text-xs text-ink-soft">{property.subtitle}</p>
          ) : null}
        </div>
        <p className="text-right font-display text-2xl tabular-nums text-ink">{price}</p>
      </header>

      <div className="grid gap-8 px-7 py-6 lg:grid-cols-[1.5fr_1fr]">
        <div>
          <WaterCredentialsTable property={property} />
          <NauticalPanel property={property} />

          {facts.length > 0 ? (
            <section className="mt-6">
              <h2 className="mb-3 font-display text-lg text-ink">{t('keyFactsTitle')}</h2>
              <dl className="grid grid-cols-2 gap-x-6 md:grid-cols-3">
                {facts.map(([label, value]) => (
                  <div key={label} className="border-b border-line py-2">
                    <dt className="text-[length:var(--text-xs)] uppercase tracking-[0.14em] text-ink-soft">
                      {label}
                    </dt>
                    <dd className="text-sm tabular-nums text-ink">{value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ) : null}

          {property.highlights?.length ? (
            <section className="mt-6">
              <h2 className="mb-3 font-display text-lg text-ink">{t('highlightsTitle')}</h2>
              <ul className="list-disc pl-5 text-sm text-ink-soft">
                {property.highlights.map((highlight) => (
                  <li key={highlight.id ?? highlight.text}>{highlight.text}</li>
                ))}
              </ul>
            </section>
          ) : null}

          {property.description ? (
            <section className="prose-waterline mt-6 max-w-prose text-sm text-ink-soft">
              <RichText data={property.description} />
            </section>
          ) : null}

          {property.features?.length ? (
            <section className="mt-6">
              <h2 className="mb-3 font-display text-lg text-ink">{t('featuresTitle')}</h2>
              <div className="flex flex-wrap gap-1.5">
                {property.features.map((feature) => (
                  <Badge key={feature} tone="neutral">
                    {humanizeEnum(feature)}
                  </Badge>
                ))}
              </div>
            </section>
          ) : null}
        </div>

        <aside>
          <div className="border border-line bg-white p-5">
            {agency ? (
              <div className="mb-4 flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="flex h-10 w-10 items-center justify-center rounded-pill bg-abyss font-display text-sm text-white"
                >
                  {(agent?.name ?? agency.name).slice(0, 1)}
                </span>
                <div>
                  <p className="text-sm font-medium text-ink">{agent?.name ?? agency.name}</p>
                  <p className="text-[length:var(--text-xs)] uppercase tracking-[0.14em] text-ink-soft">
                    {agency.name}
                    {agency.verified ? ` · ${t('verifiedAgency')}` : ''}
                  </p>
                </div>
              </div>
            ) : null}
            <h2 className="mb-1 font-display text-lg text-ink">{t('enquiryCta')}</h2>
            <p className="mb-4 text-xs text-ink-soft">{t('enquirySub')}</p>
            <EnquiryForm
              propertyId={property.id}
              locale={locale}
              labels={{
                name: t('formName'),
                email: t('formEmail'),
                phone: t('formPhone'),
                message: t('formMessage'),
                consent: t('enquiryConsent'),
                submit: t('formSubmit'),
                sending: t('formSending'),
                success: t('formSuccess'),
                error: t('formError'),
                consentRequired: t('formConsentRequired'),
                errorSummary: t('formErrorSummary'),
                errorName: t('formErrorName'),
                errorEmail: t('formErrorEmail'),
              }}
            />
            <a
              href={`/api/property/${slug}/brochure.pdf?locale=${locale}`}
              className="mt-3 block border border-abyss px-4 py-3 text-center text-xs uppercase tracking-[0.14em] text-abyss"
            >
              {t('brochureCta')}
            </a>
            {agent?.whatsapp || agency?.whatsapp ? (
              <a
                href={`https://wa.me/${(agent?.whatsapp ?? agency?.whatsapp ?? '').replace(/[^\d]/g, '')}`}
                className="mt-3 block border border-abyss px-4 py-3 text-center text-xs uppercase tracking-[0.14em] text-abyss"
              >
                {t('whatsappCta')}
              </a>
            ) : null}
            <p className="mt-4 text-[length:var(--text-xs)] leading-relaxed text-ink-soft">
              {t('disclaimer')}
            </p>
          </div>
        </aside>
      </div>

      {similar.length > 0 ? (
        <section className="border-t border-line px-7 py-8">
          <h2 className="mb-5 font-display text-xl text-ink">{t('similarTitle')}</h2>
          <div className="grid gap-5 md:grid-cols-3">
            {similar.map((item) => (
              <PropertyCard key={item.id} property={item} />
            ))}
          </div>
        </section>
      ) : null}

      <nav aria-label={t('breadcrumbHome')} className="px-7 pb-6 text-xs text-ink-soft">
        <Link href="/" className="hover:text-tide">
          {t('breadcrumbHome')}
        </Link>
        {' / '}
        <Link href="/search" className="hover:text-tide">
          {t('breadcrumbSearch')}
        </Link>
        {' / '}
        <span aria-current="page">{property.title}</span>
      </nav>
      </main>

      <SiteFooter />
    </>
  );
}
