import { createNavigation } from 'next-intl/navigation';

import { routing } from './routing';

// Locale-aware drop-ins for next/link and next/navigation. All internal
// navigation goes through these so the locale prefix is never hand-built.
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
