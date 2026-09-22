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
  dark?: boolean;
}

/**
 * Switches locale while preserving the current path and query string
 * (spec Prompt 6). Swaps the /{locale}/ prefix directly so no intl runtime
 * ships to the client. Localized landing-page slug mapping plugs in here once
 * landing pages exist (Prompt 10).
 */
export function LocaleSwitcher({ label, currentLocale, dark = false }: LocaleSwitcherProps) {
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
    <label
      className={`inline-flex items-center gap-2 text-xs uppercase tracking-wider ${
        dark ? 'text-white/70' : 'text-ink-soft'
      }`}
    >
      <span>{label}</span>
      <select
        value={currentLocale}
        onChange={(event) => onChange(event.target.value)}
        className={`h-8 rounded border px-2 text-xs font-medium cursor-pointer transition-colors ${
          dark
            ? 'border-white/20 bg-abyss text-white hover:border-white/40'
            : 'border-line bg-white text-ink'
        }`}
      >
        {LOCALES.map((code) => (
          <option key={code} value={code} className="bg-abyss text-white">
            {LOCALE_LABELS[code]}
          </option>
        ))}
      </select>
    </label>
  );
}
