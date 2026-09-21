import { clsx } from 'clsx';
import type { HTMLAttributes } from 'react';

// Solid backgrounds with per-tone text colour chosen for WCAG AA contrast (>=4.5:1) — the
// spec's frozen warning colour fails AA with white text (~3.7:1), so it pairs with ink instead.
const TONE_CLASSES = {
  neutral: 'bg-shell text-ink-soft',
  success: 'bg-success text-white',
  warning: 'bg-warning text-ink',
  danger: 'bg-danger text-white',
  sample: 'bg-sand text-ink',
} as const;

export type BadgeTone = keyof typeof TONE_CLASSES;

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

export function Badge({ tone = 'neutral', className, children, ...props }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-pill px-3 py-1 text-xs font-medium uppercase tracking-wide',
        TONE_CLASSES[tone],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
