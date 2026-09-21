import 'dotenv/config';

import { getPayloadClient } from '@/lib/db';
import { publicPredicate } from '@/lib/db/filters';
import { fullReindex, typesenseConfigured } from '@/lib/search/client';
import { toSearchDocument } from '@/lib/search/document';

// `pnpm search:reindex` — full rebuild into a fresh collection with an atomic
// alias swap (spec Prompt 5). Postgres is the source of truth; run this after
// bulk imports or to repair incremental-sync drift.
async function main(): Promise<void> {
  if (!typesenseConfigured()) {
    console.error('TYPESENSE_HOST / TYPESENSE_API_KEY are not set. Nothing to do.');
    process.exit(1);
  }

  const payload = await getPayloadClient();
  const documents: Array<Record<string, unknown>> = [];
  let page = 1;

  for (;;) {
    const res = await payload.find({
      collection: 'properties',
      where: publicPredicate(),
      limit: 200,
      page,
      depth: 1,
    });
    documents.push(...res.docs.map((doc) => toSearchDocument(doc)));
    if (!res.hasNextPage) break;
    page += 1;
  }

  const { collection, indexed } = await fullReindex(documents);
  console.log(`Indexed ${indexed} properties into ${collection}; alias swapped atomically.`);
  process.exit(0);
}

main().catch((err) => {
  console.error('Reindex failed:', err);
  process.exit(1);
});
