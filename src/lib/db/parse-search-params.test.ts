import { describe, expect, it } from 'vitest';

import { activeFilterParams, parseSearchParams, queryWithout } from './parse-search-params';

describe('parseSearchParams — the §5.5 URL contract', () => {
  it('parses the spec example URL exactly', () => {
    const filters = parseSearchParams({
      water: 'sea,lake',
      access: 'private_dock',
      minFrontage: '25',
      boatLoa: '24',
      draft: '2.5',
      price: '2000000-10000000',
      type: 'villa,estate',
      beds: '4',
      bbox: '8.1,44.2,9.6,44.6',
      sort: 'frontage_desc',
      page: '2',
    });
    expect(filters).toEqual({
      waterBodyTypes: ['sea', 'lake'],
      waterAccessTypes: ['private_dock'],
      minFrontageM: 25,
      boatLoaM: 24,
      boatDraftM: 2.5,
      priceMinEur: 2_000_000,
      priceMaxEur: 10_000_000,
      propertyTypes: ['villa', 'estate'],
      bedsMin: 4,
      bbox: { west: 8.1, south: 44.2, east: 9.6, north: 44.6 },
      sort: 'frontage_desc',
      page: 2,
    });
  });

  it('drops values outside the controlled enums', () => {
    expect(parseSearchParams({ water: 'sea,jacuzzi' })).toEqual({ waterBodyTypes: ['sea'] });
    expect(parseSearchParams({ type: 'castle,timeshare' })).toEqual({
      propertyTypes: ['castle'],
    });
    expect(parseSearchParams({ sort: 'random' })).toEqual({});
  });

  it('handles open-ended price ranges', () => {
    expect(parseSearchParams({ price: '2000000-' })).toEqual({ priceMinEur: 2_000_000 });
    expect(parseSearchParams({ price: '-5000000' })).toEqual({ priceMaxEur: 5_000_000 });
  });

  it('rejects malformed numbers, negative values and bad bboxes', () => {
    expect(parseSearchParams({ boatLoa: 'abc' })).toEqual({});
    expect(parseSearchParams({ beds: '-2' })).toEqual({});
    expect(parseSearchParams({ bbox: '10,44,8,45' })).toEqual({}); // west >= east
    expect(parseSearchParams({ bbox: '8,44,10' })).toEqual({});
  });

  it('parses booleans and country', () => {
    expect(parseSearchParams({ openSea: '1', noBridges: 'true', country: 'it' })).toEqual({
      navigableToOpenSea: true,
      noFixedBridges: true,
      country: 'IT',
    });
    expect(parseSearchParams({ openSea: '0', country: 'italy' })).toEqual({});
  });
});

describe('activeFilterParams', () => {
  it('lists only params that parsed into real filters', () => {
    expect(
      activeFilterParams({ water: 'sea', boatLoa: '24', sort: 'newest', page: '3', beds: 'x' }),
    ).toEqual(['water', 'boatLoa']);
  });
});

describe('queryWithout', () => {
  it('removes the named params and resets pagination', () => {
    expect(
      queryWithout({ water: 'sea', boatLoa: '24', draft: '2.5', page: '3' }, ['boatLoa', 'draft']),
    ).toBe('?water=sea');
  });

  it('returns an empty string when nothing remains', () => {
    expect(queryWithout({ water: 'sea' }, ['water'])).toBe('');
  });
});
