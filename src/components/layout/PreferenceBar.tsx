import { getLocale, getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import { CurrencySwitcher } from './CurrencySwitcher';
import { LocaleSwitcher } from './LocaleSwitcher';
import { UnitSwitcher } from './UnitSwitcher';

/**
 * Locale · currency · units switchers, grouped as in the design preview's
 * footer ("English · EUR · Metric"). Server component: all labels are
 * translated here and passed down as strings, so the next-intl client runtime
 * (~20 kB gz) never ships to the browser — that's the difference between the
 * home route fitting its 110 kB budget or not.
 */
export async function PreferenceBar() {
  const t = await getTranslations('preferences');
  const locale = await getLocale();

  return (
    <div className="flex flex-wrap items-center gap-5">
      <Suspense>
        <LocaleSwitcher label={t('language')} currentLocale={locale} />
      </Suspense>
      <CurrencySwitcher label={t('currency')} />
      <UnitSwitcher
        label={t('units')}
        metricLabel={t('unitsMetric')}
        imperialLabel={t('unitsImperial')}
      />
    </div>
  );
}
