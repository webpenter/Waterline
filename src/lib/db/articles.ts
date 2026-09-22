import { fallbackArticles, findFallbackArticle } from '@/lib/sample/fallback-content';
import type { Article } from '@/payload-types';
import type { Locale } from './index';

import { getPayloadClient } from './index';

/**
 * Journal queries (§6.8/§10.5). Published articles only; on the
 * database-error path the gated sample fallback serves the demo article so
 * the journal stays demonstrable — unknown slugs still 404.
 */

export async function getPublishedArticles(locale: Locale = 'en'): Promise<Article[]> {
  try {
    const payload = await getPayloadClient();
    const { docs } = await payload.find({
      collection: 'articles',
      where: { _status: { equals: 'published' } },
      sort: '-publishedAt',
      limit: 50,
      depth: 1,
      locale,
      overrideAccess: false,
    });
    return docs;
  } catch (err) {
    console.warn('[journal] list failed, using fallback inventory:', err);
    return fallbackArticles();
  }
}

export async function getArticleBySlug(slug: string, locale: Locale = 'en'): Promise<Article | null> {
  try {
    const payload = await getPayloadClient();
    const { docs } = await payload.find({
      collection: 'articles',
      where: { and: [{ slug: { equals: slug } }, { _status: { equals: 'published' } }] },
      limit: 1,
      depth: 1,
      locale,
      overrideAccess: false,
    });
    return docs[0] ?? null;
  } catch (err) {
    console.warn('[journal] load failed, trying fallback inventory:', err);
    return findFallbackArticle(slug);
  }
}
