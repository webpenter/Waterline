import type { CollectionConfig } from 'payload';

// Minimal stub so Property's multi-tenancy relation exists from Prompt 3.
// The full agency profile, tiers and feed fields land in Prompt 4 (spec §6.8, §8).
export const Agency: CollectionConfig = {
  slug: 'agencies',
  admin: { useAsTitle: 'name' },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
  ],
};
