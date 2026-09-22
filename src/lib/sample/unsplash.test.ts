import { describe, expect, it } from 'vitest';

import { galleryPlan, passesSelectionFilters, selectGallery } from './unsplash';

describe('§13.2.2 selection filters', () => {
  it('rejects images under 1600 px on the long edge', () => {
    expect(passesSelectionFilters({ width: 1200, height: 800 })).toBe(false);
    expect(passesSelectionFilters({ width: 800, height: 1599 })).toBe(false);
    expect(passesSelectionFilters({ width: 2400, height: 1600 })).toBe(true);
    expect(passesSelectionFilters({ width: 1000, height: 1700 })).toBe(true);
  });
});

describe('§13.2.2 gallery grammar', () => {
  it('composes 1 hero, 2 exterior, 3–5 interior, 1 aerial, 1 detail (8–14 total)', () => {
    for (let index = 0; index < 10; index += 1) {
      const plan = galleryPlan(index);
      const roles = plan.map((p) => p.role);
      expect(roles.filter((r) => r === 'hero')).toHaveLength(1);
      expect(roles.filter((r) => r === 'exterior')).toHaveLength(2);
      expect(roles.filter((r) => r === 'interior').length).toBeGreaterThanOrEqual(3);
      expect(roles.filter((r) => r === 'interior').length).toBeLessThanOrEqual(5);
      expect(roles.filter((r) => r === 'aerial')).toHaveLength(1);
      expect(roles.filter((r) => r === 'detail')).toHaveLength(1);
      expect(plan.length).toBeGreaterThanOrEqual(8);
      expect(plan.length).toBeLessThanOrEqual(14);
    }
  });
});

describe('deduplicating selector', () => {
  const big = { width: 2400, height: 1600 };
  it('never reuses a photo id or blur_hash within a destination', () => {
    const pools = {
      destination: [
        { id: 'a', blur_hash: 'H1', ...big },
        { id: 'b', blur_hash: 'H1', ...big }, // near-duplicate of a
        { id: 'c', blur_hash: 'H2', ...big },
      ],
      interior: [
        { id: 'a', blur_hash: 'H1', ...big }, // already used
        { id: 'd', blur_hash: 'H3', ...big },
      ],
      private_dock: [{ id: 'e', blur_hash: 'H4', ...big }],
      pool: [{ id: 'e2', blur_hash: 'H5', ...big }],
      aerial: [{ id: 'f', blur_hash: 'H6', ...big }],
      detail: [{ id: 'g', blur_hash: 'H7', ...big }],
    };
    const used = new Set<string>();
    const hashes = new Set<string>();
    const chosen = selectGallery(galleryPlan(0), pools, used, hashes);
    const ids = chosen.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).not.toContain('b'); // blur-hash duplicate of a
  });

  it('skips undersized candidates', () => {
    const pools = {
      destination: [
        { id: 'small', blur_hash: 'S', width: 1000, height: 700 },
        { id: 'ok', blur_hash: 'O', ...big },
      ],
    };
    const chosen = selectGallery(
      [{ role: 'hero', query: 'destination' }],
      pools,
      new Set(),
      new Set(),
    );
    expect(chosen[0]?.id).toBe('ok');
  });
});
