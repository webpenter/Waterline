import type { CollectionConfig } from 'payload';

import { adminOrEditor, anyLoggedIn } from '@/payload/access/tenant';

// Static pages (§6.8): about, legal, list-with-us copy.
export const Page: CollectionConfig = {
  slug: 'pages',
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'slug', '_status'] },
  versions: { drafts: true },
  access: {
    read: anyLoggedIn,
    create: adminOrEditor,
    update: adminOrEditor,
    delete: adminOrEditor,
  },
  fields: [
    { name: 'title', type: 'text', required: true, localized: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    { name: 'body', type: 'richText', localized: true },
    { name: 'metaTitle', type: 'text', localized: true },
    { name: 'metaDescription', type: 'textarea', localized: true },
  ],
};
