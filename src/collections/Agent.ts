import type { CollectionConfig } from 'payload';

// Minimal stub for Property's lead-routing relation; completed in Prompt 4 (spec §6.8).
export const Agent: CollectionConfig = {
  slug: 'agents',
  admin: { useAsTitle: 'name' },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'agency', type: 'relationship', relationTo: 'agencies', required: true, index: true },
  ],
};
