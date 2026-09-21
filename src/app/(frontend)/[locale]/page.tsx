import { getTranslations, setRequestLocale } from 'next-intl/server';

import { PreferenceBar } from '@/components/layout/PreferenceBar';

// Placeholder home carrying the §11.1 hero copy; the full page is Prompt 9.
export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('home');

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-4 px-6">
      <h1 className="font-display text-4xl text-abyss">{t('heroTitle')}</h1>
      <p className="max-w-prose text-lg text-ink-soft">{t('heroSub')}</p>
      <PreferenceBar />
    </main>
  );
}
