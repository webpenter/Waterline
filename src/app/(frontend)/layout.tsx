import type { Metadata } from 'next';
import React from 'react';

import { brand } from '@/config/brand';
import { bodyFont, displayFont } from '@/tokens/fonts';

import './styles.css';

export const metadata: Metadata = {
  title: brand.name,
  description: brand.description,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning covers ONLY this element's attributes: browser
    // extensions (Grammarly, dark-mode, translators) inject attrs into <html>
    // before React hydrates. Real mismatches deeper in the tree still surface,
    // and tests/console-errors.spec.ts keeps the tree hydration-clean in CI.
    <html
      lang="en"
      className={`${displayFont.variable} ${bodyFont.variable}`}
      suppressHydrationWarning
    >
      <body>{children}</body>
    </html>
  );
}
