import type { CollectionConfig } from 'payload';

import { adminOnly, anyLoggedIn, tenant } from '@/payload/access/tenant';

import {
  BEACH_TYPES,
  CONDITIONS,
  COORDINATE_PRECISIONS,
  CURRENCIES,
  FEATURES,
  MAX_DISTANCE_TO_WATER_M,
  MODERATION_STATES,
  MOORING_TYPES,
  ORIENTATIONS,
  PRICE_QUALIFIERS,
  PRICE_TYPES,
  PROPERTY_STATUSES,
  PROPERTY_TYPES,
  SHORELINE_TENURES,
  SOURCE_TYPES,
  TENURES,
  VISIBILITIES,
  WATERFRONT_PROTECTIONS,
  WATER_ACCESS_TYPES,
  WATER_BODY_TYPES,
} from './enums';
import {
  cleanupAfterDelete,
  computeDerivedFields,
  enforceWaterRule,
  sanitizeAgencySubmission,
  syncAfterChange,
} from './hooks';

export const Property: CollectionConfig = {
  slug: 'properties',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'status', 'moderation', 'agency', 'priceEur', 'waterFrontageM'],
    description:
      'A listing publishes only with at least one water access type and distance to water ≤ 50 m. This rule is the brand.',
  },
  access: {
    // §8.1: admin/editor see all; agency_admin own agency; agency_agent own listings only.
    read: tenant({ agentField: 'agent' }),
    create: anyLoggedIn,
    update: tenant({ agentField: 'agent' }),
    delete: adminOnly,
  },
  versions: {
    drafts: { autosave: true },
    maxPerDoc: 25,
  },
  hooks: {
    beforeValidate: [enforceWaterRule],
    beforeChange: [sanitizeAgencySubmission, computeDerivedFields],
    afterChange: [syncAfterChange],
    afterDelete: [cleanupAfterDelete],
  },
  indexes: [
    // The hot public query: status + visibility + isSample (spec §6.9).
    { fields: ['status', 'visibility', 'isSample'] },
    // Agency's own listing reference, unique within that agency.
    { fields: ['agency', 'reference'], unique: true },
  ],
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Essentials',
          fields: [
            { name: 'title', type: 'text', required: true, localized: true },
            { name: 'subtitle', type: 'text', localized: true },
            {
              name: 'reference',
              type: 'text',
              admin: { description: "The agency's own listing code. Unique per agency." },
            },
            {
              name: 'propertyType',
              type: 'select',
              required: true,
              index: true,
              options: [...PROPERTY_TYPES],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'priceType',
                  type: 'select',
                  required: true,
                  defaultValue: 'fixed',
                  options: [...PRICE_TYPES],
                },
                {
                  name: 'priceAmount',
                  type: 'number',
                  min: 0,
                  admin: { condition: (data) => data?.priceType === 'fixed' },
                },
                {
                  name: 'currency',
                  type: 'select',
                  required: true,
                  defaultValue: 'EUR',
                  options: [...CURRENCIES],
                },
                {
                  name: 'priceQualifier',
                  type: 'select',
                  options: [...PRICE_QUALIFIERS],
                },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'tenure', type: 'select', options: [...TENURES] },
                {
                  name: 'leaseYearsRemaining',
                  type: 'number',
                  min: 0,
                  admin: { condition: (data) => data?.tenure === 'leasehold' },
                },
                { name: 'serviceChargeAnnual', type: 'number', min: 0 },
                { name: 'propertyTaxAnnual', type: 'number', min: 0 },
              ],
            },
            { name: 'availableFrom', type: 'date' },
          ],
        },
        {
          label: 'Water credentials',
          description: 'The differentiator — mandatory before publishing (spec §6.4).',
          fields: [
            {
              name: 'waterBodyType',
              type: 'select',
              required: true,
              index: true,
              options: [...WATER_BODY_TYPES],
            },
            {
              name: 'waterBody',
              type: 'relationship',
              relationTo: 'water-bodies',
              admin: { description: 'Controlled name: "Ligurian Sea", "Lake Como", …' },
            },
            {
              name: 'waterAccessType',
              type: 'select',
              hasMany: true,
              index: true,
              options: [...WATER_ACCESS_TYPES],
              admin: {
                description:
                  'At least one is required to publish. "Sea view" and "near the beach" do not qualify.',
              },
            },
            {
              name: 'distanceToWaterM',
              type: 'number',
              min: 0,
              admin: {
                description: `Metres from the property boundary to the waterline. Above ${MAX_DISTANCE_TO_WATER_M} m the listing cannot publish.`,
              },
            },
            {
              name: 'waterFrontageM',
              type: 'number',
              min: 0,
              index: true,
              admin: {
                description:
                  '⚠ Linear metres of private shoreline — the headline card stat. Cards and ranking suffer without it; fill it whenever the shoreline is private.',
              },
            },
            {
              type: 'row',
              fields: [
                { name: 'beachType', type: 'select', options: [...BEACH_TYPES] },
                { name: 'orientation', type: 'select', options: [...ORIENTATIONS] },
                { name: 'swimmableFromProperty', type: 'checkbox' },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'tidal', type: 'checkbox' },
                {
                  name: 'tideRangeM',
                  type: 'number',
                  min: 0,
                  admin: { condition: (data) => data?.tidal === true },
                },
                {
                  name: 'waterfrontProtection',
                  type: 'select',
                  options: [...WATERFRONT_PROTECTIONS],
                },
              ],
            },
            {
              name: 'floodZone',
              type: 'text',
              admin: { description: 'Local designation verbatim; shown with a disclaimer.' },
            },
            {
              name: 'shorelineTenure',
              type: 'select',
              options: [...SHORELINE_TENURES],
              admin: {
                description:
                  'In Italy this is the demanio marittimo question — it materially changes value.',
              },
            },
            {
              name: 'concessionExpiry',
              type: 'date',
              admin: {
                condition: (data) => data?.shorelineTenure === 'state_concession',
              },
            },
          ],
        },
        {
          label: 'Nautical',
          description: 'The "fits my boat" engine (spec §6.5) — no competitor can answer this search.',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'mooringType', type: 'select', options: [...MOORING_TYPES] },
                { name: 'berthCount', type: 'number', min: 0 },
                { name: 'maxBoatLoaM', type: 'number', min: 0, index: true },
                { name: 'maxBoatBeamM', type: 'number', min: 0 },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'waterDepthAtBerthM', type: 'number', min: 0, index: true },
                { name: 'navigableToOpenSea', type: 'checkbox', index: true },
                { name: 'fixedBridgesToOpenSea', type: 'checkbox' },
                {
                  name: 'minBridgeClearanceM',
                  type: 'number',
                  min: 0,
                  admin: { condition: (data) => data?.fixedBridgesToOpenSea === true },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'nearestMarinaName', type: 'text' },
                { name: 'nearestMarinaDistanceKm', type: 'number', min: 0 },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'shorePower', type: 'checkbox' },
                { name: 'freshWaterAtDock', type: 'checkbox' },
                { name: 'fuelDockNearby', type: 'checkbox' },
                { name: 'helipad', type: 'checkbox' },
                { name: 'seaplaneAccess', type: 'checkbox' },
              ],
            },
          ],
        },
        {
          label: 'Physical',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'bedrooms', type: 'number', min: 0 },
                { name: 'bathrooms', type: 'number', min: 0 },
                { name: 'builtAreaSqm', type: 'number', min: 0 },
                { name: 'plotAreaSqm', type: 'number', min: 0 },
                { name: 'terraceAreaSqm', type: 'number', min: 0 },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'yearBuilt', type: 'number' },
                { name: 'renovatedYear', type: 'number' },
                { name: 'floors', type: 'number', min: 0 },
                { name: 'parkingSpaces', type: 'number', min: 0 },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'condition', type: 'select', options: [...CONDITIONS] },
                { name: 'energyRating', type: 'text' },
              ],
            },
            {
              name: 'features',
              type: 'select',
              hasMany: true,
              options: [...FEATURES],
            },
          ],
        },
        {
          label: 'Location',
          fields: [
            {
              name: 'location',
              type: 'group',
              fields: [
                { name: 'label', type: 'text' },
                {
                  name: 'addressLine',
                  type: 'text',
                  admin: { description: 'Admin-only. Never rendered publicly.' },
                },
                { name: 'locality', type: 'text' },
                { name: 'province', type: 'text' },
                { name: 'region', type: 'text' },
                {
                  name: 'country',
                  type: 'text',
                  index: true,
                  maxLength: 2,
                  admin: { description: 'ISO-3166-1 alpha-2, e.g. IT, FR, US.' },
                },
                { name: 'continent', type: 'text' },
                { name: 'coordinates', type: 'point', index: true },
                {
                  name: 'coordinatePrecision',
                  type: 'select',
                  defaultValue: 'exact',
                  options: [...COORDINATE_PRECISIONS],
                  admin: {
                    description:
                      'approximate_500m renders a jittered circle publicly; exact coordinates never reach the client for those listings.',
                  },
                },
                {
                  name: 'destination',
                  type: 'relationship',
                  relationTo: 'destinations',
                  index: true,
                },
              ],
            },
          ],
        },
        {
          label: 'Media & content',
          fields: [
            {
              name: 'media',
              type: 'relationship',
              relationTo: 'media',
              hasMany: true,
              admin: { description: 'Ordered. The first image is the hero and card image.' },
            },
            { name: 'videoUrl', type: 'text' },
            { name: 'virtualTourUrl', type: 'text' },
            {
              name: 'floorplans',
              type: 'relationship',
              relationTo: 'media',
              hasMany: true,
            },
            {
              name: 'documents',
              type: 'relationship',
              relationTo: 'media',
              hasMany: true,
              admin: { description: 'Private — admin and owning agency only. Never public.' },
            },
            { name: 'description', type: 'richText', localized: true },
            {
              name: 'highlights',
              type: 'array',
              localized: true,
              maxRows: 5,
              fields: [{ name: 'text', type: 'text', required: true }],
            },
            { name: 'metaTitle', type: 'text', localized: true },
            { name: 'metaDescription', type: 'textarea', localized: true },
          ],
        },
      ],
    },

    // ---- Sidebar: identity, ownership, lifecycle (spec §6.1) ----
    {
      name: 'slug',
      type: 'text',
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Generated on first publish. Immutable — changes create a Redirect.',
      },
    },
    {
      name: 'agency',
      type: 'relationship',
      relationTo: 'agencies',
      required: true,
      index: true,
      admin: { position: 'sidebar', description: 'Multi-tenancy key. Every query is scoped by it.' },
    },
    {
      name: 'agent',
      type: 'relationship',
      relationTo: 'agents',
      admin: { position: 'sidebar', description: 'Lead routing target.' },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      index: true,
      options: [...PROPERTY_STATUSES],
      admin: { position: 'sidebar' },
    },
    {
      name: 'moderation',
      type: 'select',
      required: true,
      defaultValue: 'unreviewed',
      index: true,
      options: [...MODERATION_STATES],
      admin: { position: 'sidebar' },
    },
    {
      name: 'moderationNote',
      type: 'textarea',
      admin: { position: 'sidebar', description: 'Shown to the agency. Not public.' },
    },
    {
      name: 'visibility',
      type: 'select',
      required: true,
      defaultValue: 'public',
      index: true,
      options: [...VISIBILITIES],
      admin: {
        position: 'sidebar',
        description: 'unlisted = link-only, noindex, out of sitemap.',
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      index: true,
      admin: { position: 'sidebar', description: 'Editorial only. Agencies cannot self-feature.' },
    },
    {
      name: 'isSample',
      type: 'checkbox',
      defaultValue: false,
      index: true,
      admin: { position: 'sidebar', description: 'Demo data: SAMPLE badge, noindex, out of sitemaps.' },
    },
    {
      name: 'priceEur',
      type: 'number',
      index: true,
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Computed from the daily FX snapshot. The only field used for price sorting/filtering.',
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: { position: 'sidebar', readOnly: true },
    },
    {
      name: 'expiresAt',
      type: 'date',
      index: true,
      admin: {
        position: 'sidebar',
        description: 'publishedAt + 180 days unless the agency reconfirms availability.',
      },
    },
    {
      name: 'lastVerifiedAt',
      type: 'date',
      admin: { position: 'sidebar', description: 'Set when the agency confirms the listing is still available.' },
    },
    {
      name: 'sourceType',
      type: 'select',
      required: true,
      defaultValue: 'manual',
      options: [...SOURCE_TYPES],
      admin: { position: 'sidebar' },
    },
    {
      name: 'duplicateOf',
      type: 'relationship',
      relationTo: 'properties',
      admin: { position: 'sidebar', description: 'Set by duplicate detection (§8.8).' },
    },
    {
      name: 'fingerprint',
      type: 'text',
      index: true,
      admin: { position: 'sidebar', readOnly: true },
    },
    { name: 'viewCount', type: 'number', defaultValue: 0, admin: { position: 'sidebar', readOnly: true } },
    { name: 'leadCount', type: 'number', defaultValue: 0, admin: { position: 'sidebar', readOnly: true } },
  ],
};
