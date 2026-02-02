export const locales = ['tr', 'en'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'tr';

export function isLocale(value?: string | null): value is Locale {
  return value === 'tr' || value === 'en';
}

export function stripLocale(pathname: string): { locale: Locale; pathname: string } {
  const parts = pathname.split('/');
  const maybeLocale = parts[1];

  if (isLocale(maybeLocale)) {
    const rest = `/${parts.slice(2).join('/')}`;
    return {
      locale: maybeLocale,
      pathname: rest === '/' ? '/' : rest.replace(/\/+$/, ''),
    };
  }

  return { locale: defaultLocale, pathname: pathname || '/' };
}

export function addLocaleToPath(pathname: string, locale: Locale): string {
  if (!pathname.startsWith('/')) return pathname;
  if (pathname === '/') return `/${locale}`;
  return `/${locale}${pathname}`;
}

export function getLocalizedPath(pathname: string, locale: Locale): string {
  const base = stripLocale(pathname).pathname;
  return addLocaleToPath(base, locale);
}
