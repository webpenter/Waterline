import type { Where } from 'payload';

import type { Bbox } from '@/lib/geo';
import { withinBboxWhere } from '@/lib/geo';

// The complete public search surface (spec §10.2). Every field is optional;
// translation functions below turn this into a Payload Where (Postgres path)
// or a Typesense filter_by string (search path).
export interface PropertyFilters {
  priceMinEur?: number;
  priceMaxEur?: number;
  waterBodyTypes?: string[];
  waterAccessTypes?: string[];
  minFrontageM?: number;
  /** "Will my boat fit?" — berth must take this length overall. */
  boatLoaM?: number;
  /** Depth at berth must be at least this draft. */
  boatDraftM?: number;
  /** Berth width must take this beam. */
  boatBeamM?: number;
  navigableToOpenSea?: boolean;
  /** True = only listings with no fixed bridges between berth and open sea. */
  noFixedBridges?: boolean;
  /** Boats needing clearance: min bridge clearance must be at least this. */
  minBridgeClearanceM?: number;
  propertyTypes?: string[];
  bedsMin?: number;
  bathsMin?: number;
  minBuiltSqm?: number;
  minPlotSqm?: number;
  orientations?: string[];
  beachTypes?: string[];
  tenures?: string[];
  country?: string;
  destinationId?: number;
  status?: 'in_market' | 'under_offer';
  bbox?: Bbox;
  sort?: 'price_asc' | 'price_desc' | 'frontage_desc' | 'newest';
  page?: number;
  limit?: number;
}

/**
 * The public predicate (spec Prompt 5): status in_market/under_offer, public
 * visibility, approved moderation, published version, and isSample excluded
 * unless SAMPLE_DATA_ENABLED=true. Every public query starts here — no
 * exceptions, ever.
 */
export function publicPredicate(): Where {
  const clauses: Where[] = [
    { status: { in: ['in_market', 'under_offer'] } },
    { visibility: { equals: 'public' } },
    { moderation: { equals: 'approved' } },
    { _status: { equals: 'published' } },
  ];
  if (process.env.SAMPLE_DATA_ENABLED !== 'true') {
    clauses.push({ isSample: { not_equals: true } });
  }
  return { and: clauses };
}

/** PropertyFilters → Payload Where. The canonical Postgres query path. */
export function filtersToWhere(filters: PropertyFilters): Where {
  const and: Where[] = [publicPredicate()];

  if (filters.priceMinEur != null) and.push({ priceEur: { greater_than_equal: filters.priceMinEur } });
  if (filters.priceMaxEur != null) and.push({ priceEur: { less_than_equal: filters.priceMaxEur } });

  if (filters.waterBodyTypes?.length) and.push({ waterBodyType: { in: filters.waterBodyTypes } });
  if (filters.waterAccessTypes?.length) and.push({ waterAccessType: { in: filters.waterAccessTypes } });
  if (filters.minFrontageM != null) and.push({ waterFrontageM: { greater_than_equal: filters.minFrontageM } });

  // The nautical engine (§6.5): a berth "takes" the boat when every stated
  // limit is at least the boat's dimension.
  if (filters.boatLoaM != null) and.push({ maxBoatLoaM: { greater_than_equal: filters.boatLoaM } });
  if (filters.boatDraftM != null)
    and.push({ waterDepthAtBerthM: { greater_than_equal: filters.boatDraftM } });
  if (filters.boatBeamM != null) and.push({ maxBoatBeamM: { greater_than_equal: filters.boatBeamM } });
  if (filters.navigableToOpenSea) and.push({ navigableToOpenSea: { equals: true } });
  if (filters.noFixedBridges) and.push({ fixedBridgesToOpenSea: { not_equals: true } });
  if (filters.minBridgeClearanceM != null)
    and.push({
      or: [
        { fixedBridgesToOpenSea: { not_equals: true } },
        { minBridgeClearanceM: { greater_than_equal: filters.minBridgeClearanceM } },
      ],
    });

  if (filters.propertyTypes?.length) and.push({ propertyType: { in: filters.propertyTypes } });
  if (filters.bedsMin != null) and.push({ bedrooms: { greater_than_equal: filters.bedsMin } });
  if (filters.bathsMin != null) and.push({ bathrooms: { greater_than_equal: filters.bathsMin } });
  if (filters.minBuiltSqm != null) and.push({ builtAreaSqm: { greater_than_equal: filters.minBuiltSqm } });
  if (filters.minPlotSqm != null) and.push({ plotAreaSqm: { greater_than_equal: filters.minPlotSqm } });

  if (filters.orientations?.length) and.push({ orientation: { in: filters.orientations } });
  if (filters.beachTypes?.length) and.push({ beachType: { in: filters.beachTypes } });
  if (filters.tenures?.length) and.push({ tenure: { in: filters.tenures } });

  if (filters.country) and.push({ 'location.country': { equals: filters.country } });
  if (filters.destinationId != null)
    and.push({ 'location.destination': { equals: filters.destinationId } });
  if (filters.status) and.push({ status: { equals: filters.status } });

  if (filters.bbox) and.push(withinBboxWhere('location.coordinates', filters.bbox));

  return { and };
}

export function sortToPayload(sort: PropertyFilters['sort']): string {
  switch (sort) {
    case 'price_asc':
      return 'priceEur';
    case 'price_desc':
      return '-priceEur';
    case 'frontage_desc':
      return '-waterFrontageM';
    case 'newest':
    default:
      return '-publishedAt';
  }
}
