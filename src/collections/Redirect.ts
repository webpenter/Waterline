import type { CollectionConfig } from 'payload';

import { adminOrEditor, anyLoggedIn } from '@/payload/access/tenant';

// URL lifecycle (§6.1, §14.5): slug changes create a 301; expired listings 410.
export const Redirect: CollectionConfig = {
  slug: 'redirects',
  admin: { useAsTitle: 'from', defaultColumns: ['from', 'to', 'statusCode'] },
  access: {
    read: anyLoggedIn,
    create: adminOrEditor,
    update: adminOrEditor,
    delete: adminOrEditor,
  },
  fields: [
    { name: 'from', type: 'text', required: true, unique: true, index: true },
    { name: 'to', type: 'text' },
    {
      name: 'statusCode',
      type: 'select',
      required: true,
      defaultValue: '301',
      options: ['301', '302', '410'],
    },
  ],
};
