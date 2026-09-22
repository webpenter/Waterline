import { getTranslations, setRequestLocale } from 'next-intl/server';

import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { BoatFitStrip } from '@/components/property/BoatFitStrip';
import { BOAT_BUCKETS } from '@/lib/boat-buckets';
import { PropertyCard } from '@/components/property/PropertyCard';
import { Link } from '@/i18n/navigation';
import { getDestinationCounts, getFeatured, searchPropertiesPostgres, type Locale } from '@/lib/db';
import type { DestinationCount } from '@/lib/db';
import type { Property } from '@/payload-types';
import { layout } from '@/tokens/layout';
import { HERO_SCRIM, HORIZON_LINE, horizonGradientFor } from '@/tokens/placeholders';

// SSG + ISR 300 s (§10.1).
export const revalidate = 300;

async function safeFeatured(locale: Locale): Promise<Property[]> {
  try {
    return await getFeatured(6, locale);
  } catch {
    return [];
  }
}

async function safeDestinations(locale: Locale): Promise<DestinationCount[]> {
  try {
    return (await getDestinationCounts(locale)).slice(0, 8);
  } catch {
    return [];
  }
}

/** Precomputed "Will it fit?" bucket counts (§10.1 block 5). */
async function safeBucketCounts(): Promise<Record<number, number>> {
  const counts: Record<number, number> = {};
  for (const bucket of BOAT_BUCKETS) {
    try {
      const result = await searchPropertiesPostgres({ boatLoaM: bucket, limit: 1 });
      counts[bucket] = result.total;
    } catch {
      counts[bucket] = 0;
    }
  }
  return counts;
}

