'use client';

import { useEffect, useRef } from 'react';

import { trackEvent, type AnalyticsEventMap, type AnalyticsEventName } from '@/lib/analytics';

interface AnalyticsBeaconProps<E extends AnalyticsEventName> {
  event: E;
  props: AnalyticsEventMap[E];
}

/**
 * §17: fire one typed analytics event after hydration. Renders nothing and
 * no-ops entirely unless the visitor's consent loaded Plausible.
 */
export function AnalyticsBeacon<E extends AnalyticsEventName>({
  event,
  props,
}: AnalyticsBeaconProps<E>) {
  const fired = useRef(false);
  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    trackEvent(event, props);
    // Intentionally fire-once per mount; prop churn must not re-send.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
