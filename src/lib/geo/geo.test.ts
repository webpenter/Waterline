import { describe, expect, it } from 'vitest';

import { bboxToPolygon, distanceMeters, jitterCoordinates, type LngLat } from './index';

const portofino: LngLat = [9.2099, 44.3034];

describe('jitterCoordinates (spec §6.6 privacy)', () => {
  it('is deterministic: the point NEVER moves between requests', () => {
    const a = jitterCoordinates(portofino, 'listing-42');
    const b = jitterCoordinates(portofino, 'listing-42');
    expect(a).toEqual(b);
  });

  it('stays within the 500 m radius', () => {
    for (const seed of ['a', 'b', 'c', 1, 2, 3]) {
      const jittered = jitterCoordinates(portofino, seed);
      expect(distanceMeters(portofino, jittered)).toBeLessThanOrEqual(505);
    }
  });

  it('never returns the exact point', () => {
    for (const seed of ['x', 'y', 'z', 99]) {
      const jittered = jitterCoordinates(portofino, seed);
      expect(distanceMeters(portofino, jittered)).toBeGreaterThan(100);
    }
  });

  it('different listings jitter differently', () => {
    expect(jitterCoordinates(portofino, 'one')).not.toEqual(jitterCoordinates(portofino, 'two'));
  });
});

describe('bboxToPolygon', () => {
  it('produces a closed GeoJSON ring in lng/lat order', () => {
    const polygon = bboxToPolygon({ west: 8, south: 43, east: 10, north: 45 });
    expect(polygon.type).toBe('Polygon');
    const ring = polygon.coordinates[0];
    expect(ring).toHaveLength(5);
    expect(ring?.[0]).toEqual(ring?.[4]);
    expect(ring?.[0]).toEqual([8, 43]);
    expect(ring?.[2]).toEqual([10, 45]);
  });
});
