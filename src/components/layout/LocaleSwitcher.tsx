'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { locales, getLocalizedPath } from '@/lib/i18n';
import { useLocale } from '@/hooks/useLocale';
import { cn } from '@/lib/utils';

export function LocaleSwitcher() {
  const pathname = usePathname();
  const { locale } = useLocale();

  return (
    <div className="flex items-center rounded-full border p-0.5">
      {locales.map((lng) => (
        <Link
          key={lng}
          href={getLocalizedPath(pathname, lng)}
          className={cn(
            'px-2 py-1 text-xs font-semibold rounded-full transition-colors',
            lng === locale ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
          )}
          aria-current={lng === locale ? 'page' : undefined}
        >
          {lng.toUpperCase()}
        </Link>
      ))}
    </div>
  );
}
