'use client';

import dynamic from 'next/dynamic';
import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import type { LightboxImage, LightboxLabels } from './Lightbox';

// §12.2 rule 3: the lightbox is an ssr:false dynamic import — its chunk loads
// on first open, never in the listing route's first-load bundle.
const Lightbox = dynamic(() => import('./Lightbox').then((m) => m.Lightbox), { ssr: false });

interface GalleryContextValue {
  openAt: (index: number, trigger: HTMLElement | null) => void;
}

const GalleryContext = createContext<GalleryContextValue | null>(null);

interface GalleryLightboxProps {
  images: LightboxImage[];
  labels: LightboxLabels;
  children: ReactNode;
}

/**
 * Client shell around the server-rendered gallery grid: holds open/index
 * state, restores focus to the opening trigger on close (§15), and mounts the
 * lazy Lightbox only after the first interaction.
 */
export function GalleryLightbox({ images, labels, children }: GalleryLightboxProps) {
  const [index, setIndex] = useState<number | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  const openAt = useCallback((next: number, trigger: HTMLElement | null) => {
    triggerRef.current = trigger;
    setIndex(next);
  }, []);

  const close = useCallback(() => {
    setIndex(null);
    triggerRef.current?.focus();
  }, []);

  return (
    <GalleryContext.Provider value={{ openAt }}>
      {children}
      {index != null && images.length > 0 ? (
        <Lightbox
          images={images}
          currentIndex={index}
          labels={labels}
          onClose={close}
          onNavigate={setIndex}
        />
      ) : null}
    </GalleryContext.Provider>
  );
}

interface LightboxTriggerProps {
  index: number;
  label: string;
}

/** Transparent full-cell button over a gallery image; opens the lightbox. */
export function LightboxTrigger({ index, label }: LightboxTriggerProps) {
  const context = useContext(GalleryContext);
  if (!context) return null;
  return (
    <button
      type="button"
      aria-label={label}
      onClick={(event) => context.openAt(index, event.currentTarget)}
      className="absolute inset-0 cursor-zoom-in"
    />
  );
}
