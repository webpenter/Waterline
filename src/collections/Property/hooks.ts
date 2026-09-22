import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionBeforeChangeHook,
  CollectionBeforeValidateHook,
} from 'payload';
import { ValidationError } from 'payload';

import { logAudit } from '@/lib/audit';
import { convertToEur, getDailyRatesPerEur } from '@/lib/fx';
import { computeFingerprint } from '@/lib/fingerprint';
import { revalidatePaths } from '@/lib/revalidate';
import { slugify } from '@/lib/slug';
import { toSearchDocument } from '@/lib/search/document';
import { deletePropertyDocument, upsertPropertyDocument } from '@/lib/search/sync';
import { isAgencyRole, relationId } from '@/payload/access/tenant';

import type { Currency } from './enums';
import { LISTING_LIFETIME_DAYS } from './enums';
import { checkWaterRule } from './validation';

type PropertyData = Record<string, unknown>;

function merged(data: PropertyData | undefined, originalDoc: PropertyData | undefined) {
  return { ...(originalDoc ?? {}), ...(data ?? {}) } as PropertyData;
}

/**
 * §8.1 submission gate for agency roles, applied before anything else:
 * - the listing is always owned by the submitter's own agency (and, for an
 *   agency_agent, routed to their own agent profile);
 * - `featured` and `moderation` are editorial-only — agency changes are dropped;
 * - agencies can never set status=in_market or publish directly: the attempt
 *   becomes status=pending_review, saved as a draft for the review queue.
 */
export const sanitizeAgencySubmission: CollectionBeforeChangeHook = ({
  data,
  req,
  originalDoc,
}) => {
  const user = req.user;
  if (!user || !isAgencyRole(user.role)) return data;

  const out: PropertyData = { ...data };
  const original = (originalDoc ?? {}) as PropertyData;

  out.agency = relationId(user.agency as number | { id: number } | null) ?? original.agency;
  if (user.role === 'agency_agent') {
    out.agent =
      relationId(user.agentProfile as number | { id: number } | null) ?? original.agent;
  }

  out.featured = original.featured ?? false;
  out.moderation = original.moderation ?? 'unreviewed';

  const wantsInMarket = out.status === 'in_market';
  const wantsPublish = out._status === 'published';
  if (wantsInMarket || wantsPublish) {
    out.status = 'pending_review';
    out._status = 'draft';
  }

  return out;
};

/**
 * The water rule (spec §2.2). Publishing an inadmissible listing throws a
 * validation error with a human-readable reason; saving it as a draft is allowed
 * but writes the same reason into moderationNote so the submitting agency sees
 * exactly why it cannot go live.
 */
export const enforceWaterRule: CollectionBeforeValidateHook = ({ data, originalDoc }) => {
  const doc = merged(data, originalDoc as PropertyData);
  const result = checkWaterRule({
    waterAccessType: doc.waterAccessType as unknown[] | null,
    distanceToWaterM: doc.distanceToWaterM as number | null,
  });

  if (result.ok) return data;

  if (doc._status === 'published') {
    throw new ValidationError({
      collection: 'properties',
      errors: [
        { message: result.reason as string, path: 'waterAccessType' },
        { message: result.reason as string, path: 'distanceToWaterM' },
      ],
    });
  }

  // Draft save: allowed, but surface the reason to the agency.
  return { ...data, moderationNote: result.reason };
};

