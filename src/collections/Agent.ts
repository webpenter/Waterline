import type { CollectionConfig } from 'payload';

import { tenant } from '@/payload/access/tenant';

const LOCALES = ['en', 'it', 'fr', 'de', 'es', 'ru'] as const;

// Spec §6.8 Agent. §8.1 "Manage agency profile & agents": admin + agency_admin (own).
export const Agent: CollectionConfig = {
  slug: 'agents',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'agency', 'email', 'receivesLeads'],
  },
  access: {
    read: tenant(),
    create: tenant({ fullRoles: ['admin'], denyAgents: true }),
    update: tenant({ fullRoles: ['admin'], denyAgents: true }),
    delete: tenant({ fullRoles: ['admin'], denyAgents: true }),
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      name: 'agency',
      type: 'relationship',
      relationTo: 'agencies',
      required: true,
      index: true,
    },
    { name: 'photo', type: 'relationship', relationTo: 'media' },
    { name: 'role', type: 'text', admin: { description: 'e.g. "Senior Partner".' } },
    { name: 'languages', type: 'select', hasMany: true, options: [...LOCALES] },
    { name: 'phone', type: 'text' },
    { name: 'whatsapp', type: 'text' },
    { name: 'email', type: 'email' },
    { name: 'receivesLeads', type: 'checkbox', defaultValue: true },
  ],
};
