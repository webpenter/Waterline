import { renderToBuffer } from '@react-pdf/renderer';
import * as React from 'react';

import { brand } from '@/config/brand';
import { formatPriceEur } from '@/lib/intl/format';
import type { Media, Property } from '@/payload-types';

import { BrochureDocument } from './brochure';
import { brochureLabels } from './labels';

function absoluteUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? brand.siteUrl).replace(/\/$/, '');
  return `${base}${url}`;
}

/** MapTiler static map (§13.5 stack) when a key exists; omitted otherwise. */
export function staticMapUrl(property: Property): string | null {
  const key = process.env.NEXT_PUBLIC_MAPTILER_KEY;
  const coords = property.location?.coordinates;
  if (!key || key.startsWith('dev_') || !Array.isArray(coords)) return null;
  const [lng, lat] = coords;
  return `https://api.maptiler.com/maps/dataviz/static/${lng},${lat},11/520x280.png?key=${key}`;
}

export async function renderBrochure(property: Property, locale = 'en'): Promise<Buffer> {
  const labels = brochureLabels(locale);
  const priceLabel =
    property.priceType === 'fixed' && property.priceEur != null
      ? formatPriceEur(property.priceEur, 'EUR', locale)
      : labels.priceOnRequest;

  const imageUrls = (property.media ?? [])
    .filter((item): item is Media => typeof item === 'object' && item !== null)
    .map((media) => absoluteUrl(media.sizes?.w960?.url ?? media.url))
    .filter((url): url is string => Boolean(url))
    .slice(0, 7);

  const element = React.createElement(BrochureDocument, {
    property,
    labels,
    priceLabel,
    imageUrls,
    mapUrl: staticMapUrl(property),
  }) as unknown as Parameters<typeof renderToBuffer>[0];
  return renderToBuffer(element);
}
