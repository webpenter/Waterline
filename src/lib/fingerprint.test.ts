import { describe, expect, it } from 'vitest';

import { computeFingerprint } from './fingerprint';

const base = {
  latitude: 44.30345,
  longitude: 9.20991,
  propertyType: 'villa',
  builtAreaSqm: 740,
  bedrooms: 6,
};

describe('computeFingerprint (spec §8.8 duplicate detection)', () => {
  it('is deterministic', () => {
    expect(computeFingerprint(base)).toBe(computeFingerprint({ ...base }));
  });

  it('ignores coordinate noise below 4 decimal places (~11 m)', () => {
    const jittered = { ...base, latitude: 44.303449, longitude: 9.209905 };
    expect(computeFingerprint(jittered)).toBe(computeFingerprint(base));
  });

  it('changes when the property moves beyond rounding distance', () => {
    expect(computeFingerprint({ ...base, latitude: 44.31 })).not.toBe(computeFingerprint(base));
  });

  it('buckets built area into 50 m² bands', () => {
    expect(computeFingerprint({ ...base, builtAreaSqm: 749 })).toBe(computeFingerprint(base));
    expect(computeFingerprint({ ...base, builtAreaSqm: 751 })).not.toBe(
      computeFingerprint(base),
    );
  });

  it('distinguishes bedroom counts', () => {
    expect(computeFingerprint({ ...base, bedrooms: 7 })).not.toBe(computeFingerprint(base));
  });

  it('handles missing fields without throwing', () => {
    expect(computeFingerprint({})).toMatch(/^[a-f0-9]{64}$/);
  });
});
