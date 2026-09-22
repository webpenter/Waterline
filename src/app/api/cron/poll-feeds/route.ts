import { NextResponse, type NextRequest } from 'next/server';

import { getPayloadClient } from '@/lib/db';
import { sendEmail } from '@/lib/email/send';
import { parseKyeroFeed } from '@/lib/import/adapters/kyero';
import { parseNativeJsonFeed } from '@/lib/import/adapters/native-json';
import { runImport } from '@/lib/import/runner';
import type { RawRow } from '@/lib/import/validate-row';

export const maxDuration = 300;

// §8.5: Vercel Cron polls configured feeds every 6 h; each run produces a
// created/updated/withdrawn/errors diff. Listings absent from two consecutive
// runs move to withdrawn — never deleted. Presence is tracked via
// lastVerifiedAt: the runner touches every present listing, so anything a
// feed-sourced agency hasn't confirmed for >2 poll intervals is withdrawn.
const TWO_RUNS_MS = 2 * 6 * 60 * 60 * 1000 + 60 * 60 * 1000; // 13h of grace

export async function GET(request: NextRequest): Promise<NextResponse> {
  if (request.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const payload = await getPayloadClient().catch(() => null);
  if (!payload) return NextResponse.json({ ok: false }, { status: 503 });

  const agencies = await payload.find({
    collection: 'agencies',
    where: { 'feed.feedUrl': { not_equals: null } },
    limit: 100,
    depth: 0,
    overrideAccess: true,
  });

  const results: Array<Record<string, unknown>> = [];
  for (const agency of agencies.docs) {
    const feed = agency.feed;
    if (!feed?.feedUrl) continue;
    let status: string;
    try {
      const response = await fetch(feed.feedUrl, { signal: AbortSignal.timeout(30_000) });
      if (!response.ok) throw new Error(`feed returned ${response.status}`);

      let rows: RawRow[];
      const mapping = (feed.fieldMapping ?? {}) as Record<string, string>;
      if (feed.feedFormat === 'kyero_xml') {
        rows = await parseKyeroFeed(await response.text(), mapping);
      } else if (feed.feedFormat === 'native_json') {
        rows = parseNativeJsonFeed(await response.json());
      } else {
        throw new Error(`unsupported polled format: ${feed.feedFormat ?? 'unset'}`);
      }

      const summary = await runImport({
        payload,
        agencyId: agency.id,
        rows,
        dryRun: false,
        kind: 'feed',
        sourceType: 'xml_feed',
        sourceFilename: `poll:${feed.feedUrl}`,
      });

      // Present listings were touched; refresh their lastVerifiedAt.
      const presentRefs = rows
        .map((row) => row.reference?.trim())
        .filter((ref): ref is string => Boolean(ref));
      if (presentRefs.length > 0) {
        await payload.update({
          collection: 'properties',
          where: {
            and: [
              { agency: { equals: agency.id } },
              { reference: { in: presentRefs } },
            ],
          },
          data: { lastVerifiedAt: new Date().toISOString() },
          overrideAccess: true,
          context: { viewBeacon: true },
        });
      }

      // Withdraw listings missing from two consecutive runs (§8.5).
      const staleBefore = new Date(Date.now() - TWO_RUNS_MS).toISOString();
      const withdrawn = await payload.update({
        collection: 'properties',
        where: {
          and: [
            { agency: { equals: agency.id } },
            { sourceType: { equals: 'xml_feed' } },
            { status: { in: ['in_market', 'under_offer', 'pending_review'] } },
            {
              or: [
                { lastVerifiedAt: { less_than: staleBefore } },
                { lastVerifiedAt: { equals: null } },
              ],
            },
          ],
        },
        data: { status: 'withdrawn' },
        overrideAccess: true,
      });

      const withdrawnCount = withdrawn.docs.length;
      status = `+${summary.created} ~${summary.updated} -${withdrawnCount} !${summary.skipped}`;
      results.push({ agency: agency.slug, ...summary, withdrawn: withdrawnCount });

      if (agency.email) {
        await sendEmail({
          to: agency.email,
          subject: `WATERLINE feed report: ${status}`,
          text: `Created ${summary.created}, updated ${summary.updated}, withdrawn ${withdrawnCount}, rows with errors ${summary.skipped}. Full report in your dashboard (import job #${summary.jobId}).`,
        });
      }
    } catch (err) {
      status = `error: ${err instanceof Error ? err.message : 'unknown'}`;
      results.push({ agency: agency.slug, error: status });
    }

    await payload.update({
      collection: 'agencies',
      id: agency.id,
      overrideAccess: true,
      data: {
        feed: { ...feed, feedLastRunAt: new Date().toISOString(), feedLastStatus: status },
      },
    });
  }

  return NextResponse.json({ ok: true, polled: results.length, results });
}
