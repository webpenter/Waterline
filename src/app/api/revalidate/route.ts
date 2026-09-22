import { revalidatePath, revalidateTag } from 'next/cache';
import { NextResponse, type NextRequest } from 'next/server';

import { LOCALES } from '@/i18n/routing';
import { verifyWebhookSignature } from '@/lib/security/webhooks';

/**
 * Signed ISR revalidation route (§12 rule 5, Prompt 17, Prompt 18).
 * Triggered by Payload CMS afterChange hooks or external sync jobs so edits
 * reflect at the edge within seconds without requiring dynamic SSR.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const secretHeader = request.headers.get('x-revalidate-secret');
  const secretQuery = request.nextUrl.searchParams.get('secret');
  const secret = secretHeader || secretQuery;

  if (process.env.REVALIDATE_SECRET && !verifyWebhookSignature(request, 'revalidate', secret || undefined)) {
    return NextResponse.json(
      { revalidated: false, error: 'Unauthorized: invalid or missing revalidation secret' },
      { status: 401 },
    );
  }

  let body: { paths?: unknown; tags?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { revalidated: false, error: 'Bad Request: invalid JSON body' },
      { status: 400 },
    );
  }

  const { paths, tags } = body;
  const revalidatedPaths: string[] = [];
  const revalidatedTags: string[] = [];

  if (Array.isArray(paths)) {
    for (const rawPath of paths) {
      if (typeof rawPath !== 'string' || !rawPath.startsWith('/')) continue;
      
      // Revalidate the raw path
      revalidatePath(rawPath);
      revalidatedPaths.push(rawPath);

      // If the path does not already include a locale prefix, expand across all supported locales
      const hasLocalePrefix = LOCALES.some(
        (loc) => rawPath === `/${loc}` || rawPath.startsWith(`/${loc}/`),
      );
      if (!hasLocalePrefix) {
        for (const loc of LOCALES) {
          const localizedPath = rawPath === '/' ? `/${loc}` : `/${loc}${rawPath}`;
          revalidatePath(localizedPath);
          revalidatedPaths.push(localizedPath);
        }
      }
    }
  }

  if (Array.isArray(tags)) {
    for (const rawTag of tags) {
      if (typeof rawTag === 'string' && rawTag.length > 0) {
        revalidateTag(rawTag);
        revalidatedTags.push(rawTag);
      }
    }
  }

  if (revalidatedPaths.length === 0 && revalidatedTags.length === 0) {
    return NextResponse.json(
      { revalidated: false, error: 'Bad Request: at least one valid path or tag is required' },
      { status: 400 },
    );
  }

  return NextResponse.json(
    {
      revalidated: true,
      paths: [...new Set(revalidatedPaths)],
      tags: [...new Set(revalidatedTags)],
      revalidatedAt: new Date().toISOString(),
    },
    { status: 200 },
  );
}
