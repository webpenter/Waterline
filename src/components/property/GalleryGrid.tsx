import { HorizonImage } from '@/components/property/HorizonImage';
import type { Media, Property } from '@/payload-types';
import { layout } from '@/tokens/layout';

/**
 * Listing gallery per the design preview (.gal): 2fr/1fr/1fr × 2 rows, first
 * image spanning both rows, first image priority-loaded (it is the LCP).
 * The full lightbox arrives with real photography (Prompt 13 sample data) —
 * see DECISIONS.md.
 */
export function GalleryGrid({ property }: { property: Property }) {
  const media = (property.media ?? []).slice(0, 5) as Array<Media | number>;
  const cells = Array.from({ length: 5 }, (_, index) => media[index] ?? null);

  return (
    <div
      className="grid grid-cols-[2fr_1fr_1fr] grid-rows-2 gap-1"
      style={{ height: layout.galleryH }}
    >
      {cells.map((cell, index) => (
        <div key={index} className={`relative ${index === 0 ? 'row-span-2' : ''}`}>
          <HorizonImage
            media={cell}
            seed={`${property.id}-${index}`}
            sizes={index === 0 ? '(max-width: 768px) 100vw, 50vw' : '25vw'}
            priority={index === 0}
            scrim={index === 0}
          />
        </div>
      ))}
    </div>
  );
}
