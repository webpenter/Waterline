import { clsx } from 'clsx';
import { getTranslations } from 'next-intl/server';

import { brand } from '@/config/brand';
import { Link } from '@/i18n/navigation';

interface SiteHeaderProps {
  /** true when the header sits over the hero image (white text, no border). */
  onHero?: boolean;
}

/** Top navigation per the design preview: serif wordmark, uppercase links, bordered CTA. */
export async function SiteHeader({ onHero = false }: SiteHeaderProps) {
  const t = await getTranslations('nav');

  const links = [
    { href: '/search', label: t('collection') },
    { href: '/destinations', label: t('destinations') },
    { href: '/journal', label: t('journal') },
    { href: '/about', label: t('about') },
  ] as const;

  return (
    <nav
      className={clsx(
        'relative z-header flex items-center justify-between px-7 py-4',
        onHero ? 'text-white' : 'border-b border-line bg-white text-abyss',
      )}
    >
      <Link href="/" className="font-display text-lg uppercase tracking-[0.22em]">
        {brand.name}
      </Link>
      <ul className="hidden items-center gap-6 text-xs uppercase tracking-[0.12em] md:flex">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="hover:opacity-70">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
      <Link
        href="/list-with-us"
        className="border border-current px-4 py-2 text-xs uppercase tracking-[0.14em] hover:opacity-70"
      >
        {t('listWithUs')}
      </Link>
    </nav>
  );
}
