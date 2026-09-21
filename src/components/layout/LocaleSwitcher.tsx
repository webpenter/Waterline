'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';

import { LOCALES, type AppLocale } from '@/i18n/routing';

// Native language names are deliberately untranslated — every reader must be
// able to find their own language.
const LOCALE_LABELS: Record<AppLocale, string> = {
  en: 'English',
  it: 'Italiano',
  fr: 'Français',
  de: 'Deutsch',
  es: 'Español',
  ru: 'Русский',
};

interface LocaleSwitcherProps {
  label: string;
  currentLocale: string;
}

/**
 * Switches locale while preserving the current path and query string
 * (spec Prompt 6). Swaps the /{locale}/ prefix directly so no intl runtime
 * ships to the client. Localized landing-page slug mapping plugs in here once
 * landing pages exist (Prompt 10).
 */
export function LocaleSwitcher({ label, currentLocale }: LocaleSwitcherProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [, startTransition] = useTransition();

  function onChange(next: string) {
    const segments = pathname.split('/');
    segments[1] = next;
    const query = searchParams.toString();
    const target = `${segments.join('/') || `/${next}`}${query ? `?${query}` : ''}`;
    startTransition(() => {
      router.replace(target);
    });
  }

  return (
    <label className="inline-flex items-center gap-2 text-sm text-ink-soft">
      <span>{label}</span>
      <select
        value={currentLocale}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 rounded-md border border-line bg-white px-2 text-sm text-ink"
      >
        {LOCALES.map((code) => (
          <option key={code} value={code}>
            {LOCALE_LABELS[code]}
          </option>
        ))}
      </select>
    </label>
  );
}
