'use client';

import dynamic from 'next/dynamic';

import type { WeekBucket } from '@/lib/dashboard/metrics';

// Prompt 17: charts must be ssr:false dynamic imports. `ssr: false` is only
// legal inside a client component, so this thin wrapper owns the dynamic()
// call and the server dashboard imports it instead of Recharts directly.
const LeadsChart = dynamic(() => import('./LeadsChart').then((m) => m.LeadsChart), {
  ssr: false,
});

export function LeadsChartLazy({ weeks }: { weeks: WeekBucket[] }) {
  return <LeadsChart weeks={weeks} />;
}
