/**
 * Incremental Typesense sync, called from Property afterChange/afterDelete hooks.
 *
 * Prompt 5 supplies the full schema, alias-swap reindex and Postgres fallback;
 * this module owns the incremental path. Sync failures must never fail a save —
 * Postgres is the source of truth and a full reindex (`pnpm search:reindex`)
 * repairs any drift.
 */

function typesenseConfigured(): boolean {
  return Boolean(process.env.TYPESENSE_HOST && process.env.TYPESENSE_API_KEY);
}

function typesenseUrl(path: string): string {
  const protocol = process.env.TYPESENSE_PROTOCOL || 'http';
  const host = process.env.TYPESENSE_HOST;
  const port = process.env.TYPESENSE_PORT || '8108';
  return `${protocol}://${host}:${port}${path}`;
}

export const PROPERTIES_ALIAS = 'properties';

export async function upsertPropertyDocument(doc: Record<string, unknown>): Promise<void> {
  if (!typesenseConfigured()) return;
  try {
    await fetch(typesenseUrl(`/collections/${PROPERTIES_ALIAS}/documents?action=upsert`), {
      method: 'POST',
      headers: {
        'X-TYPESENSE-API-KEY': process.env.TYPESENSE_API_KEY as string,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(doc),
      signal: AbortSignal.timeout(4000),
    });
  } catch (err) {
    console.error('[search-sync] upsert failed (reindex will repair):', err);
  }
}

export async function deletePropertyDocument(id: string | number): Promise<void> {
  if (!typesenseConfigured()) return;
  try {
    await fetch(typesenseUrl(`/collections/${PROPERTIES_ALIAS}/documents/${id}`), {
      method: 'DELETE',
      headers: { 'X-TYPESENSE-API-KEY': process.env.TYPESENSE_API_KEY as string },
      signal: AbortSignal.timeout(4000),
    });
  } catch (err) {
    console.error('[search-sync] delete failed (reindex will repair):', err);
  }
}
