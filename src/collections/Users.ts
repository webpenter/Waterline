import type { CollectionConfig } from 'payload';

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: true,
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'role',
      type: 'select',
      defaultValue: 'agency_agent',
      options: [
        { label: 'System Admin', value: 'admin' },
        { label: 'Editorial Editor', value: 'editor' },
        { label: 'Agency Admin', value: 'agency_admin' },
        { label: 'Agency Agent', value: 'agency_agent' },
      ],
      required: true,
    },
  ],
};
