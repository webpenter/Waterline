import { encode } from 'blurhash';
import type { CollectionBeforeChangeHook, CollectionConfig } from 'payload';
import { ValidationError } from 'payload';
import sharp from 'sharp';

import { isAgencyRole, relationId, tenant } from '@/payload/access/tenant';

const MIN_LONG_EDGE_PX = 1600;

/**
 * §6.8 Media rules: reject anything under 1600 px on the long edge with a clear
 * message, compute a blurhash LQIP and dominant colour, and scope uploads to
 * the uploading agency.
 */
const processUpload: CollectionBeforeChangeHook = async ({ data, req, operation }) => {
  const out = { ...data };

  // Agency scoping: agency users always own their uploads.
  const user = req.user;
  if (user && isAgencyRole(user.role)) {
    out.agency = relationId(user.agency as number | { id: number } | null) ?? null;
  }

  const file = req.file;
  if (operation === 'create' && file?.data && file.mimetype?.startsWith('image/')) {
    const image = sharp(file.data);
    const meta = await image.metadata();
    const width = meta.width ?? 0;
    const height = meta.height ?? 0;

    if (Math.max(width, height) < MIN_LONG_EDGE_PX) {
      throw new ValidationError({
        collection: 'media',
        errors: [
          {
            message: `Image is ${width}×${height} px. The long edge must be at least ${MIN_LONG_EDGE_PX} px — please upload the original, uncompressed photo.`,
            path: 'file',
          },
        ],
      });
    }

    try {
      const { data: pixels, info } = await image
        .clone()
        .raw()
        .ensureAlpha()
        .resize(32, 32, { fit: 'inside' })
        .toBuffer({ resolveWithObject: true });
      out.blurhash = encode(new Uint8ClampedArray(pixels), info.width, info.height, 4, 3);

      const stats = await sharp(file.data).stats();
      const [r, g, b] = stats.channels.map((c) => Math.round(c.mean));
      out.dominantColor = `#${[r, g, b]
        .map((v) => (v ?? 0).toString(16).padStart(2, '0'))
        .join('')}`;
    } catch (err) {
      // LQIP is an enhancement, never a blocker.
      console.error('[media] blurhash/dominantColor failed:', err);
    }
  }

  return out;
};

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    // Public read: rendered images must be servable; private documents are
    // attached via Property.documents whose own access controls exposure.
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: tenant(),
    delete: tenant({ fullRoles: ['admin'] }),
  },
  hooks: {
    beforeChange: [processUpload],
  },
  upload: {
    // §6.8: variants generated at upload. WebP ladder here; AVIF is negotiated
    // at the CDN/Next-image layer (see DECISIONS.md).
    formatOptions: { format: 'webp', options: { quality: 82 } },
    imageSizes: [320, 640, 960, 1280, 1920, 2560].map((width) => ({
      name: `w${width}`,
      width,
      formatOptions: { format: 'webp', options: { quality: 82 } },
    })),
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'agency',
      type: 'relationship',
      relationTo: 'agencies',
      index: true,
      admin: { description: 'Set automatically for agency uploads. Scopes edit access.' },
    },
    { name: 'credit', type: 'text' },
    {
      name: 'licence',
      type: 'text',
      admin: { description: 'Licence position for this asset (§13.2), e.g. "agency-supplied", "Unsplash".' },
    },
    { name: 'sourceUrl', type: 'text' },
    {
      name: 'sourceId',
      type: 'text',
      index: true,
      admin: { description: 'Source-API photo id (§13.2.3) — powers dedupe and purge.' },
    },
    { name: 'blurhash', type: 'text', admin: { readOnly: true } },
    { name: 'dominantColor', type: 'text', admin: { readOnly: true } },
  ],
};
