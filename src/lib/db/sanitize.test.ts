import { describe, expect, it } from 'vitest';

import { distanceMeters, type LngLat } from '@/lib/geo';
import { toSearchDocument } from '@/lib/search/document';

import { sanitizePropertyForPublic } from './sanitize';

const exact: LngLat = [9.2099, 44.3034];

function approximateListing(id: number) {
  return {
    id,
    slug: 'villa-portofino',
    title: 'Villa',
    location: {
      addressLine: 'Via Secreta 1',
      locality: 'Portofino',
      coordinates: exact,
      coordinatePrecision: 'approximate_500m',
    },
  };
}

// Prompt 5 acceptance: approximate listings never expose exact coordinates in
// any API response — asserted on the JSON payload, not the UI.
describe('sanitizePropertyForPublic (spec §6.6)', () => {
  it('never returns the exact coordinates for approximate listings', () => {
    const sanitized = sanitizePropertyForPublic(approximateListing(42));
    const publicCoords = sanitized.location?.coordinates as LngLat;
    expect(publicCoords).not.toEqual(exact);
    expect(distanceMeters(exact, publicCoords)).toBeGreaterThan(100);
    expect(distanceMeters(exact, publicCoords)).toBeLessThanOrEqual(505);
    // Assert on the serialized payload — the exact values are truly absent.
    expect(JSON.stringify(sanitized)).not.toContain(String(exact[0]));
    expect(JSON.stringify(sanitized)).not.toContain(String(exact[1]));
  });

  it('is stable across calls (the circle never moves)', () => {
    expect(sanitizePropertyForPublic(approximateListing(42)).location?.coordinates).toEqual(
      sanitizePropertyForPublic(approximateListing(42)).location?.coordinates,
    );
  });

  it('removes coordinates entirely when precision is hidden', () => {
    const doc = approximateListing(7);
    doc.location.coordinatePrecision = 'hidden';
    expect(sanitizePropertyForPublic(doc).location?.coordinates).toBeNull();
  });

  it('always strips the admin-only addressLine', () => {
    for (const precision of ['exact', 'approximate_500m', 'hidden']) {
      const doc = approximateListing(9);
      doc.location.coordinatePrecision = precision;
      const sanitized = sanitizePropertyForPublic(doc);
      expect(JSON.stringify(sanitized)).not.toContain('Via Secreta');
    }
  });

  it('leaves exact-precision coordinates untouched', () => {
    const doc = approximateListing(3);
    doc.location.coordinatePrecision = 'exact';
    expect(sanitizePropertyForPublic(doc).location?.coordinates).toEqual(exact);
  });
});

describe('toSearchDocument sanitizes before indexing', () => {
  it('the search index never receives exact coordinates for approximate listings', () => {
    const doc = toSearchDocument(approximateListing(42));
    const geo = doc.location as [number, number];
    // Typesense geopoint is [lat, lng].
    expect(distanceMeters(exact, [geo[1], geo[0]])).toBeGreaterThan(100);
    expect(JSON.stringify(doc)).not.toContain('Via Secreta');
  });
});
