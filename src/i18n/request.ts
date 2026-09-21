import type { AbstractIntlMessages } from 'next-intl';
import { getRequestConfig } from 'next-intl/server';

import { DEFAULT_LOCALE, LOCALES, type AppLocale } from './routing';

type Messages = AbstractIntlMessages;

function isRecord(value: unknown): value is Messages {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Deep-merge locale messages over English so a missing key falls back to en
 * instead of rendering raw key names (spec Prompt 6). In development, every
 * fallback is reported so translators get a precise worklist.
 */
function mergeWithFallback(
  base: Messages,
  overlay: Messages,
  locale: string,
  path: string[] = [],
  missing: string[] = [],
): { merged: Messages; missing: string[] } {
  const merged: Messages = {};
  for (const key of Object.keys(base)) {
    const keyPath = [...path, key];
    const baseValue = base[key];
    const overlayValue = overlay[key];
    if (isRecord(baseValue)) {
      const child = mergeWithFallback(
        baseValue,
        isRecord(overlayValue) ? overlayValue : {},
        locale,
        keyPath,
        missing,
      );
      merged[key] = child.merged;
    } else if (overlayValue === undefined || overlayValue === '') {
      merged[key] = baseValue;
      missing.push(keyPath.join('.'));
    } else {
      merged[key] = overlayValue;
    }
  }
  return { merged, missing };
}

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale: AppLocale = LOCALES.includes(requested as AppLocale)
    ? (requested as AppLocale)
    : DEFAULT_LOCALE;

  const english = (await import('../messages/en.json')).default as Messages;

  if (locale === DEFAULT_LOCALE) {
    return { locale, messages: english };
  }

  const localized = (await import(`../messages/${locale}.json`)).default as Messages;
  const { merged, missing } = mergeWithFallback(english, localized, locale);

  if (process.env.NODE_ENV === 'development' && missing.length > 0) {
    console.warn(
      `[i18n] ${locale}.json falls back to English for ${missing.length} key(s):\n  ${missing.join('\n  ')}`,
    );
  }

  return { locale, messages: merged };
});
