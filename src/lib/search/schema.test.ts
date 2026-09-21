import { describe, expect, it } from 'vitest';

import { filtersToTypesense, sortToTypesense } from './schema';

describe('filtersToTypesense — mirrors the Postgres path (Prompt 5 acceptance)', () => {
  it('always applies the public status filter', () => {
    expect(filtersToTypesense({})).toContain('status:=[`in_market`,`under_offer`]');
  });

  it('translates every nautical filter', () => {
    const filterBy = filtersToTypesense({
      boatLoaM: 24,
      boatDraftM: 2.5,
      boatBeamM: 6.4,
      navigableToOpenSea: true,
      noFixedBridges: true,
      minBridgeClearanceM: 18,
      minFrontageM: 25,
    });
    expect(filterBy).toContain('maxBoatLoaM:>=24');
    expect(filterBy).toContain('waterDepthAtBerthM:>=2.5');
    expect(filterBy).toContain('maxBoatBeamM:>=6.4');
    expect(filterBy).toContain('navigableToOpenSea:=true');
    expect(filterBy).toContain('fixedBridgesToOpenSea:=false');
    expect(filterBy).toContain('(fixedBridgesToOpenSea:=false || minBridgeClearanceM:>=18)');
    expect(filterBy).toContain('waterFrontageM:>=25');
  });

  it('translates ranges, enums, geography and status', () => {
    const filterBy = filtersToTypesense({
      priceMinEur: 2_000_000,
      priceMaxEur: 10_000_000,
      waterBodyTypes: ['sea', 'lake'],
      propertyTypes: ['villa'],
      country: 'IT',
      destinationId: 7,
      status: 'in_market',
      bedsMin: 4,
      bbox: { west: 8, south: 43, east: 10, north: 45 },
    });
    expect(filterBy).toContain('priceEur:>=2000000');
    expect(filterBy).toContain('priceEur:<=10000000');
    expect(filterBy).toContain('waterBodyType:=[`sea`,`lake`]');
    expect(filterBy).toContain('propertyType:=[`villa`]');
    expect(filterBy).toContain('country:=`IT`');
    expect(filterBy).toContain('destinationId:=7');
    expect(filterBy).toContain('status:=`in_market`');
    expect(filterBy).toContain('bedrooms:>=4');
    expect(filterBy).toContain('location:(43,8,43,10,45,10,45,8)');
  });

  it('strips backticks so user input cannot escape its quoted token (no filter injection)', () => {
    const filterBy = filtersToTypesense({ country: 'IT`) || isSample:=true || (`' });
    // The stripped payload stays inside ONE backtick pair — it cannot close the
    // quote and inject additional clauses.
    expect(filterBy).toContain('country:=`IT) || isSample:=true || (`');
    expect(filterBy).not.toContain('``');
  });
});

describe('sortToTypesense', () => {
  it('maps every sort option', () => {
    expect(sortToTypesense('price_asc')).toBe('priceEur:asc');
    expect(sortToTypesense('price_desc')).toBe('priceEur:desc');
    expect(sortToTypesense('frontage_desc')).toBe('waterFrontageM:desc');
    expect(sortToTypesense(undefined)).toBe('publishedAtTs:desc');
  });
});
