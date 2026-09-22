import { timingSafeEqual } from 'node:crypto';

import { NextResponse, type NextRequest } from 'next/server';

import { getPayloadClient } from '@/lib/db';
import { parseKyeroFeed } from '@/lib/import/adapters/kyero';
import { parseNativeJsonFeed } from '@/lib/import/adapters/native-json';
import { runImport } from '@/lib/import/runner';
import type { RawRow } from '@/lib/import/validate-row';

// §8.5 inbound feed endpoint: token-authenticated per agency, format from the
// agency's stored feed config. Contract for the native shape is published at
// /schemas/listing.schema.json.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ agencySlug: string }> },
): Promise<NextResponse> {
  const { agencySlug } = await params;
  const payload = await getPayloadClient().catch(() => null);
  if (!payload) return NextResponse.json({ ok: false }, { status: 503 });

  const agencies = await payload.find({
    collection: 'agencies',
    where: { slug: { equals: agencySlug } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  });
  const agency = agencies.docs[0];
  // §16.1: timing-safe token comparison — a plain !== leaks match length.
  const token = request.headers.get('x-feed-token');
  const expected = agency?.feed?.feedToken;
  const tokenValid =
    typeof token === 'string' &&
    typeof expected === 'string' &&
    token.length === expected.length &&
    timingSafeEqual(Buffer.from(token), Buffer.from(expected));
  if (!agency?.feed || !tokenValid) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const format = agency.feed.feedFormat ?? 'native_json';
  const mapping = (agency.feed.fieldMapping ?? {}) as Record<string, string>;

  let rows: RawRow[];
  try {
    if (format === 'kyero_xml') {
      rows = await parseKyeroFeed(await request.text(), mapping);
    } else if (format === 'native_json') {
      rows = parseNativeJsonFeed(await request.json());
    } else {
      return NextResponse.json(
        { ok: false, error: `Feed format ${format} is configured for polling, not push.` },
        { status: 400 },
      );
    }
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : 'unparseable feed' },
      { status: 400 },
    );
  }

  const dryRun = new URL(request.url).searchParams.get('dryRun') === 'true';
  const summary = await runImport({
    payload,
    agencyId: agency.id,
    rows,
    dryRun,
    kind: 'feed',
    sourceType: 'xml_feed',
    sourceFilename: `push:${format}`,
  });

  await payload.update({
    collection: 'agencies',
    id: agency.id,
    overrideAccess: true,
    data: {
      feed: {
        ...agency.feed,
        feedLastRunAt: new Date().toISOString(),
        feedLastStatus: `push ok: +${summary.created} ~${summary.updated} !${summary.skipped}`,
      },
    },
  });

  return NextResponse.json({ ok: true, ...summary });
}
