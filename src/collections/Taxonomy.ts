import type { CollectionConfig } from 'payload';

import { adminOrEditor, anyLoggedIn } from '@/payload/access/tenant';

// Lifestyle-facet taxonomy (§6.8) powering category landing pages.
export const Taxonomy: CollectionConfig = {
  slug: 'taxonomies',
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'group', 'slug'] },
  access: {
    read: anyLoggedIn,
    create: adminOrEditor,
    update: adminOrEditor,
    delete: adminOrEditor,
  },
  fields: [
    { name: 'name', type: 'text', required: true, localized: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    {
      name: 'group',
      type: 'select',
      required: true,
      options: ['lifestyle', 'style', 'collection'],
    },
    { name: 'description', type: 'textarea', localized: true },
  ],
};
