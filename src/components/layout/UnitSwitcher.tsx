'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import {
  DEFAULT_UNITS,
  isUnitSystem,
  UNITS_COOKIE,
  type UnitSystem,
} from '@/lib/intl/format';

function readCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined;
  return document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${name}=`))
    ?.split('=')[1];
}

interface UnitSwitcherProps {
  label: string;
  metricLabel: string;
  imperialLabel: string;
}

/** Metric/imperial preference, stored in a cookie (spec Prompt 6). */
export function UnitSwitcher({ label, metricLabel, imperialLabel }: UnitSwitcherProps) {
  const router = useRouter();
  const [units, setUnits] = useState<UnitSystem>(() => {
    const stored = readCookie(UNITS_COOKIE);
    return isUnitSystem(stored) ? stored : DEFAULT_UNITS;
  });

  function onChange(next: string) {
    if (!isUnitSystem(next)) return;
    setUnits(next);
    document.cookie = `${UNITS_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  }

  return (
    <label className="inline-flex items-center gap-2 text-sm text-ink-soft">
      <span>{label}</span>
      <select
        value={units}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 rounded-md border border-line bg-white px-2 text-sm text-ink"
      >
        <option value="metric">{metricLabel}</option>
        <option value="imperial">{imperialLabel}</option>
      </select>
    </label>
  );
}
