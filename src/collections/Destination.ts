import type { CollectionConfig } from 'payload';

// Destination registry (Liguria, Lake Como, Florida Keys) — spec §6.6/§6.8.
// Completed in Prompt 4.
export const Destination: CollectionConfig = {
  slug: 'destinations',
  admin: { useAsTitle: 'name' },
  fields: [
    { name: 'name', type: 'text', required: true, localized: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
  ],
};
