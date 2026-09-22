import type { Media } from '@/payload-types';

interface MediaImageProps {
  media: Media;
  alt: string;
  sizes: string;
  priority: boolean;
}

const VARIANT_WIDTHS = [320, 640, 960, 1280, 1920, 2560] as const;

function buildSrcSet(media: Media): string | undefined {
  const sizes = media.sizes;
  if (!sizes) return undefined;
  const entries = VARIANT_WIDTHS.map((width) => {
    const variant = sizes[`w${width}` as keyof typeof sizes];
    return variant?.url ? `${variant.url} ${width}w` : null;
  }).filter(Boolean);
  return entries.length > 0 ? entries.join(', ') : undefined;
}

/**
 * Listing photograph as a pure server component: srcSet is built from the
 * 6-width variant ladder Media generates at upload (§6.8/§12.2), with explicit
 * sizes, native lazy-loading and fetchpriority — the optimization next/image
 * would deliver, without shipping its ~7 kB client runtime on every route
 * (CLAUDE.md rule 1; see DECISIONS.md).
 */
export function MediaImage({ media, alt, sizes, priority }: MediaImageProps) {
  if (!media.url) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element -- deliberate: variant srcSet from upload-time ladder, zero client JS; next/image's runtime would blow the §12.1 home budget
    <img
      src={media.url}
      srcSet={buildSrcSet(media)}
      sizes={sizes}
      alt={alt}
      width={media.width ?? undefined}
      height={media.height ?? undefined}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'auto'}
      decoding="async"
      className="absolute inset-0 h-full w-full object-cover saturate-[1.04] contrast-[1.03]"
    />
  );
}
