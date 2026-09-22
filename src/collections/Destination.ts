import type { CollectionConfig } from 'payload';

import { revalidatePaths } from '@/lib/revalidate';
import { adminOrEditor, anyLoggedIn } from '@/payload/access/tenant';

// Destination registry (Liguria, Lake Como, Florida Keys) — spec §6.6/§6.8.
export const Destination: CollectionConfig = {
  slug: 'destinations',
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'country', 'slug'] },
  access: {
    read: anyLoggedIn,
    create: adminOrEditor,
    update: adminOrEditor,
    delete: adminOrEditor,
  },
  hooks: {
    afterChange: [
      async ({ doc }) => {
        const paths = ['/destinations'];
        if (typeof doc.slug === 'string' && doc.slug) {
          paths.push(`/destinations/${doc.slug}`);
        }
        await revalidatePaths(paths);
        return doc;
      },
    ],
    afterDelete: [
      async ({ doc }) => {
        const paths = ['/destinations'];
        if (typeof doc.slug === 'string' && doc.slug) {
          paths.push(`/destinations/${doc.slug}`);
        }
        await revalidatePaths(paths);
      },
    ],
  },
  fields: [
    { name: 'name', type: 'text', required: true, localized: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    { name: 'country', type: 'text', maxLength: 2, index: true },
    { name: 'region', type: 'text' },
    { name: 'heroImage', type: 'relationship', relationTo: 'media' },
    { name: 'description', type: 'richText', localized: true },
    { name: 'metaTitle', type: 'text', localized: true },
    { name: 'metaDescription', type: 'textarea', localized: true },
  ],
};
