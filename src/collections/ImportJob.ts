import type { CollectionConfig } from 'payload';

import { tenant } from '@/payload/access/tenant';

// Spec §6.8/§8.4: full audit of every bulk import.
// §8.1 "Bulk import": admin + agency_admin (own); editors and agents no.
export const ImportJob: CollectionConfig = {
  slug: 'import-jobs',
  admin: {
    useAsTitle: 'sourceFilename',
    defaultColumns: ['sourceFilename', 'agency', 'status', 'rowsProcessed', 'rowsFailed'],
  },
  access: {
    read: tenant({ fullRoles: ['admin'], denyAgents: true }),
    create: tenant({ fullRoles: ['admin'], denyAgents: true }),
    update: tenant({ fullRoles: ['admin'], denyAgents: true }),
    delete: tenant({ fullRoles: ['admin'], denyAgents: true }),
  },
  fields: [
    {
      name: 'agency',
      type: 'relationship',
      relationTo: 'agencies',
      required: true,
      index: true,
    },
    { name: 'sourceFilename', type: 'text' },
    {
      name: 'kind',
      type: 'select',
      defaultValue: 'csv',
      options: ['csv', 'xlsx', 'feed'],
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'queued',
      index: true,
      options: ['queued', 'dry_run', 'running', 'complete', 'failed'],
    },
    { name: 'rowsProcessed', type: 'number', defaultValue: 0 },
    { name: 'rowsFailed', type: 'number', defaultValue: 0 },
    {
      name: 'errorReport',
      type: 'json',
      admin: { description: 'Row-by-row ok/warning/error with the exact reason and column (§8.4).' },
    },
  ],
};
