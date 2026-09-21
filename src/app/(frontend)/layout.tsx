import type { Metadata } from 'next';
import React from 'react';

import { brand } from '@/config/brand';

import './styles.css';

export const metadata: Metadata = {
  title: brand.name,
  description: brand.description,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
