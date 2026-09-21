import type { Currency } from '@/collections/Property/enums';

export type FxRates = Record<Currency, number>;

/**
 * Units of each currency per 1 EUR. Used as the offline fallback when no FX API
 * is configured or the daily fetch fails; refreshed rates overwrite these at runtime.
 * Snapshot dated 2026-09-21 (approximate — the daily fetch is the source of truth).
 */
export const FALLBACK_RATES_PER_EUR: FxRates = {
  EUR: 1,
  USD: 1.08,
  GBP: 0.85,
  CHF: 0.94,
  AED: 3.97,
  SGD: 1.45,
};

/**
 * Convert an amount in `currency` to EUR using `ratesPerEur` (units per 1 EUR).
 * priceEur is the only field ever used for sorting and range filters (spec §6.2).
 */
export function convertToEur(
  amount: number,
  currency: Currency,
  ratesPerEur: FxRates = FALLBACK_RATES_PER_EUR,
): number {
  const rate = ratesPerEur[currency];
  if (!rate || rate <= 0) {
    throw new Error(`No FX rate available for currency ${currency}`);
  }
  // Round to whole euros: sub-euro precision is meaningless at these price points.
  return Math.round(amount / rate);
}

interface CachedSnapshot {
  date: string;
  rates: FxRates;
}

let cache: CachedSnapshot | null = null;

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Daily FX snapshot: fetches once per calendar day per server process, falls back
 * to the static table when no FX_API_KEY is set or the fetch fails. Never throws.
 */
export async function getDailyRatesPerEur(): Promise<FxRates> {
  const today = todayKey();
  if (cache && cache.date === today) return cache.rates;

  const apiKey = process.env.FX_API_KEY;
  if (apiKey) {
    try {
      const res = await fetch(
        `https://api.exchangerate.host/live?access_key=${apiKey}&source=EUR&currencies=USD,GBP,CHF,AED,SGD`,
        { signal: AbortSignal.timeout(4000) },
      );
      if (res.ok) {
        const data = (await res.json()) as {
          success?: boolean;
          quotes?: Record<string, number>;
        };
        if (data.success && data.quotes) {
          const rates: FxRates = {
            EUR: 1,
            USD: data.quotes.EURUSD ?? FALLBACK_RATES_PER_EUR.USD,
            GBP: data.quotes.EURGBP ?? FALLBACK_RATES_PER_EUR.GBP,
            CHF: data.quotes.EURCHF ?? FALLBACK_RATES_PER_EUR.CHF,
            AED: data.quotes.EURAED ?? FALLBACK_RATES_PER_EUR.AED,
            SGD: data.quotes.EURSGD ?? FALLBACK_RATES_PER_EUR.SGD,
          };
          cache = { date: today, rates };
          return rates;
        }
      }
    } catch {
      // fall through to the static snapshot
    }
  }

  cache = { date: today, rates: FALLBACK_RATES_PER_EUR };
  return FALLBACK_RATES_PER_EUR;
}

/** Test hook: clear the in-memory daily cache. */
export function resetFxCache(): void {
  cache = null;
}
