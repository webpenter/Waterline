'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { CURRENCIES, type Currency } from '@/collections/Property/enums';
import { CURRENCY_COOKIE, DEFAULT_CURRENCY, isCurrency } from '@/lib/intl/format';

function readCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined;
  return document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${name}=`))
    ?.split('=')[1];
}

/** EUR-default currency preference, stored in a cookie (spec Prompt 6). */
export function CurrencySwitcher({ label }: { label: string }) {
  const router = useRouter();
  const [currency, setCurrency] = useState<Currency>(() => {
    const stored = readCookie(CURRENCY_COOKIE);
    return isCurrency(stored) ? stored : DEFAULT_CURRENCY;
  });

  function onChange(next: string) {
    if (!isCurrency(next)) return;
    setCurrency(next);
    document.cookie = `${CURRENCY_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  }

  return (
    <label className="inline-flex items-center gap-2 text-sm text-ink-soft">
      <span>{label}</span>
      <select
        value={currency}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 rounded-md border border-line bg-white px-2 text-sm text-ink"
      >
        {CURRENCIES.map((code) => (
          <option key={code} value={code}>
            {code}
          </option>
        ))}
      </select>
    </label>
  );
}
