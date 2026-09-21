import type { CollectionConfig } from 'payload';

// Controlled water-body registry ("Ligurian Sea", "Lake Como") — spec §6.4/§6.8.
// Completed in Prompt 4.
export const WaterBody: CollectionConfig = {
  slug: 'water-bodies',
  admin: { useAsTitle: 'name' },
  fields: [
    { name: 'name', type: 'text', required: true, localized: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
  ],
};
