import { getTranslations } from 'next-intl/server';

import { brand } from '@/config/brand';
import { Link } from '@/i18n/navigation';

import { PreferenceBar } from './PreferenceBar';

/** Abyss footer per the design preview: destinations · water · company · preferences+legal. */
export async function SiteFooter() {
  const t = await getTranslations('footer');
  const nav = await getTranslations('nav');
  const home = await getTranslations('home');

  const waterLinks = [
    { href: '/search?water=sea', label: home('waterSea') },
    { href: '/search?water=lake', label: home('waterLake') },
    { href: '/search?water=river,canal', label: home('waterRiverCanal') },
    { href: '/search?type=private_island', label: home('waterPrivateIslands') },
  ] as const;

  return (
    <footer className="bg-abyss px-7 py-8 text-xs text-white/70">
      <div className="grid gap-5 md:grid-cols-4">
        <div>
          <h2 className="mb-2 text-[length:var(--text-xs)] font-medium uppercase tracking-[0.16em] text-white">
            {t('destinationsTitle')}
          </h2>
          <p className="mb-1">
            <Link href="/destinations" className="hover:text-white">
              {nav('destinations')}
            </Link>
          </p>
        </div>
        <div>
          <h2 className="mb-2 font-medium uppercase tracking-[0.16em] text-white">
            {t('waterTitle')}
          </h2>
          {waterLinks.map((link) => (
            <p key={link.href} className="mb-1">
              <Link href={link.href} className="hover:text-white">
                {link.label}
              </Link>
            </p>
          ))}
        </div>
        <div>
          <h2 className="mb-2 font-medium uppercase tracking-[0.16em] text-white">
            {t('companyTitle')}
          </h2>
          <p className="mb-1">
            <Link href="/about" className="hover:text-white">
              {nav('about')}
            </Link>
          </p>
          <p className="mb-1">
            <Link href="/journal" className="hover:text-white">
              {nav('journal')}
            </Link>
          </p>
          <p className="mb-1">
            <Link href="/list-with-us" className="hover:text-white">
              {nav('listWithUs')}
            </Link>
          </p>
          <p className="mb-1">
            <Link href="/contact" className="hover:text-white">
              {nav('contact')}
            </Link>
          </p>
        </div>
        <div className="flex flex-col gap-4">
          <div className="rounded-md bg-white/95 p-3 text-ink">
            <PreferenceBar />
          </div>
          <p>
            <Link href="/legal/privacy" className="hover:text-white">
              {t('legalPrivacy')}
            </Link>
            {' · '}
            <Link href="/legal/cookies" className="hover:text-white">
              {t('legalCookies')}
            </Link>
            {' · '}
            <Link href="/legal/terms" className="hover:text-white">
              {t('legalTerms')}
            </Link>
          </p>
          <p className="text-white/70">
            © {brand.copyrightYear} {brand.legalName}
          </p>
        </div>
      </div>
    </footer>
  );
}
