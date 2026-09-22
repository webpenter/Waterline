import type { CollectionConfig } from 'payload';

import { logAudit } from '@/lib/audit';
import { adminOnly, adminOrEditor, tenant } from '@/payload/access/tenant';

const LEAD_SOURCES = [
  'contact',
  'property',
  'landing',
  'boat_filter',
  'whatsapp',
  'list_with_us',
] as const;

const LEAD_STATUSES = ['new', 'sent', 'viewed', 'qualified', 'spam'] as const;
const LOCALES = ['en', 'it', 'fr', 'de', 'es', 'ru'] as const;

// Spec §6.8 Lead. §8.1 "See leads": admin/editor all, agency_admin own agency,
// agency_agent own listings. Site-side creation goes through our rate-limited
// route handler using the local API — the REST surface never accepts anonymous writes.
export const Lead: CollectionConfig = {
  slug: 'leads',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'property', 'agency', 'status', 'createdAt'],
  },
  access: {
    read: tenant({ agentField: 'agent' }),
    create: adminOrEditor,
    update: tenant({ agentField: 'agent' }),
    delete: adminOnly,
  },
  hooks: {
    afterChange: [
      async ({ doc, previousDoc, req, operation }) => {
        if (operation === 'update' && previousDoc?.status !== doc.status) {
          const action = doc.status === 'viewed' ? 'lead_view' : 'status_change';
          await logAudit(req, action, 'leads', doc.id, `${previousDoc?.status} → ${doc.status}`);
        }
        return doc;
      },
    ],
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'email', type: 'email', required: true },
    { name: 'phone', type: 'text' },
    { name: 'message', type: 'textarea' },
    {
      name: 'property',
      type: 'relationship',
      relationTo: 'properties',
      index: true,
    },
    {
      name: 'agency',
      type: 'relationship',
      relationTo: 'agencies',
      index: true,
      admin: { description: 'Denormalised for routing and access scoping.' },
    },
    {
      name: 'agent',
      type: 'relationship',
      relationTo: 'agents',
      index: true,
      admin: { description: 'Routing target snapshot (property.agent at submission time).' },
    },
    { name: 'locale', type: 'select', options: [...LOCALES] },
    { name: 'source', type: 'select', required: true, options: [...LEAD_SOURCES] },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'new',
      index: true,
      options: [...LEAD_STATUSES],
    },
    {
      type: 'group',
      name: 'consent',
      fields: [
        { name: 'consentMarketing', type: 'checkbox', defaultValue: false },
        { name: 'consentedAt', type: 'date' },
        { name: 'consentIp', type: 'text' },
      ],
    },
    {
      name: 'reminderSentAt',
      type: 'date',
      admin: { readOnly: true, description: 'When the §8.9 48 h unanswered reminder went out.' },
    },
    { name: 'utm', type: 'json' },
    { name: 'navigationPath', type: 'json', admin: { description: 'Reserved (empty in Phase 1).' } },
    { name: 'crmContactId', type: 'text', admin: { description: 'Reserved for the Phase 2 CRM seam.' } },
  ],
};
