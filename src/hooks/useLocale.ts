'use client';

import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import { stripLocale } from '@/lib/i18n';

export function useLocale() {
  const pathname = usePathname();
  return useMemo(() => stripLocale(pathname), [pathname]);
}
