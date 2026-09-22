import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';

import { describe, expect, it } from 'vitest';

import en from './en.json';

const MESSAGES_DIR = __dirname;
const LOCALES = ['it', 'fr', 'de', 'es', 'ru'];

function keyShape(obj: Record<string, unknown>, path: string[] = []): string[] {
  return Object.entries(obj).flatMap(([key, value]) => {
    if (key === '_meta') return [];
    const keyPath = [...path, key];
    return typeof value === 'object' && value !== null
      ? keyShape(value as Record<string, unknown>, keyPath)
      : [keyPath.join('.')];
  });
}

describe('message files (Prompt 6)', () => {
  it('ships a file for every locale', () => {
    const files = readdirSync(MESSAGES_DIR).filter((f) => f.endsWith('.json'));
    for (const locale of ['en', ...LOCALES]) {
      expect(files).toContain(`${locale}.json`);
    }
  });

  it('en.json carries the §11 copy deck anchors verbatim', () => {
    expect(en.home.heroTitle).toBe('Property where the water begins.');
    expect(en.home.boatStripTitle).toBe('Will it fit?');
    expect(en.listing.waterCredentialsTitle).toBe('Water credentials');
    expect(en.listing.nauticalTitle).toBe('Berth & navigation');
    expect(en.common.priceOnRequest).toBe('Price on request');
  });

  it('every locale file mirrors the en.json key shape exactly', () => {
    const enKeys = keyShape(en as unknown as Record<string, unknown>).sort();
    for (const locale of LOCALES) {
      const parsed = JSON.parse(
        readFileSync(join(MESSAGES_DIR, `${locale}.json`), 'utf8'),
      ) as Record<string, unknown>;
      expect(keyShape(parsed).sort(), `${locale}.json key shape`).toEqual(enKeys);
    }
  });

  it('locale files carry their translation status and no empty values', () => {
    for (const locale of LOCALES) {
      const parsed = JSON.parse(
        readFileSync(join(MESSAGES_DIR, `${locale}.json`), 'utf8'),
      ) as { _meta?: { status?: string } };
      // The UI translation pass is done; a regression back to
      // 'awaiting-translation' (or untagged files) should fail loudly.
      expect(parsed._meta?.status).toBe('translated-ui-pass');
      const flat = (node: unknown): string[] =>
        typeof node === 'string'
          ? [node]
          : node && typeof node === 'object'
            ? Object.entries(node)
                .filter(([key]) => key !== '_meta')
                .flatMap(([, value]) => flat(value))
            : [];
      expect(flat(parsed).filter((value) => value === '')).toEqual([]);
    }
  });
});
