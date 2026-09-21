import { Client } from 'typesense';

import type { PropertyFilters } from '@/lib/db/filters';

import {
  FACET_BY,
  filtersToTypesense,
  PROPERTIES_ALIAS,
  PROPERTY_SEARCH_SCHEMA,
  sortToTypesense,
} from './schema';

export function typesenseConfigured(): boolean {
  return Boolean(process.env.TYPESENSE_HOST && process.env.TYPESENSE_API_KEY);
}

export function typesenseClient(): Client {
  return new Client({
    nodes: [
      {
        host: process.env.TYPESENSE_HOST ?? 'localhost',
        port: Number(process.env.TYPESENSE_PORT ?? 8108),
        protocol: process.env.TYPESENSE_PROTOCOL ?? 'http',
      },
    ],
    apiKey: process.env.TYPESENSE_API_KEY ?? '',
    connectionTimeoutSeconds: 3,
    numRetries: 1,
  });
}

export async function isTypesenseHealthy(): Promise<boolean> {
  if (!typesenseConfigured()) return false;
  try {
    const protocol = process.env.TYPESENSE_PROTOCOL ?? 'http';
    const host = process.env.TYPESENSE_HOST;
    const port = process.env.TYPESENSE_PORT ?? '8108';
    const res = await fetch(`${protocol}://${host}:${port}/health`, {
      signal: AbortSignal.timeout(1500),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export interface SearchHit {
  id: string;
  slug: string;
  title: string;
  [key: string]: unknown;
}

export interface SearchResult {
  hits: SearchHit[];
  total: number;
  page: number;
  facets: Record<string, Array<{ value: string; count: number }>>;
  engine: 'typesense' | 'postgres';
}

/** Faceted search against the alias. Throws on failure — callers fall back. */
export async function searchWithTypesense(filters: PropertyFilters): Promise<SearchResult> {
  const client = typesenseClient();
  const page = filters.page ?? 1;
  const perPage = Math.min(filters.limit ?? 24, 100);

  const res = await client
    .collections(PROPERTIES_ALIAS)
    .documents()
    .search({
      q: '*',
      query_by: 'title',
      filter_by: filtersToTypesense(filters),
      sort_by: sortToTypesense(filters.sort),
      facet_by: FACET_BY,
      page,
      per_page: perPage,
    });

  const facets: SearchResult['facets'] = {};
  for (const facet of res.facet_counts ?? []) {
    facets[facet.field_name as string] = (facet.counts ?? []).map(
      (c: { value: unknown; count: number }) => ({
        value: String(c.value),
        count: c.count,
      }),
    );
  }

  return {
    hits: (res.hits ?? []).map((h: { document: unknown }) => h.document as SearchHit),
    total: res.found ?? 0,
    page,
    facets,
    engine: 'typesense',
  };
}

/**
 * Full reindex with atomic alias swap (spec Prompt 5): index everything into a
 * fresh timestamped collection, point the alias at it, then drop old ones.
 * Search never sees a half-built index.
 */
export async function fullReindex(
  documents: Array<Record<string, unknown>>,
): Promise<{ collection: string; indexed: number }> {
  const client = typesenseClient();
  const name = `${PROPERTIES_ALIAS}_${Date.now()}`;

  await client.collections().create({ ...PROPERTY_SEARCH_SCHEMA, name });

  let indexed = 0;
  const BATCH = 100;
  for (let i = 0; i < documents.length; i += BATCH) {
    const batch = documents.slice(i, i + BATCH);
    if (batch.length === 0) continue;
    await client.collections(name).documents().import(batch, { action: 'upsert' });
    indexed += batch.length;
  }

  await client.aliases().upsert(PROPERTIES_ALIAS, { collection_name: name });

  // Drop superseded physical collections.
  const all = await client.collections().retrieve();
  for (const col of all) {
    if (col.name.startsWith(`${PROPERTIES_ALIAS}_`) && col.name !== name) {
      await client.collections(col.name).delete().catch(() => undefined);
    }
  }

  return { collection: name, indexed };
}
