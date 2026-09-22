'use client';

import type { AnchorHTMLAttributes, ReactNode } from 'react';

import { trackEvent, type AnalyticsEventMap, type AnalyticsEventName } from '@/lib/analytics';

interface TrackedLinkProps<E extends AnalyticsEventName>
  extends AnchorHTMLAttributes<HTMLAnchorElement> {
  event: E;
  eventProps: AnalyticsEventMap[E];
  children: ReactNode;
}

/** §17: an <a> that reports its click — used for brochure and WhatsApp CTAs. */
export function TrackedLink<E extends AnalyticsEventName>({
  event,
  eventProps,
  children,
  ...anchor
}: TrackedLinkProps<E>) {
  return (
    <a {...anchor} onClick={() => trackEvent(event, eventProps)}>
      {children}
    </a>
  );
}
