import { describe, expect, it } from 'vitest';

import { parseKyeroFeed } from './adapters/kyero';
import { parseNativeJsonFeed } from './adapters/native-json';
import { imageUrlsFromRow, mapRowToListing } from './map-row';
import { validateRow, type RawRow } from './validate-row';

const VALID_ROW: RawRow = {
  reference: 'AG-001',
  title_en: 'Villa with private dock',
  description_en: 'A'.repeat(320),
  property_type: 'villa',
  status: 'pending_review',
  price_type: 'fixed',
  price_amount: '14500000',
  currency: 'EUR',
  bedrooms: '6',
  bathrooms: '5',
  built_area_sqm: '740',
  water_body_type: 'sea',
  water_access_types: 'private_dock|direct_shore',
  distance_to_water_m: '0',
  water_frontage_m: '38',
  country: 'IT',
  locality: 'Portofino',
  latitude: '44.3034',
  longitude: '9.2099',
  image_urls: Array.from({ length: 6 }, (_, i) => `https://img.example/p${i}.jpg`).join('|'),
};

describe('validateRow (§8.4 dry-run report)', () => {
  it('passes a fully valid row with no issues', () => {
    const report = validateRow(VALID_ROW, 2);
    expect(report.status).toBe('ok');
    expect(report.issues).toEqual([]);
  });

  it('rejects distance_to_water_m=80 with a clear column-level reason (acceptance)', () => {
    const report = validateRow({ ...VALID_ROW, distance_to_water_m: '80' }, 3);
    expect(report.status).toBe('error');
    const issue = report.issues.find((i) => i.column === 'distance_to_water_m');
    expect(issue?.reason).toContain('80');
    expect(issue?.reason).toContain('50');
  });

  it('flags every missing required column by name', () => {
    const report = validateRow({ reference: 'X' }, 2);
    const columns = report.issues.filter((i) => i.severity === 'error').map((i) => i.column);
    for (const required of ['title_en', 'water_access_types', 'latitude', 'image_urls']) {
      expect(columns).toContain(required);
    }
  });

  it('rejects out-of-enum and non-numeric values with the offending value in the reason', () => {
    const report = validateRow(
      { ...VALID_ROW, property_type: 'timeshare', bedrooms: 'six' },
      2,
    );
    expect(report.status).toBe('error');
    expect(report.issues.find((i) => i.column === 'property_type')?.reason).toContain('timeshare');
    expect(report.issues.find((i) => i.column === 'bedrooms')?.reason).toContain('six');
  });

  it('warns (not errors) on fewer than 6 images and missing frontage', () => {
    const report = validateRow(
      { ...VALID_ROW, image_urls: 'https://img.example/a.jpg', water_frontage_m: '' },
      2,
    );
    expect(report.status).toBe('warning');
    expect(report.issues.every((i) => i.severity === 'warning')).toBe(true);
  });

  it('rejects (0,0) coordinates', () => {
    const report = validateRow({ ...VALID_ROW, latitude: '0', longitude: '0' }, 2);
    expect(report.issues.some((i) => i.reason.includes('(0,0)'))).toBe(true);
  });
});

describe('mapRowToListing (§8.4)', () => {
  const mapped = mapRowToListing(VALID_ROW, 42);

  it('maps scalars, enums, multis and location correctly', () => {
    expect(mapped.agency).toBe(42);
    expect(mapped.waterAccessType).toEqual(['private_dock', 'direct_shore']);
    expect(mapped.priceAmount).toBe(14_500_000);
    expect((mapped.location as { coordinates: number[] }).coordinates).toEqual([9.2099, 44.3034]);
    expect((mapped.location as { country: string }).country).toBe('IT');
  });

  it('never lets an import set lifecycle fields', () => {
    expect(mapped.status).toBe('pending_review');
    expect(mapped.moderation).toBe('unreviewed');
    expect(mapped).not.toHaveProperty('featured');
    expect(mapped).not.toHaveProperty('slug');
  });

  it('drops undefined keys so partial updates never blank existing data', () => {
    expect(Object.values(mapped).every((v) => v !== undefined)).toBe(true);
  });

  it('extracts and dedupes image urls', () => {
    expect(imageUrlsFromRow({ image_urls: 'https://a.jpg|https://a.jpg|https://b.jpg' })).toEqual([
      'https://a.jpg',
      'https://b.jpg',
    ]);
  });
});

const KYERO_SAMPLE = `<?xml version="1.0" encoding="utf-8"?>
<root>
  <kyero><feed_version>3</feed_version></kyero>
  <property>
    <id>77</id>
    <ref>KY-77</ref>
    <price>2500000</price>
    <currency>eur</currency>
    <type>villa</type>
    <town>Javea</town>
    <province>Alicante</province>
    <country>ES</country>
    <location><latitude>38.7894</latitude><longitude>0.1660</longitude></location>
    <beds>4</beds>
    <baths>3</baths>
    <surface_area><built>410</built><plot>1200</plot></surface_area>
    <desc><en>Seafront villa with mooring on the Arenal.</en></desc>
    <images>
      <image id="1"><url>https://img.example/ky1.jpg</url></image>
      <image id="2"><url>https://img.example/ky2.jpg</url></image>
    </images>
  </property>
</root>`;

describe('parseKyeroFeed (§8.5 adapter)', () => {
  it('maps the Kyero shape onto §8.4 columns', async () => {
    const rows = await parseKyeroFeed(KYERO_SAMPLE);
    expect(rows).toHaveLength(1);
    const row = rows[0] as RawRow;
    expect(row.reference).toBe('KY-77');
    expect(row.currency).toBe('EUR');
    expect(row.property_type).toBe('villa');
    expect(row.locality).toBe('Javea');
    expect(row.latitude).toBe('38.7894');
    expect(row.image_urls).toBe('https://img.example/ky1.jpg|https://img.example/ky2.jpg');
    expect(row.description_en).toContain('mooring');
  });

  it('applies the agency field mapping for water columns Kyero lacks', async () => {
    const rows = await parseKyeroFeed(KYERO_SAMPLE, {
      'custom.water_access': 'water_access_types',
    });
    // No custom node in the sample: column stays absent, and the dry-run
    // report will name exactly what the agency still has to supply.
    const report = validateRow(rows[0] as RawRow, 2);
    expect(report.status).toBe('error');
    expect(report.issues.some((i) => i.column === 'water_access_types')).toBe(true);
  });
});

describe('parseNativeJsonFeed (§8.5 native contract)', () => {
  it('normalises arrays and scalars onto the column shape', () => {
    const rows = parseNativeJsonFeed({
      listings: [
        {
          reference: 'NJ-1',
          water_access_types: ['private_dock', 'slipway'],
          distance_to_water_m: 5,
          swimmable: true,
        },
      ],
    });
    expect(rows[0]).toMatchObject({
      reference: 'NJ-1',
      water_access_types: 'private_dock|slipway',
      distance_to_water_m: '5',
      swimmable: 'true',
    });
  });

  it('rejects payloads that break the contract', () => {
    expect(() => parseNativeJsonFeed({ listings: [{}] })).toThrow();
    expect(() => parseNativeJsonFeed({ nope: [] })).toThrow();
  });
});
