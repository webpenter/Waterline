import { brand } from '@/config/brand';
import type { Property } from '@/payload-types';

// §14.3: JSON-LD for listing pages — RealEstateListing + Offer +
// BreadcrumbList, with water and nautical fields mapped into
// amenityFeature/LocationFeatureSpecification. Never invent values: only
// populated fields are emitted.

type Json = Record<string, unknown>;

function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? brand.siteUrl).replace(/\/$/, '');
}

function feature(name: string, value: unknown): Json {
  return {
    '@type': 'LocationFeatureSpecification',
    name,
    value,
  };
}

export function propertyAmenityFeatures(property: Property): Json[] {
  const features: Json[] = [];
  if (property.waterBodyType) features.push(feature('Water body type', property.waterBodyType));
  for (const access of property.waterAccessType ?? []) {
    features.push(feature('Water access', access));
  }
  if (property.waterFrontageM != null)
    features.push(feature('Private water frontage (m)', property.waterFrontageM));
  if (property.distanceToWaterM != null)
    features.push(feature('Distance to water (m)', property.distanceToWaterM));
  if (property.swimmableFromProperty != null)
    features.push(feature('Swimmable from the property', Boolean(property.swimmableFromProperty)));
  if (property.mooringType && property.mooringType !== 'none')
    features.push(feature('Mooring', property.mooringType));
  if (property.maxBoatLoaM != null)
    features.push(feature('Max boat length (m)', property.maxBoatLoaM));
  if (property.maxBoatBeamM != null)
    features.push(feature('Max beam (m)', property.maxBoatBeamM));
  if (property.waterDepthAtBerthM != null)
    features.push(feature('Water depth at berth (m)', property.waterDepthAtBerthM));
  if (property.navigableToOpenSea != null)
    features.push(feature('Navigable to open sea', Boolean(property.navigableToOpenSea)));
  if (property.minBridgeClearanceM != null)
    features.push(feature('Minimum bridge clearance (m)', property.minBridgeClearanceM));
  return features;
}

export function realEstateListingJsonLd(property: Property, locale: string): Json {
  const url = `${siteUrl()}/${locale}/property/${property.slug}`;
  const jsonLd: Json = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    '@id': url,
    url,
    name: property.title,
    datePosted: property.publishedAt ?? undefined,
    amenityFeature: propertyAmenityFeatures(property),
  };

  if (property.location?.locality || property.location?.country) {
    jsonLd.address = {
      '@type': 'PostalAddress',
      addressLocality: property.location?.locality ?? undefined,
      addressRegion: property.location?.region ?? undefined,
      addressCountry: property.location?.country ?? undefined,
    };
  }

  if (property.priceType === 'fixed' && property.priceEur != null) {
    jsonLd.offers = {
      '@type': 'Offer',
      price: property.priceEur,
      priceCurrency: 'EUR',
      availability:
        property.status === 'under_offer'
          ? 'https://schema.org/LimitedAvailability'
          : 'https://schema.org/InStock',
      url,
    };
  }

  return jsonLd;
}

/** §14.3: consistent Organization entity with sameAs links — entity clarity for machines. */
export function organizationJsonLd(): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${siteUrl()}/#organization`,
    name: brand.name,
    legalName: brand.legalName,
    url: siteUrl(),
    email: brand.email.contact,
    sameAs: Object.values(brand.socials),
  };
}

/** §14.3: WebSite with SearchAction so assistants and Google know how to search us. */
export function webSiteJsonLd(): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${siteUrl()}/#website`,
    name: brand.name,
    url: siteUrl(),
    publisher: { '@id': `${siteUrl()}/#organization` },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl()}/en/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/** §14.3: Article for journal posts, with freshness signals. */
export function articleJsonLd(article: {
  slug: string;
  title: string;
  excerpt?: string | null;
  publishedAt?: string | null;
  updatedAt?: string | null;
  authorName?: string | null;
}, locale: string): Json {
  const url = `${siteUrl()}/${locale}/journal/${article.slug}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': url,
    mainEntityOfPage: url,
    headline: article.title,
    description: article.excerpt ?? undefined,
    datePublished: article.publishedAt ?? undefined,
    dateModified: article.updatedAt ?? article.publishedAt ?? undefined,
    author: article.authorName
      ? { '@type': 'Person', name: article.authorName }
      : { '@id': `${siteUrl()}/#organization` },
    publisher: { '@id': `${siteUrl()}/#organization` },
  };
}

/** §14.3: RealEstateAgent for agency profile pages. */
export function realEstateAgentJsonLd(agency: {
  slug: string;
  name: string;
  description?: string | null;
  email?: string | null;
  website?: string | null;
  country?: string | null;
}, locale: string): Json {
  const url = `${siteUrl()}/${locale}/agencies/${agency.slug}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    '@id': url,
    url,
    name: agency.name,
    description: agency.description ?? undefined,
    email: agency.email ?? undefined,
    sameAs: agency.website ? [agency.website] : undefined,
    address: agency.country
      ? { '@type': 'PostalAddress', addressCountry: agency.country }
      : undefined,
  };
}

export function faqPageJsonLd(
  faq: Array<{ question: string; answer: string }>,
): Json | null {
  if (faq.length === 0) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((entry) => ({
      '@type': 'Question',
      name: entry.question,
      acceptedAnswer: { '@type': 'Answer', text: entry.answer },
    })),
  };
}

export function breadcrumbJsonLd(
  locale: string,
  crumbs: Array<{ name: string; path: string }>,
): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: `${siteUrl()}/${locale}${crumb.path}`,
    })),
  };
}
