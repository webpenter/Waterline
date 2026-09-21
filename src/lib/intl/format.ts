import type { Currency } from '@/collections/Property/enums';
import { CURRENCIES } from '@/collections/Property/enums';
import type { FxRates } from '@/lib/fx';
import { FALLBACK_RATES_PER_EUR } from '@/lib/fx';

export type UnitSystem = 'metric' | 'imperial';

export const DEFAULT_CURRENCY: Currency = 'EUR';
export const DEFAULT_UNITS: UnitSystem = 'metric';

export const CURRENCY_COOKIE = 'wl_currency';
export const UNITS_COOKIE = 'wl_units';

export function isCurrency(value: unknown): value is Currency {
  return CURRENCIES.includes(value as Currency);
}

export function isUnitSystem(value: unknown): value is UnitSystem {
  return value === 'metric' || value === 'imperial';
}

/**
 * Display a stored priceEur in the visitor's currency using the daily FX
 * snapshot (rates are units per 1 EUR). priceEur remains the only value used
 * for sorting/filtering — display conversion never feeds back into queries.
 */
export function formatPriceEur(
  priceEur: number,
  currency: Currency = DEFAULT_CURRENCY,
  locale = 'en',
  ratesPerEur: FxRates = FALLBACK_RATES_PER_EUR,
): string {
  const amount = Math.round(priceEur * (ratesPerEur[currency] ?? 1));
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

const SQFT_PER_SQM = 10.7639;
const FEET_PER_METER = 3.28084;

export function formatArea(sqm: number, units: UnitSystem = DEFAULT_UNITS, locale = 'en'): string {
  if (units === 'imperial') {
    const sqft = Math.round(sqm * SQFT_PER_SQM);
    return `${new Intl.NumberFormat(locale).format(sqft)} sq ft`;
  }
  return `${new Intl.NumberFormat(locale).format(Math.round(sqm))} m²`;
}

export function formatLength(
  meters: number,
  units: UnitSystem = DEFAULT_UNITS,
  locale = 'en',
): string {
  if (units === 'imperial') {
    const feet = Math.round(meters * FEET_PER_METER * 10) / 10;
    return `${new Intl.NumberFormat(locale).format(feet)} ft`;
  }
  const value = Math.round(meters * 10) / 10;
  return `${new Intl.NumberFormat(locale).format(value)} m`;
}
