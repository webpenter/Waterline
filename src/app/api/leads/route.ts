import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';

import { getPayloadClient } from '@/lib/db';

// Lead intake (§5.3, §8.9). The public REST surface of the Leads collection
// stays closed — this route is the only anonymous write path. Full consent
// logging, email notification and durable rate limiting land with Prompt 12;
// the in-memory limiter below already blunts naive abuse.

const leadSchema = z.object({
  name: z.string().min(2).max(200),
  email: z.string().email().max(320),
  phone: z.string().max(50).optional(),
  message: z.string().max(5000).optional(),
  /** Absent for landing/contact leads — those route to the internal desk (§8.9). */
  propertyId: z.number().int().positive().optional(),
  source: z.enum(['contact', 'property', 'landing', 'boat_filter', 'whatsapp', 'list_with_us'])
    .default('property'),
  consent: z.literal(true),
  locale: z.enum(['en', 'it', 'fr', 'de', 'es', 'ru']).optional(),
  /** Honeypot — humans never see it; any value means a bot. */
  website: z.string().max(0).optional(),
});

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > MAX_PER_WINDOW;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (rateLimited(ip)) {
    return NextResponse.json({ ok: false }, { status: 429 });
  }

  let parsed: z.infer<typeof leadSchema>;
  try {
    parsed = leadSchema.parse(await request.json());
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  // Honeypot triggered: pretend success, store nothing.
  if (parsed.website !== undefined && parsed.website !== '') {
    return NextResponse.json({ ok: true }, { status: 201 });
  }

  try {
    const payload = await getPayloadClient();

    let propertyId: number | undefined;
    let agencyId: number | undefined;
    let agentId: number | undefined;
    if (parsed.propertyId != null) {
      const property = await payload.findByID({
        collection: 'properties',
        id: parsed.propertyId,
        depth: 0,
        overrideAccess: true,
      });
      propertyId = property.id;
      agencyId = typeof property.agency === 'object' ? property.agency.id : property.agency;
      agentId =
        property.agent == null
          ? undefined
          : typeof property.agent === 'object'
            ? property.agent.id
            : property.agent;
    }

    await payload.create({
      collection: 'leads',
      overrideAccess: true,
      data: {
        name: parsed.name,
        email: parsed.email,
        phone: parsed.phone,
        message: parsed.message,
        property: propertyId,
        agency: agencyId,
        agent: agentId,
        locale: parsed.locale,
        source: parsed.source,
        status: 'new',
        consent: {
          consentMarketing: true,
          consentedAt: new Date().toISOString(),
          consentIp: ip,
        },
      },
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error('[leads] intake failed:', err);
    return NextResponse.json({ ok: false }, { status: 503 });
  }
}
