import { getPayload, Payload } from 'payload';
import config from '@/payload.config';

import { describe, it, beforeAll, afterAll, expect } from 'vitest';

// Prompt 3 acceptance criteria, proven against a real Postgres+PostGIS database.
// Requires a reachable DATABASE_URL (CI service container or local Docker).

let payload: Payload;
let agencyId: number;

describe('Property collection (Prompt 3 acceptance)', () => {
  beforeAll(async () => {
    payload = await getPayload({ config: await config });
    const agency = await payload.create({
      collection: 'agencies',
      data: { name: 'Test Agency', slug: `test-agency-${Date.now()}` },
    });
    agencyId = agency.id;
  });

  afterAll(async () => {
    await payload.delete({
      collection: 'properties',
      where: { reference: { like: 'INT-TEST-%' } },
    });
    await payload.delete({ collection: 'agencies', where: { id: { equals: agencyId } } });
  });

  const validBase = () => ({
    title: 'Integration test villa',
    reference: `INT-TEST-${Math.random().toString(36).slice(2)}`,
    agency: agencyId,
    propertyType: 'villa' as const,
    priceType: 'fixed' as const,
    currency: 'EUR' as const,
    waterBodyType: 'sea' as const,
    waterAccessType: ['private_dock'] as 'private_dock'[],
    distanceToWaterM: 0,
    status: 'in_market' as const,
    moderation: 'approved' as const,
    visibility: 'public' as const,
    sourceType: 'manual' as const,
  });

  it('cannot publish without a waterAccessType', async () => {
    await expect(
      payload.create({
        collection: 'properties',
        data: { ...validBase(), waterAccessType: [], _status: 'published' },
      }),
    ).rejects.toThrow();
  });

  it('cannot publish with distanceToWaterM = 51', async () => {
    await expect(
      payload.create({
        collection: 'properties',
        data: { ...validBase(), distanceToWaterM: 51, _status: 'published' },
      }),
    ).rejects.toThrow();
  });

  it('can publish a valid listing, and priceEur is computed for a USD price', async () => {
    const created = await payload.create({
      collection: 'properties',
      data: {
        ...validBase(),
        currency: 'USD',
        priceAmount: 10_800_000,
        _status: 'published',
      },
    });
    expect(created.priceEur).toBeGreaterThan(8_000_000);
    expect(created.priceEur).toBeLessThan(12_000_000);
    expect(created.slug).toBeTruthy();
    expect(created.fingerprint).toMatch(/^[a-f0-9]{64}$/);
    expect(created.expiresAt).toBeTruthy();
  });

  it('allows saving an inadmissible listing as a draft, with the reason in moderationNote', async () => {
    const draft = await payload.create({
      collection: 'properties',
      data: { ...validBase(), status: 'draft', distanceToWaterM: 300, _status: 'draft' },
      draft: true,
    });
    expect(draft.moderationNote).toContain('50');
  });
});
