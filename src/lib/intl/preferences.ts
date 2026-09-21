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

/** Server-side read of the visitor's currency/unit cookies with safe defaults. */
export async function getViewerPreferences(): Promise<ViewerPreferences> {
  const store = await cookies();
  const currency = store.get(CURRENCY_COOKIE)?.value;
  const units = store.get(UNITS_COOKIE)?.value;
  return {
    currency: isCurrency(currency) ? currency : DEFAULT_CURRENCY,
    units: isUnitSystem(units) ? units : DEFAULT_UNITS,
  };
}
