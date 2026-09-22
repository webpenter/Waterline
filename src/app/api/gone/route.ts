import { NextResponse, type NextRequest } from 'next/server';

import { getPayloadClient } from '@/lib/db';

// Middleware lookup: does this locale-less path have a Redirect record?
// Cached hard at the edge — redirect records change rarely and only forward.
export async function GET(request: NextRequest): Promise<NextResponse> {
  const path = new URL(request.url).searchParams.get('path');
  if (!path || !path.startsWith('/')) {
    return NextResponse.json({ statusCode: null }, { status: 400 });
  }
  try {
    const payload = await getPayloadClient();
    const res = await payload.find({
      collection: 'redirects',
      where: { from: { equals: path } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    });
    const redirect = res.docs[0] ?? null;
    return NextResponse.json(
      { statusCode: redirect?.statusCode ?? null, to: redirect?.to ?? null },
      { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600' } },
    );
  } catch {
    return NextResponse.json({ statusCode: null }, { status: 200 });
  }
}
