import { parseStringPromise } from 'xml2js';

import type { RawRow } from '../validate-row';

/**
 * Kyero XML feed adapter (§8.5): maps the common Kyero v3 property shape onto
 * the §8.4 column set so validation, mapping and idempotency are shared with
 * CSV imports. Kyero has no water taxonomy — those columns arrive empty unless
 * the agency's stored fieldMapping maps custom nodes onto them, and the
 * dry-run report tells the agency exactly which rows need completing.
 */

type KyeroProperty = Record<string, unknown>;

function first(value: unknown): string {
  if (Array.isArray(value)) return first(value[0]);
  if (value == null) return '';
  if (typeof value === 'object') return '';
  return String(value);
}

function get(node: KyeroProperty, path: string[]): unknown {
  let current: unknown = node;
  for (const key of path) {
    if (current == null || typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[key];
    if (Array.isArray(current)) current = current[0];
  }
  return current;
}

function images(node: KyeroProperty): string {
  const container = get(node, ['images']);
  if (container == null || typeof container !== 'object') return '';
  const image = (container as Record<string, unknown>).image;
  const list = Array.isArray(image) ? image : image ? [image] : [];
  return list
    .map((entry) =>
      typeof entry === 'object' && entry !== null
        ? first((entry as Record<string, unknown>).url)
        : first(entry),
    )
    .filter(Boolean)
    .join('|');
}

export async function parseKyeroFeed(
  xml: string,
  fieldMapping: Record<string, string> = {},
): Promise<RawRow[]> {
  const parsed = (await parseStringPromise(xml, { explicitArray: true })) as {
    root?: { property?: KyeroProperty[] };
    kyero?: { property?: KyeroProperty[] };
  };
  const properties = parsed.root?.property ?? parsed.kyero?.property ?? [];

  return properties.map((node) => {
    const row: RawRow = {
      reference: first(node.ref ?? node.id),
      title_en: first(get(node, ['title', 'en'])) || first(get(node, ['type'])),
      description_en: first(get(node, ['desc', 'en'])),
      property_type: first(node.type).toLowerCase(),
      status: 'pending_review',
      price_type: 'fixed',
      price_amount: first(node.price),
      currency: (first(node.currency) || 'EUR').toUpperCase(),
      bedrooms: first(node.beds),
      bathrooms: first(node.baths),
      built_area_sqm: first(get(node, ['surface_area', 'built'])),
      plot_area_sqm: first(get(node, ['surface_area', 'plot'])),
      country: first(node.country),
      province: first(node.province),
      locality: first(node.town),
      latitude: first(get(node, ['location', 'latitude'])),
      longitude: first(get(node, ['location', 'longitude'])),
      image_urls: images(node),
    };

    // Agency-stored mapping (§8.5): source node path → our column name.
    for (const [sourcePath, column] of Object.entries(fieldMapping)) {
      const value = first(get(node, sourcePath.split('.')));
      if (value) row[column] = value;
    }
    return row;
  });
}
