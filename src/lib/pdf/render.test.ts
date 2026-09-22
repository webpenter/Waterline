import { describe, expect, it } from 'vitest';

import { FALLBACK_PROPERTIES } from '@/lib/sample/fallback';

import { renderBrochure, staticMapUrl } from './render';

describe('renderBrochure', () => {
  it('renders a valid PDF for a fallback property', async () => {
    const property = FALLBACK_PROPERTIES[0];
    const pdf = await renderBrochure(property, 'en');
    expect(pdf.subarray(0, 5).toString('latin1')).toBe('%PDF-');
    expect(pdf.length).toBeGreaterThan(1000);
  }, 30_000);

  it('renders non-English locales without throwing', async () => {
    const property = FALLBACK_PROPERTIES[1];
    const pdf = await renderBrochure(property, 'de');
    expect(pdf.subarray(0, 5).toString('latin1')).toBe('%PDF-');
  }, 30_000);
});

describe('staticMapUrl', () => {
  it('returns null without a real MapTiler key', () => {
    expect(staticMapUrl(FALLBACK_PROPERTIES[0])).toBeNull();
  });
});
