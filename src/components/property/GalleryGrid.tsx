import { getTranslations } from 'next-intl/server';

import { HorizonImage } from '@/components/property/HorizonImage';
import { GalleryLightbox, LightboxTrigger } from '@/components/property/GalleryLightbox';
import type { LightboxImage } from '@/components/property/Lightbox';
import type { Media, Property } from '@/payload-types';
import { layout } from '@/tokens/layout';

const LIGHTBOX_WIDTHS = [960, 1280, 1920, 2560] as const;

function toLightboxImage(media: Media, fallbackAlt: string): LightboxImage | null {
  const src = media.sizes?.w1920?.url ?? media.url;
  if (!src) return null;
  const srcSet = LIGHTBOX_WIDTHS.map((width) => {
    const variant = media.sizes?.[`w${width}` as keyof typeof media.sizes];
    return variant && typeof variant === 'object' && variant.url
      ? `${variant.url} ${width}w`
      : null;
  })
    .filter(Boolean)
    .join(', ');
  return { src, srcSet: srcSet || undefined, alt: media.alt ?? fallbackAlt };
}

/**
 * Listing gallery per the design preview (.gal): 2fr/1fr/1fr × 2 rows, first
 * image spanning both rows, first image priority-loaded (it is the LCP).
 * Real photographs get a full-screen lightbox (§10.3/§12.2) — the client
 * shell is a few hundred bytes; the lightbox chunk loads on first open.
 */
export async function GalleryGrid({ property }: { property: Property }) {
  const t = await getTranslations('listing');
  const media = (property.media ?? []).slice(0, 5) as Array<Media | number>;
  const cells = Array.from({ length: 5 }, (_, index) => media[index] ?? null);

  // Only real uploaded photographs open in the lightbox; procedural
  // placeholder cells stay non-interactive.
  const realImages: LightboxImage[] = [];
  const lightboxIndexByCell = new Map<number, number>();
  cells.forEach((cell, cellIndex) => {
    if (cell && typeof cell === 'object') {
      const image = toLightboxImage(cell, property.title);
      if (image) {
        lightboxIndexByCell.set(cellIndex, realImages.length);
        realImages.push(image);
      }
    }
  });

  const grid = (
    <div
      className="grid grid-cols-2 grid-rows-[2fr_1fr_1fr] gap-1 sm:grid-cols-[2fr_1fr_1fr] sm:grid-rows-2"
      style={{ height: layout.galleryH }}
    >
      {cells.map((cell, index) => {
        const lightboxIndex = lightboxIndexByCell.get(index);
        return (
          <div
            key={index}
            className={`relative ${index === 0 ? 'col-span-2 sm:col-span-1 sm:row-span-2' : ''}`}
          >
            <HorizonImage
              media={cell}
              seed={`${property.id}-${index}`}
              sizes={index === 0 ? '(max-width: 768px) 100vw, 50vw' : '25vw'}
              priority={index === 0}
              scrim={index === 0}
            />
            {lightboxIndex != null ? (
              <LightboxTrigger
                index={lightboxIndex}
                label={t('lightboxOpen', { n: lightboxIndex + 1, count: realImages.length })}
              />
            ) : null}
          </div>
        );
      })}
    </div>
  );

  if (realImages.length === 0) return grid;

  return (
    <GalleryLightbox
      propertyId={property.id}
      images={realImages}
      labels={{
        dialog: t('lightboxLabel'),
        close: t('lightboxClose'),
        prev: t('lightboxPrev'),
        next: t('lightboxNext'),
        // Raw ICU string — the lightbox interpolates {n}/{count} per photo.
        counterTemplate: t.raw('lightboxCounter'),
      }}
    >
      {grid}
    </GalleryLightbox>
  );
}