const WATER_TILES = [
  { key: 'waterSea', query: 'water=sea' },
  { key: 'waterLake', query: 'water=lake' },
  { key: 'waterRiverCanal', query: 'water=river,canal' },
  { key: 'waterLagoon', query: 'water=lagoon' },
  { key: 'waterFjord', query: 'water=fjord' },
  { key: 'waterPrivateIslands', query: 'type=private_island' },
] as const;

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('home');
  const ts = await getTranslations('search');
  const nav = await getTranslations('nav');

  const [featured, destinations, bucketCounts] = await Promise.all([
    safeFeatured(locale as Locale),
    safeDestinations(locale as Locale),
    safeBucketCounts(),
  ]);

  return (
    <>
      <main>
      {/* 1 · Hero — single still, scrim, horizon, search bar (§10.1, §11.1). */}
      <div
        className="relative flex flex-col text-white"
        style={{ minHeight: layout.heroMinH }}
      >
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{ background: horizonGradientFor('waterline-hero') }}
        >
          <div className="absolute inset-x-0 top-[46%] h-px" style={{ background: HORIZON_LINE }} />
          <div className="absolute inset-0" style={{ background: HERO_SCRIM }} />
        </div>
        <SiteHeader onHero />
        <div className="relative z-10 mt-auto px-7">
          <h1 className="mb-2 max-w-[15ch] font-display text-4xl leading-[1.08] tracking-[-0.02em]">
            {t('heroTitle')}
          </h1>
          <p className="mb-5 max-w-[52ch] text-sm text-white/85">{t('heroSub')}</p>
        </div>
        <form
          action={`/${locale}/search`}
          method="GET"
          className="relative z-10 mx-7 mb-7 grid items-end border border-white/40 bg-white/95 text-ink md:grid-cols-[1.4fr_1fr_1fr_auto]"
        >
          <label className="flex flex-col gap-1 border-b border-line p-3 md:border-b-0 md:border-r">
            <span className="text-[length:var(--text-xs)] uppercase tracking-[0.16em] text-ink-soft">
              {ts('fieldWater')}
            </span>
            <select name="water" className="bg-transparent text-sm text-ink">
              <option value="">{ts('fieldWaterAny')}</option>
              <option value="sea">{t('waterSea')}</option>
              <option value="lake">{t('waterLake')}</option>
              <option value="river,canal">{t('waterRiverCanal')}</option>
              <option value="lagoon">{t('waterLagoon')}</option>
              <option value="fjord">{t('waterFjord')}</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 border-b border-line p-3 md:border-b-0 md:border-r">
            <span className="text-[length:var(--text-xs)] uppercase tracking-[0.16em] text-ink-soft">
              {ts('fieldPrice')}
            </span>
            <select name="price" className="bg-transparent text-sm text-ink">
              <option value="">{ts('fieldPriceNoMax')}</option>
              <option value="-5000000">€ ≤ 5M</option>
              <option value="5000000-10000000">€ 5M – 10M</option>
              <option value="10000000-">€ 10M+</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 bg-surf/15 p-3">
            <span className="text-[length:var(--text-xs)] uppercase tracking-[0.16em] text-ink-soft">
              {ts('fieldBoatLength')}
            </span>
            <input
              type="number"
              name="boatLoa"
              min={0}
              max={120}
              placeholder="24"
              className="bg-transparent text-sm tabular-nums text-ink"
            />
          </label>
          <button
            type="submit"
            className="h-full min-h-12 bg-abyss px-7 text-xs uppercase tracking-[0.16em] text-white"
          >
            {t('searchCta')}
          </button>
        </form>
      </div>

      {/* 2 · Signature listings (§10.1). */}
      {featured.length > 0 ? (
        <section className="px-7 py-8">
          <div className="mb-5 flex items-baseline justify-between border-b border-line pb-2.5">
            <h2 className="font-display text-xl text-ink">{t('signatureTitle')}</h2>
            <Link
              href="/search"
              className="text-[length:var(--text-xs)] uppercase tracking-[0.14em] text-tide"
            >
              {ts('pageTitle')} →
            </Link>
          </div>
          <p className="sr-only">{t('signatureSub')}</p>
          <div className="grid gap-5 md:grid-cols-3">
            {featured.map((property, index) => (
              <PropertyCard key={property.id} property={property} priority={index < 3} />
            ))}
          </div>
        </section>
      ) : null}

      {/* 3 · Browse by water (§10.1). */}
      <section className="px-7 py-8">
        <div className="mb-5 flex items-baseline justify-between border-b border-line pb-2.5">
          <h2 className="font-display text-xl text-ink">{t('browseTitle')}</h2>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
          {WATER_TILES.map((tile) => (
            <Link
              key={tile.key}
              href={`/search?${tile.query}`}
              className="group relative flex aspect-[3/4] items-end overflow-hidden text-white"
            >
              <span
                aria-hidden="true"
                className="absolute inset-0 transition-transform duration-[var(--motion-slow)] group-hover:scale-105"
                style={{ background: horizonGradientFor(tile.key) }}
              />
              <span
                aria-hidden="true"
                className="absolute inset-0"
                style={{ background: HERO_SCRIM }}
              />
              <span className="relative z-10 p-3 text-[length:var(--text-xs)] uppercase tracking-[0.1em]">
                {t(tile.key)}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 4 · Destinations with live counts (§10.1). */}
      {destinations.length > 0 ? (
        <section className="px-7 py-8">
          <div className="mb-5 flex items-baseline justify-between border-b border-line pb-2.5">
            <h2 className="font-display text-xl text-ink">{nav('destinations')}</h2>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {destinations.map((destination) => (
              <Link
                key={destination.id}
                href={`/destinations/${destination.slug}`}
                className="group relative flex aspect-[3/2] items-end overflow-hidden text-white"
              >
                <span
                  aria-hidden="true"
                  className="absolute inset-0"
                  style={{ background: horizonGradientFor(destination.slug) }}
                />
                <span
                  aria-hidden="true"
                  className="absolute inset-0"
                  style={{ background: HERO_SCRIM }}
                />
                <span className="relative z-10 p-3 text-[length:var(--text-xs)] uppercase tracking-[0.1em]">
                  {destination.name}
                  <small className="mt-0.5 block normal-case tracking-[0.06em] text-white/75">
                    {ts('resultsCount', { count: destination.count })}
                  </small>
                </span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {/* 5 · "Will it fit?" — the brand moment (§10.1). */}
      <BoatFitStrip
        title={t('boatStripTitle')}
        sub={t('boatStripSub')}
        lengthLabel={ts('fieldBoatLength')}
        searchCta={t('searchCta')}
        bucketCounts={bucketCounts}
        resultTemplate={t.raw('boatStripResult') as string}
        locale={locale}
      />

      {/* 6 · Why WATERLINE (§10.1 / §11.1). */}
      <section className="grid gap-6 px-7 py-9 md:grid-cols-3">
        {(['whyVerified', 'whyFrontage', 'whyBerth'] as const).map((key) => (
          <p key={key} className="border-t border-ink pt-3 text-sm text-ink-soft">
            {t(key)}
          </p>
        ))}
      </section>

      {/* 8 · List with us (§10.1; journal lands with its first articles). */}
      <section className="border-t border-line px-7 py-9 text-center">
        <h2 className="mb-2 font-display text-xl text-ink">{t('supplyCtaTitle')}</h2>
        <p className="mx-auto mb-5 max-w-[52ch] text-sm text-ink-soft">{t('supplyCtaSub')}</p>
        <Link
          href="/list-with-us"
          className="inline-block bg-abyss px-6 py-3 text-xs uppercase tracking-[0.14em] text-white"
        >
          {nav('listWithUs')}
        </Link>
      </section>
      </main>

      <SiteFooter />
    </>
  );
}
