import { z } from 'zod';

import type { RawRow } from '../validate-row';

/**
 * Native JSON feed shape (§8.5): an array of listing objects keyed by the
 * §8.4 column names (numbers/booleans/arrays allowed where CSV uses strings).
 * The public contract is published at /schemas/listing.schema.json.
 */

const listingObject = z
  .object({ reference: z.union([z.string(), z.number()]) })
  .catchall(z.union([z.string(), z.number(), z.boolean(), z.array(z.string()), z.null()]));

export const nativeFeedSchema = z.object({
  listings: z.array(listingObject).max(2000),
});

export function parseNativeJsonFeed(body: unknown): RawRow[] {
  const parsed = nativeFeedSchema.parse(body);
  return parsed.listings.map((listing) => {
    const row: RawRow = {};
    for (const [key, value] of Object.entries(listing)) {
      if (value == null) continue;
      row[key] = Array.isArray(value) ? value.join('|') : String(value);
    }
    return row;
  });
}
