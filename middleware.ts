import { NextResponse, type NextRequest } from 'next/server';
import { defaultLocale, isLocale, locales } from './src/lib/i18n';

const PUBLIC_FILE = /\.(.*)$/;

function getPreferredLocale(request: NextRequest) {
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value;
  if (isLocale(cookieLocale)) return cookieLocale;

  const header = request.headers.get('accept-language') || '';
  const preferred = header
    .split(',')
    .map((part) => part.split(';')[0]?.trim().toLowerCase())
    .find((lang) => isLocale(lang?.split('-')[0]));

  if (preferred) return preferred.split('-')[0];
  return defaultLocale;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname === '/favicon.ico' ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  const maybeLocale = pathname.split('/')[1];
  const pathnameHasLocale = isLocale(maybeLocale);

  if (!pathnameHasLocale) {
    const locale = getPreferredLocale(request);
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}${pathname}`;

    const response = NextResponse.redirect(url);
    response.cookies.set('NEXT_LOCALE', locale, { path: '/' });
    return response;
  }

  const locale = maybeLocale;
  const headers = new Headers(request.headers);
  headers.set('x-locale', locale);

  const response = NextResponse.next({ request: { headers } });
  response.cookies.set('NEXT_LOCALE', locale, { path: '/' });
  return response;
}

export const config = {
  matcher: ['/((?!_next|api).*)'],
};
