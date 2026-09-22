import { describe, expect, it } from 'vitest';

import type { Property } from '@/payload-types';

import { isSimilar, rankSimilar } from './similar';

function listing(overrides: Partial<Property>): Property {
  return {
    id: 1,
    title: 'Subject',
    propertyType: 'villa',
    priceType: 'fixed',
    currency: 'EUR',
    waterBodyType: 'sea',
    agency: 1,
    status: 'in_market',
    moderation: 'approved',
    visibility: 'public',
    sourceType: 'manual',
    priceEur: 10_000_000,
    waterFrontageM: 38,
    location: { destination: 5 },
    updatedAt: '',
    createdAt: '',
    ...overrides,
  } as Property;
}

const subject = listing({ id: 1 });

describe('isSimilar (spec Prompt 8: swappable similar-listings logic)', () => {
  it('accepts same water body + price within ±35%', () => {
    expect(isSimilar(subject, listing({ id: 2, priceEur: 12_000_000, location: {} }))).toBe(true);
    expect(isSimilar(subject, listing({ id: 3, priceEur: 6_600_000, location: {} }))).toBe(true);
  });

  it('rejects price outside ±35% when destination differs', () => {
    expect(
      isSimilar(subject, listing({ id: 4, priceEur: 20_000_000, location: { destination: 9 } })),
    ).toBe(false);
  });

  it('accepts same destination even when price is far apart', () => {
    expect(
      isSimilar(subject, listing({ id: 5, priceEur: 25_000_000, location: { destination: 5 } })),
    ).toBe(true);
  });

  it('rejects a different water body outright', () => {
    expect(isSimilar(subject, listing({ id: 6, waterBodyType: 'lake' }))).toBe(false);
  });

  it('rejects sold and expired listings', () => {
    expect(isSimilar(subject, listing({ id: 7, status: 'sold' }))).toBe(false);
    expect(isSimilar(subject, listing({ id: 8, status: 'expired' }))).toBe(false);
  });

  it('rejects non-comparable frontage (outside half-to-double)', () => {
    expect(isSimilar(subject, listing({ id: 9, waterFrontageM: 100 }))).toBe(false);
    expect(isSimilar(subject, listing({ id: 10, waterFrontageM: 10 }))).toBe(false);
    expect(isSimilar(subject, listing({ id: 11, waterFrontageM: 60 }))).toBe(true);
  });

  it('never returns the subject itself', () => {
    expect(isSimilar(subject, subject)).toBe(false);
  });
});

describe('rankSimilar', () => {
  it('prefers same destination, then closest price, and respects the limit', () => {
    const candidates = [
      listing({ id: 20, priceEur: 13_000_000, location: { destination: 9 } }),
      listing({ id: 21, priceEur: 10_500_000, location: { destination: 9 } }),
      listing({ id: 22, priceEur: 24_000_000, location: { destination: 5 } }),
      listing({ id: 23, status: 'sold' }),
    ];
    const ranked = rankSimilar(subject, candidates, 2);
    expect(ranked.map((r) => r.id)).toEqual([22, 21]);
  });
});
