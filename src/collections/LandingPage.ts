import type { CollectionConfig } from 'payload';

import { adminOrEditor, anyLoggedIn } from '@/payload/access/tenant';

import { PROPERTY_TYPES, WATER_BODY_TYPES } from './Property/enums';

// Programmatic SEO landing pages (§10.4, Prompt 10). A combo renders publicly
// only when it has genuine written copy — that gate keeps the engine out of
// thin-content territory.
export const LandingPage: CollectionConfig = {
  slug: 'landing-pages',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', '_status'],
  },
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
    {
      type: 'group',
      name: 'combo',
      admin: { description: 'The filter combination this page targets.' },
      fields: [
        { name: 'propertyType', type: 'select', options: [...PROPERTY_TYPES] },
        { name: 'waterBodyType', type: 'select', options: [...WATER_BODY_TYPES] },
        { name: 'destination', type: 'relationship', relationTo: 'destinations' },
        { name: 'country', type: 'text', maxLength: 2 },
      ],
    },
    {
      name: 'intro',
      type: 'richText',
      localized: true,
      admin: {
        description: 'Opens with a 40–60-word direct answer paragraph (§14.6). Required before the combo goes live.',
      },
    },
    { name: 'body', type: 'richText', localized: true },
    { name: 'metaTitle', type: 'text', localized: true },
    { name: 'metaDescription', type: 'textarea', localized: true },
  ],
};
