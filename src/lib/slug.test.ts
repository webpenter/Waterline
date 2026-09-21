import { describe, expect, it } from 'vitest';

import { slugify } from './slug';

describe('slugify (spec §6.1 — SEO-critical, immutable after first publish)', () => {
  it('joins parts into a kebab-case slug', () => {
    expect(slugify('Villa with private dock', 'Portofino', 'Liguria')).toBe(
      'villa-with-private-dock-portofino-liguria',
    );
  });

  it('strips diacritics', () => {
    expect(slugify("Cap d'Antibes", 'Côte d’Azur')).toBe('cap-d-antibes-cote-d-azur');
  });

  it('skips empty parts', () => {
    expect(slugify('Title', undefined, null, '  ')).toBe('title');
  });

  it('caps length at 96 characters without a trailing hyphen', () => {
    const slug = slugify('a'.repeat(60), 'b'.repeat(60));
    expect(slug.length).toBeLessThanOrEqual(96);
    expect(slug.endsWith('-')).toBe(false);
  });
});
