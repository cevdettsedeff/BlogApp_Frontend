import { cookies, headers } from 'next/headers';
import { defaultLocale, isLocale, type Locale } from './i18n';

export function getLocaleFromRequest(): Locale {
  const headerLocale = headers().get('x-locale');
  if (isLocale(headerLocale)) return headerLocale;

  const value = cookies().get('NEXT_LOCALE')?.value;
  return isLocale(value) ? value : defaultLocale;
}
