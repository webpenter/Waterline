import { describe, expect, it } from 'vitest';

import { findNarrowestFilter } from './narrowest-filter';
import type { PropertyFilters } from './filters';

describe('findNarrowestFilter (computed empty state)', () => {
  it('identifies the filter whose removal unlocks the most results', async () => {
    const countFn = async (filters: PropertyFilters) => {
      if (filters.minFrontageM === undefined) return 42; // frontage was the blocker
      if (filters.boatLoaM === undefined) return 3;
      return 0;
    };
    const result = await findNarrowestFilter(
      { minFrontage: '80', boatLoa: '24', draft: '2.5', water: 'sea' },
      countFn,
    );
    expect(result).toEqual({ params: ['minFrontage'], count: 42 });
  });

  it('relaxes the boat dimensions as one unit', async () => {
    const countFn = async (filters: PropertyFilters) =>
      filters.boatLoaM === undefined && filters.boatDraftM === undefined ? 12 : 0;
    const result = await findNarrowestFilter({ boatLoa: '60', draft: '4' }, countFn);
    expect(result).toEqual({ params: ['boatLoa', 'draft', 'beam'], count: 12 });
  });

  it('returns null when no filters are active', async () => {
    expect(await findNarrowestFilter({ sort: 'newest' }, async () => 99)).toBeNull();
  });

  it('returns null when the counting engine is down', async () => {
    const result = await findNarrowestFilter({ water: 'sea' }, async () => {
      throw new Error('db down');
    });
    expect(result).toBeNull();
  });

  it('returns null when relaxing nothing helps', async () => {
    expect(await findNarrowestFilter({ water: 'sea', beds: '20' }, async () => 0)).toBeNull();
  });
});
