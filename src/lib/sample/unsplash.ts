import { imageQueries, type DestinationQueryKey } from '@/scripts/image-queries';

/**
 * §13.2 image sourcing. Unsplash is the primary source; the API-checkable
 * selection rules are implemented as filters (≥1600 px long edge, landscape
 * preference, per-destination dedupe by photo id and blur_hash). Face/logo/
 * landmark screening is the developer's visual pass over the seeded galleries
 * (see DECISIONS.md). The download-tracking call REQUIRED by Unsplash's API
 * terms fires once per selected photo.
 */

export interface SourcedPhoto {
  sourceId: string;
  url: string;
  width: number;
  height: number;
  blurHash: string | null;
  credit: string;
  creditUrl: string;
  sourceUrl: string;
  downloadLocation: string;
  role: 'hero' | 'exterior' | 'interior' | 'aerial' | 'detail';
}

interface UnsplashPhoto {
  id: string;
  width: number;
  height: number;
  blur_hash: string | null;
  urls: { raw: string };
  links: { html: string; download_location: string };
  user: { name: string; links: { html: string } };
}

export const MIN_LONG_EDGE = 1600;

/** §13.2.2 API-checkable filters, pure for testing. */
export function passesSelectionFilters(photo: {
  width: number;
  height: number;
}): boolean {
  if (Math.max(photo.width, photo.height) < MIN_LONG_EDGE) return false;
  return true;
}

/** §13.2.2 gallery grammar: 1 hero, 2 exterior/water, 3–5 interior, 1 aerial, 1 detail. */
export function galleryPlan(index: number): Array<{ role: SourcedPhoto['role']; query: 'destination' | keyof typeof imageQueries.byFeature }> {
  const interiors = 3 + (index % 3); // 3–5
  return [
    { role: 'hero', query: 'destination' },
    { role: 'exterior', query: 'destination' },
    { role: 'exterior', query: index % 2 === 0 ? 'private_dock' : 'pool' },
    ...Array.from({ length: interiors }, () => ({ role: 'interior' as const, query: 'interior' as const })),
    { role: 'aerial', query: 'aerial' },
    { role: 'detail', query: 'detail' },
  ];
}

/**
 * Deduplicating selector, pure: walks candidate pools in order, skipping
 * photos whose id or blur_hash was already used within this destination
 * (blur_hash doubles as a cheap perceptual near-duplicate signal).
 */
export function selectGallery(
  plan: ReturnType<typeof galleryPlan>,
  pools: Record<string, Array<Pick<UnsplashPhoto, 'id' | 'width' | 'height' | 'blur_hash'>>>,
  usedIds: Set<string>,
  usedHashes: Set<string>,
): Array<{ id: string; role: SourcedPhoto['role'] }> {
  const chosen: Array<{ id: string; role: SourcedPhoto['role'] }> = [];
  for (const slot of plan) {
    const pool = pools[slot.query] ?? [];
    const photo = pool.find(
      (candidate) =>
        passesSelectionFilters(candidate) &&
        !usedIds.has(candidate.id) &&
        (!candidate.blur_hash || !usedHashes.has(candidate.blur_hash)),
    );
    if (!photo) continue;
    usedIds.add(photo.id);
    if (photo.blur_hash) usedHashes.add(photo.blur_hash);
    chosen.push({ id: photo.id, role: slot.role });
  }
  return chosen;
}

async function unsplashSearch(
  query: string,
  accessKey: string,
  perPage = 20,
): Promise<UnsplashPhoto[]> {
  const url = new URL('https://api.unsplash.com/search/photos');
  url.searchParams.set('query', query);
  url.searchParams.set('per_page', String(perPage));
  url.searchParams.set('orientation', 'landscape');
  url.searchParams.set('content_filter', 'high');
  const res = await fetch(url, {
    headers: { Authorization: `Client-ID ${accessKey}` },
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) throw new Error(`Unsplash search failed: ${res.status}`);
  const data = (await res.json()) as { results: UnsplashPhoto[] };
  return data.results;
}

/** REQUIRED by Unsplash API terms: fire the download-tracking endpoint per used photo. */
export async function trackDownload(downloadLocation: string, accessKey: string): Promise<void> {
  try {
    await fetch(downloadLocation, {
      headers: { Authorization: `Client-ID ${accessKey}` },
      signal: AbortSignal.timeout(10_000),
    });
  } catch (err) {
    console.warn('[unsplash] download tracking failed:', err);
  }
}

const poolCache = new Map<string, UnsplashPhoto[]>();

async function pool(query: string, accessKey: string): Promise<UnsplashPhoto[]> {
  const cached = poolCache.get(query);
  if (cached) return cached;
  const photos = await unsplashSearch(query, accessKey);
  poolCache.set(query, photos);
  return photos;
}

/**
 * Source one listing's gallery. Returns [] without an access key or on API
 * failure — galleries then fall back to the horizon-gradient placeholders.
 */
export async function sourceGallery(
  index: number,
  destinationKey: DestinationQueryKey,
  usedIds: Set<string>,
  usedHashes: Set<string>,
): Promise<SourcedPhoto[]> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey || accessKey.startsWith('dev_')) return [];

  try {
    const destinationQueries = imageQueries.byDestination[destinationKey];
    const destinationQuery = destinationQueries[index % destinationQueries.length] as string;

    const plan = galleryPlan(index);
    const pools: Record<string, UnsplashPhoto[]> = { destination: await pool(destinationQuery, accessKey) };
    for (const slot of plan) {
      if (slot.query !== 'destination' && !pools[slot.query]) {
        const featureQueries = imageQueries.byFeature[slot.query];
        pools[slot.query] = await pool(
          featureQueries[index % featureQueries.length] as string,
          accessKey,
        );
      }
    }

    const chosen = selectGallery(plan, pools, usedIds, usedHashes);
    const byId = new Map(
      Object.values(pools)
        .flat()
        .map((photo) => [photo.id, photo]),
    );

    const sourced: SourcedPhoto[] = [];
    for (const { id, role } of chosen) {
      const photo = byId.get(id);
      if (!photo) continue;
      await trackDownload(photo.links.download_location, accessKey);
      sourced.push({
        sourceId: photo.id,
        url: `${photo.urls.raw}&w=2400&q=85&fm=jpg`,
        width: photo.width,
        height: photo.height,
        blurHash: photo.blur_hash,
        credit: photo.user.name,
        creditUrl: photo.user.links.html,
        sourceUrl: photo.links.html,
        downloadLocation: photo.links.download_location,
        role,
      });
    }
    return sourced;
  } catch (err) {
    console.warn(`[unsplash] gallery sourcing failed for listing ${index}:`, err);
    return [];
  }
}
