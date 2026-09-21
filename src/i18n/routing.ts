import { defineRouting } from 'next-intl/routing';

// Spec §5.1: 6 locales, en default, prefix ALWAYS present. Adding a locale
// must require only this entry plus a message file.
export const LOCALES = ['en', 'it', 'fr', 'de', 'es', 'ru'] as const;
export type AppLocale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: AppLocale = 'en';

export const routing = defineRouting({
  locales: LOCALES,
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: 'always',
});
