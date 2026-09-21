import { Inter, Playfair_Display } from 'next/font/google';

export const displayFont = Playfair_Display({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '700'],
  variable: '--font-display-loaded',
  display: 'swap',
  preload: true,
});

export const bodyFont = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-body-loaded',
  display: 'swap',
  preload: false,
});
