import { sanitizePropertyForPublic } from '@/lib/db/sanitize';
import type { LngLat } from '@/lib/geo';

type AnyDoc = Record<string, unknown>;

function relId(value: unknown): number | undefined {
  if (value == null) return undefined;
  if (typeof value === 'object') return (value as { id?: number }).id;
  return value as number;
}

/**
 * Build the Typesense document for a property. ALWAYS runs the §6.6 privacy
 * sanitization first — the search index is a public surface, so approximate
 * listings carry only the jittered point and hidden ones carry none.
 */
export function toSearchDocument(property: unknown): Record<string, unknown> {
  const doc = sanitizePropertyForPublic(property as { id: string | number } & AnyDoc) as AnyDoc;
  const location = (doc.location ?? {}) as AnyDoc;
  const coords = location.coordinates as LngLat | null | undefined;

  return {
    id: String(doc.id),
    slug: doc.slug ?? '',
    title: doc.title ?? '',
    status: doc.status ?? 'draft',
    isSample: Boolean(doc.isSample),
    priceEur: (doc.priceEur as number | null) ?? undefined,
    propertyType: doc.propertyType ?? undefined,
    waterBodyType: doc.waterBodyType ?? undefined,
    waterAccessType: (doc.waterAccessType as string[] | null) ?? [],
    waterFrontageM: (doc.waterFrontageM as number | null) ?? undefined,
    beachType: doc.beachType ?? undefined,
    orientation: doc.orientation ?? undefined,
    tenure: doc.tenure ?? undefined,
    maxBoatLoaM: (doc.maxBoatLoaM as number | null) ?? undefined,
    maxBoatBeamM: (doc.maxBoatBeamM as number | null) ?? undefined,
    waterDepthAtBerthM: (doc.waterDepthAtBerthM as number | null) ?? undefined,
    navigableToOpenSea: Boolean(doc.navigableToOpenSea),
    fixedBridgesToOpenSea: Boolean(doc.fixedBridgesToOpenSea),
    minBridgeClearanceM: (doc.minBridgeClearanceM as number | null) ?? undefined,
    bedrooms: (doc.bedrooms as number | null) ?? undefined,
    bathrooms: (doc.bathrooms as number | null) ?? undefined,
    builtAreaSqm: (doc.builtAreaSqm as number | null) ?? undefined,
    plotAreaSqm: (doc.plotAreaSqm as number | null) ?? undefined,
    country: (location.country as string | null) ?? undefined,
    locality: (location.locality as string | null) ?? undefined,
    region: (location.region as string | null) ?? undefined,
    destinationId: relId(location.destination),
    // Typesense geopoint is [lat, lng]. Already jittered/nulled by the
    // sanitizer above; `approximate` lets the map draw a circle, never a pin.
    location: Array.isArray(coords) ? [coords[1], coords[0]] : undefined,
    approximate: location.coordinatePrecision === 'approximate_500m',
    publishedAtTs: doc.publishedAt ? Date.parse(String(doc.publishedAt)) : undefined,
  };
}
