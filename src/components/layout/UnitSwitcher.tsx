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
  dark?: boolean;
}

/** Metric/imperial preference, stored in a cookie (spec Prompt 6). */
export function UnitSwitcher({
  label,
  metricLabel,
  imperialLabel,
  dark = false,
}: UnitSwitcherProps) {
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
    <label
      className={`inline-flex items-center gap-2 text-xs uppercase tracking-wider ${
        dark ? 'text-white/70' : 'text-ink-soft'
      }`}
    >
      <span>{label}</span>
      <select
        value={units}
        onChange={(event) => onChange(event.target.value)}
        className={`h-8 rounded border px-2 text-xs font-medium cursor-pointer transition-colors ${
          dark
            ? 'border-white/20 bg-abyss text-white hover:border-white/40'
            : 'border-line bg-white text-ink'
        }`}
      >
        <option value="metric" className="bg-abyss text-white">
          {metricLabel}
        </option>
        <option value="imperial" className="bg-abyss text-white">
          {imperialLabel}
        </option>
      </select>
    </label>
  );
}
