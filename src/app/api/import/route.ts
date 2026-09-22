import { NextResponse, type NextRequest } from 'next/server';
import Papa from 'papaparse';

import { getPayloadClient } from '@/lib/db';
import { runImport } from '@/lib/import/runner';
import type { RawRow } from '@/lib/import/validate-row';
import { relationId } from '@/payload/access/tenant';

// §8.4 bulk import: upload → dry-run report → confirm → import. Auth is the
// Payload session/API key; agency users import only into their own agency.
export async function POST(request: NextRequest): Promise<NextResponse> {
  const payload = await getPayloadClient().catch(() => null);
  if (!payload) return NextResponse.json({ ok: false }, { status: 503 });

  const { user } = await payload.auth({ headers: request.headers });
  if (!user || !['admin', 'agency_admin'].includes(user.role)) {
    return NextResponse.json({ ok: false }, { status: 403 });
  }

  const url = new URL(request.url);
  const dryRun = url.searchParams.get('dryRun') !== 'false';
  const requestedAgency = Number(url.searchParams.get('agency') ?? '');
  const ownAgency = relationId(user.agency as number | { id: number } | null);
  const agencyId =
    user.role === 'admin'
      ? Number.isFinite(requestedAgency) && requestedAgency > 0
        ? requestedAgency
        : ownAgency
      : ownAgency;
  if (!agencyId) {
    return NextResponse.json({ ok: false, error: 'agency required' }, { status: 400 });
  }

  const csv = await request.text();
  if (!csv.trim()) return NextResponse.json({ ok: false }, { status: 400 });

  const parsed = Papa.parse<RawRow>(csv, { header: true, skipEmptyLines: true });
  if (parsed.errors.length > 0 && parsed.data.length === 0) {
    return NextResponse.json(
      { ok: false, error: parsed.errors[0]?.message ?? 'CSV parse error' },
      { status: 400 },
    );
  }

  const summary = await runImport({
    payload,
    agencyId,
    rows: parsed.data,
    dryRun,
    kind: 'csv',
    sourceType: 'csv_import',
    sourceFilename: request.headers.get('x-filename') ?? undefined,
  });

  return NextResponse.json({ ok: true, ...summary }, { status: dryRun ? 200 : 201 });
}
