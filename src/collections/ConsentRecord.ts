import type { CollectionConfig } from 'payload';

import { adminOnly } from '@/payload/access/tenant';

// Stored cookie-consent decisions (Prompt 12/§16): who consented to what,
// when, from where. Written only by /api/consent; read-only for admins;
// retention handled by the §16.5 pass.
export const ConsentRecord: CollectionConfig = {
  slug: 'consent-records',
  admin: {
    defaultColumns: ['createdAt', 'analytics', 'marketing', 'locale'],
  },
  access: {
    read: adminOnly,
    create: () => false,
    update: () => false,
    delete: adminOnly,
  },
  fields: [
    { name: 'analytics', type: 'checkbox', required: true },
    { name: 'marketing', type: 'checkbox', required: true },
    { name: 'locale', type: 'text' },
    { name: 'ipHash', type: 'text', index: true },
    { name: 'userAgent', type: 'text' },
  ],
};