export const computeDerivedFields: CollectionBeforeChangeHook = async ({
  data,
  originalDoc,
  req,
}) => {
  // View-counter updates touch nothing derived — skip the FX/slug/fingerprint work.
  if (req.context?.viewBeacon) return data;

  const doc = merged(data, originalDoc as PropertyData);
  const out: PropertyData = { ...data };

  // priceEur — the only field ever used for sorting and range filters (§6.2).
  const amount = doc.priceAmount as number | null | undefined;
  if (amount != null && doc.currency) {
    const rates = await getDailyRatesPerEur();
    out.priceEur = convertToEur(amount, doc.currency as Currency, rates);
  } else {
    out.priceEur = null;
  }

  // Slug — generated on first publish (§6.1). A deliberate admin edit is
  // honoured; §14.5's 301 Redirect record is written in syncAfterChange.
  const existingSlug = (originalDoc as PropertyData | undefined)?.slug as string | undefined;
  const incomingSlug = typeof data?.slug === 'string' ? data.slug.trim() : '';
  if (existingSlug && incomingSlug && incomingSlug !== existingSlug) {
    out.slug = slugify(incomingSlug);
  } else if (existingSlug) {
    out.slug = existingSlug;
  } else if (doc._status === 'published' && !doc.slug) {
    const location = doc.location as PropertyData | undefined;
    out.slug = slugify(
      typeof doc.title === 'string' ? doc.title : undefined,
      location?.locality as string | undefined,
      location?.region as string | undefined,
    );
  }

  // Fingerprint for duplicate detection (§8.8). Point fields are [lng, lat].
  const location = doc.location as PropertyData | undefined;
  const coords = location?.coordinates as [number, number] | undefined;
  out.fingerprint = computeFingerprint({
    longitude: coords?.[0],
    latitude: coords?.[1],
    propertyType: doc.propertyType as string | null,
    builtAreaSqm: doc.builtAreaSqm as number | null,
    bedrooms: doc.bedrooms as number | null,
  });

  // publishedAt / expiresAt lifecycle (§8.7).
  const wasPublished = Boolean((originalDoc as PropertyData | undefined)?.publishedAt);
  if (doc._status === 'published' && !wasPublished) {
    const publishedAt = new Date();
    out.publishedAt = publishedAt.toISOString();
    out.expiresAt = new Date(
      publishedAt.getTime() + LISTING_LIFETIME_DAYS * 24 * 60 * 60 * 1000,
    ).toISOString();
  }

  return out;
};

function isPubliclyIndexable(doc: PropertyData): boolean {
  return (
    doc._status === 'published' &&
    ['in_market', 'under_offer'].includes(doc.status as string) &&
    doc.visibility === 'public' &&
    doc.moderation === 'approved'
  );
}

export const syncAfterChange: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  operation,
  req,
}) => {
  // View-counter increments are not content changes: no audit, no reindex.
  if (req.context?.viewBeacon) return doc;

  const d = doc as PropertyData;

  // §14.5: a slug change creates an automatic 301 from the old URL; the old
  // slug is never reused.
  const previousSlug = (previousDoc as PropertyData | undefined)?.slug as string | undefined;
  if (previousSlug && typeof d.slug === 'string' && d.slug && d.slug !== previousSlug) {
    try {
      const from = `/property/${previousSlug}`;
      const existing = await req.payload.find({
        collection: 'redirects',
        where: { from: { equals: from } },
        limit: 1,
        depth: 0,
        overrideAccess: true,
      });
      if (!existing.docs[0]) {
        await req.payload.create({
          collection: 'redirects',
          overrideAccess: true,
          data: { from, to: `/property/${d.slug}`, statusCode: '301' },
        });
      }
    } catch (err) {
      console.warn('[slug-redirect] failed to record 301:', err);
    }
  }

  const justPublished =
    d._status === 'published' && (previousDoc as PropertyData | undefined)?._status !== 'published';
  await logAudit(
    req,
    justPublished ? 'publish' : operation === 'create' ? 'create' : 'update',
    'properties',
    String(d.id),
    `status=${d.status}`,
  );
  if (isPubliclyIndexable(d)) {
    await upsertPropertyDocument(toSearchDocument(d));
  } else {
    await deletePropertyDocument(String(d.id));
  }

  const paths = ['/'];
  if (typeof d.slug === 'string' && d.slug) paths.push(`/property/${d.slug}`);
  await revalidatePaths(paths);

  return doc;
};

export const cleanupAfterDelete: CollectionAfterDeleteHook = async ({ doc, req }) => {
  const d = doc as PropertyData;
  await logAudit(req, 'delete', 'properties', String(d.id), String(d.slug ?? ''));
  await deletePropertyDocument(String(d.id));
  const paths = ['/'];
  if (typeof d.slug === 'string' && d.slug) paths.push(`/property/${d.slug}`);
  await revalidatePaths(paths);
};
