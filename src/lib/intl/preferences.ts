import { cookies } from 'next/headers';

import type { Currency } from '@/collections/Property/enums';

import {
  CURRENCY_COOKIE,
  DEFAULT_CURRENCY,
  DEFAULT_UNITS,
  isCurrency,
  isUnitSystem,
  UNITS_COOKIE,
  type UnitSystem,
} from './format';

export interface ViewerPreferences {
  currency: Currency;
  units: UnitSystem;
}

const DEFAULTS: ViewerPreferences = { currency: DEFAULT_CURRENCY, units: DEFAULT_UNITS };

/**
 * Currency/unit preference read (§Prompt 6). Display-only — never feeds a query.
 *
 * Reading cookies() opts a route into dynamic rendering. Indexable pages here
 * are SSG/ISR and forbidden from force-dynamic (CLAUDE.md rule 4), so on a
 * static render cookies() throws DynamicServerError — we swallow it and fall
 * back to the canonical EUR/metric defaults, letting the page render statically
 * and cache. On genuinely dynamic routes (e.g. /search, dynamic via
 * searchParams) the read succeeds and the visitor's real preference applies.
 * Per-user currency on cached listing pages is applied client-side.
 */
export async function getViewerPreferences(): Promise<ViewerPreferences> {
  try {
    const store = await cookies();
    const currency = store.get(CURRENCY_COOKIE)?.value;
    const units = store.get(UNITS_COOKIE)?.value;
    return {
      currency: isCurrency(currency) ? currency : DEFAULT_CURRENCY,
      units: isUnitSystem(units) ? units : DEFAULT_UNITS,
    };
  } catch {
    // Static/ISR render: cookies() unavailable — use canonical defaults.
    return DEFAULTS;
  }
}
