'use client';

import { useEffect } from 'react';

/**
 * Fire-and-forget view counter beacon (§10.3): posts once after hydration,
 * never blocks render; the server route deduplicates per session.
 */
export function ViewBeacon({ propertyId }: { propertyId: number }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      void fetch('/api/property/view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: propertyId }),
        keepalive: true,
      }).catch(() => undefined);
    }, 1200);
    return () => clearTimeout(timer);
  }, [propertyId]);

  return null;
}
