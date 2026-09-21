import { describe, expect, it } from 'vitest';

import type { Where } from 'payload';

import { filtersToWhere, publicPredicate, sortToPayload } from './filters';

function clauses(where: Where): Where[] {
  return (where.and ?? []) as Where[];
}

describe('publicPredicate', () => {
  it('always requires in-market/under-offer, public, approved, published', () => {
    const and = clauses(publicPredicate());
    expect(and).toContainEqual({ status: { in: ['in_market', 'under_offer'] } });
    expect(and).toContainEqual({ visibility: { equals: 'public' } });
    expect(and).toContainEqual({ moderation: { equals: 'approved' } });
    expect(and).toContainEqual({ _status: { equals: 'published' } });
  });

  it('excludes samples unless SAMPLE_DATA_ENABLED=true', () => {
    const prev = process.env.SAMPLE_DATA_ENABLED;
    process.env.SAMPLE_DATA_ENABLED = 'false';
    expect(clauses(publicPredicate())).toContainEqual({ isSample: { not_equals: true } });
    process.env.SAMPLE_DATA_ENABLED = 'true';
    expect(clauses(publicPredicate())).not.toContainEqual({ isSample: { not_equals: true } });
    process.env.SAMPLE_DATA_ENABLED = prev;
  });
});

describe('filtersToWhere — every nautical filter (Prompt 5 acceptance)', () => {
  it('boat LOA: berth must take the boat', () => {
    expect(clauses(filtersToWhere({ boatLoaM: 24 }))).toContainEqual({
      maxBoatLoaM: { greater_than_equal: 24 },
    });
  });

  it('draft: depth at berth must be at least the draft', () => {
    expect(clauses(filtersToWhere({ boatDraftM: 2.5 }))).toContainEqual({
      waterDepthAtBerthM: { greater_than_equal: 2.5 },
    });
  });

  it('beam: berth width must take the beam', () => {
    expect(clauses(filtersToWhere({ boatBeamM: 6.4 }))).toContainEqual({
      maxBoatBeamM: { greater_than_equal: 6.4 },
    });
  });

  it('navigable to open sea', () => {
    expect(clauses(filtersToWhere({ navigableToOpenSea: true }))).toContainEqual({
      navigableToOpenSea: { equals: true },
    });
  });

  it('no fixed bridges', () => {
    expect(clauses(filtersToWhere({ noFixedBridges: true }))).toContainEqual({
      fixedBridgesToOpenSea: { not_equals: true },
    });
  });

  it('bridge clearance: no bridges OR clearance is sufficient', () => {
    expect(clauses(filtersToWhere({ minBridgeClearanceM: 18 }))).toContainEqual({
      or: [
        { fixedBridgesToOpenSea: { not_equals: true } },
        { minBridgeClearanceM: { greater_than_equal: 18 } },
      ],
    });
  });

  it('min frontage', () => {
    expect(clauses(filtersToWhere({ minFrontageM: 25 }))).toContainEqual({
      waterFrontageM: { greater_than_equal: 25 },
    });
  });

  it('price range, beds, baths, areas, enums, country, destination, status', () => {
    const and = clauses(
      filtersToWhere({
        priceMinEur: 2_000_000,
        priceMaxEur: 10_000_000,
        bedsMin: 4,
        bathsMin: 3,
        minBuiltSqm: 400,
        minPlotSqm: 1000,
        waterBodyTypes: ['sea', 'lake'],
        waterAccessTypes: ['private_dock'],
        propertyTypes: ['villa'],
        orientations: ['SW'],
        beachTypes: ['sand'],
        tenures: ['freehold'],
        country: 'IT',
        destinationId: 7,
        status: 'in_market',
      }),
    );
    expect(and).toContainEqual({ priceEur: { greater_than_equal: 2_000_000 } });
    expect(and).toContainEqual({ priceEur: { less_than_equal: 10_000_000 } });
    expect(and).toContainEqual({ bedrooms: { greater_than_equal: 4 } });
    expect(and).toContainEqual({ bathrooms: { greater_than_equal: 3 } });
    expect(and).toContainEqual({ builtAreaSqm: { greater_than_equal: 400 } });
    expect(and).toContainEqual({ plotAreaSqm: { greater_than_equal: 1000 } });
    expect(and).toContainEqual({ waterBodyType: { in: ['sea', 'lake'] } });
    expect(and).toContainEqual({ waterAccessType: { in: ['private_dock'] } });
    expect(and).toContainEqual({ propertyType: { in: ['villa'] } });
    expect(and).toContainEqual({ orientation: { in: ['SW'] } });
    expect(and).toContainEqual({ beachType: { in: ['sand'] } });
    expect(and).toContainEqual({ tenure: { in: ['freehold'] } });
    expect(and).toContainEqual({ 'location.country': { equals: 'IT' } });
    expect(and).toContainEqual({ 'location.destination': { equals: 7 } });
    expect(and).toContainEqual({ status: { equals: 'in_market' } });
  });

  it('map bbox becomes a polygon within-clause', () => {
    const and = clauses(filtersToWhere({ bbox: { west: 8, south: 43, east: 10, north: 45 } }));
    const bboxClause = and.find((c) => 'location.coordinates' in c);
    expect(bboxClause).toBeTruthy();
  });

  it('empty filters still apply the public predicate', () => {
    const and = clauses(filtersToWhere({}));
    expect(and).toHaveLength(1);
    expect(and[0]).toEqual(publicPredicate());
  });
});

describe('sortToPayload', () => {
  it('maps every sort option', () => {
    expect(sortToPayload('price_asc')).toBe('priceEur');
    expect(sortToPayload('price_desc')).toBe('-priceEur');
    expect(sortToPayload('frontage_desc')).toBe('-waterFrontageM');
    expect(sortToPayload('newest')).toBe('-publishedAt');
    expect(sortToPayload(undefined)).toBe('-publishedAt');
  });
});
