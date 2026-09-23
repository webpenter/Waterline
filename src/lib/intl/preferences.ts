import type { Currency } from '@/collections/Property/enums';

import { DEFAULT_CURRENCY, DEFAULT_UNITS, type UnitSystem } from './format';

export interface ViewerPreferences {
  currency: Currency;
  units: UnitSystem;
}

/**
 * Currency/unit preferences for server rendering.
 *
 * Deliberately does NOT read cookies(). Reading cookies() marks a route
 * dynamic, and these preferences are consumed by SSG/ISR pages (property,
 * landing, home, destinations) that have generateStaticParams — Next then
 * throws "Page changed from static to dynamic at runtime, reason: cookies"
 * on any non-prerendered request, which was 500ing every property page in
 * production. CLAUDE.md rule 4 also forbids force-dynamic on indexable routes.
 *
 * So the server renders in the canonical currency (EUR — the stored priceEur)
 * and metric units; per-visitor currency/unit switching is applied
 * client-side by the switchers. Kept async so callers need no changes.
 */
export async function getViewerPreferences(): Promise<ViewerPreferences> {
  return { currency: DEFAULT_CURRENCY, units: DEFAULT_UNITS };
}
