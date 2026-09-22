import { createHash } from 'crypto';

import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';

import { getPayloadClient } from '@/lib/db';
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit';

const consentSchema = z.object({
  analytics: z.boolean(),
  marketing: z.boolean(),
  locale: z.string().max(5).optional(),
});

// Stores the granular consent decision (Prompt 12). The IP is hashed — the
// record proves a decision was made without retaining the raw address.
export async function POST(request: NextRequest): Promise<NextResponse> {
  const limitResult = checkRateLimit(request, 'consent', { windowMs: 60 * 60 * 1000, max: 20 });
  if (!limitResult.success) {
    return rateLimitResponse(limitResult);
  }

  let parsed: z.infer<typeof consentSchema>;
  try {
    parsed = consentSchema.parse(await request.json());
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  try {
    const payload = await getPayloadClient();
    await payload.create({
      collection: 'consent-records',
      overrideAccess: true,
      data: {
        analytics: parsed.analytics,
        marketing: parsed.marketing,
        locale: parsed.locale,
        ipHash: createHash('sha256').update(ip).digest('hex').slice(0, 32),
        userAgent: request.headers.get('user-agent')?.slice(0, 250) ?? undefined,
      },
    });
  } catch (err) {
    // The cookie is the operative record client-side; the server log is
    // best-effort and must never break the banner.
    console.warn('[consent] record failed:', err);
  }
  return NextResponse.json({ ok: true });
}
