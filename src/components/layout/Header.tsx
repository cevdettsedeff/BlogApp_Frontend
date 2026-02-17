'use client';

import Link from 'next/link';
import { Menu, X, ChevronDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { LocaleSwitcher } from '@/components/layout/LocaleSwitcher';
import { useIsAuthenticated, useIsAdmin, useUser } from '@/stores/authStore';
import { useLogout } from '@/hooks/mutations/useAuth';
import { getInitials, cn } from '@/lib/utils';
import { addLocaleToPath } from '@/lib/i18n';
import { getMessages } from '@/lib/i18n-dict';
import { useLocale } from '@/hooks/useLocale';
import { startRouteLoading } from '@/components/layout/RouteLoading';
import { useCategories } from '@/hooks/queries/useCategories';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [overflowMenuOpen, setOverflowMenuOpen] = useState(false);
  const overflowMenuRef = useRef<HTMLDivElement | null>(null);
  const { locale, pathname: basePath } = useLocale();
  const messages = getMessages(locale);

  const isAuthenticated = useIsAuthenticated();
  const isAdmin = useIsAdmin();
  const user = useUser();
  const isAuthor = user?.role === 'Author' || user?.role === 'Admin';
  const logoutMutation = useLogout();
  const { data: categories = [] } = useCategories();
  const displayName = user?.displayName ?? user?.email ?? 'Kullanıcı';

  const categoryLinks = categories
    .filter((category) => category.slug)
    .map((category) => ({
      href: `/categories/${category.slug}`,
      label: category.name ?? category.slug ?? 'Kategori',
    }));

  const hasCategories = categoryLinks.length > 0;
  const maxCategoryLinks = 3;
  const slicedCategoryLinks = categoryLinks.slice(0, maxCategoryLinks);
  const overflowCategoryLinks = categoryLinks.slice(maxCategoryLinks);

  const navLinks = [
    { href: '/', label: messages.nav.home },
    ...(isAuthenticated ? [{ href: '/favorites', label: messages.auth.favorites }] : []),
    ...(hasCategories ? slicedCategoryLinks : []),
    { href: '/about', label: messages.nav.about },
  ];

  const localize = (href: string) => addLocaleToPath(href, locale);

  const handleLogout = () => {
    logoutMutation.mutate();
    setUserMenuOpen(false);
  };

  useEffect(() => {
    setOverflowMenuOpen(false);
  }, [basePath]);

  useEffect(() => {
    const onDocumentMouseDown = (event: MouseEvent) => {
      if (!overflowMenuRef.current) return;
      if (overflowMenuRef.current.contains(event.target as Node)) return;
      setOverflowMenuOpen(false);
    };

    document.addEventListener('mousedown', onDocumentMouseDown);
    return () => document.removeEventListener('mousedown', onDocumentMouseDown);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href={localize('/')} onClick={() => startRouteLoading(localize('/'))} className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <svg className="h-5 w-5 text-primary-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="text-xl font-bold">Bilgi Blogu</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={localize(link.href)}
              onClick={() => startRouteLoading(localize(link.href))}
              className={cn(
                'px-3 py-2 text-sm font-medium rounded-md transition-colors hover:text-blue-600',
                basePath === link.href || (link.href !== '/' && basePath.startsWith(link.href))
                  ? 'text-blue-600'
                  : 'text-muted-foreground'
              )}
            >
              {link.label}
            </Link>
          ))}

          {overflowCategoryLinks.length > 0 && (
            <div
              ref={overflowMenuRef}
              className="relative"
              onMouseEnter={() => setOverflowMenuOpen(true)}
              onMouseLeave={() => setOverflowMenuOpen(false)}
            >
              <button
                type="button"
                onClick={() => setOverflowMenuOpen((open) => !open)}
                className={cn(
                  'px-3 py-2 text-sm font-medium rounded-md transition-colors inline-flex items-center gap-1',
                  overflowMenuOpen ? 'text-blue-600' : 'text-muted-foreground hover:text-blue-600'
                )}
                aria-expanded={overflowMenuOpen}
                aria-haspopup="menu"
              >
                {locale === 'en' ? 'Others' : 'Diğer'}
                <ChevronDown className="h-4 w-4" />
              </button>

              {overflowMenuOpen && (
                <div className="absolute left-0 top-full z-20 pt-2">
                  <div className="w-48 rounded-lg border bg-popover p-1 shadow-lg">
                    {overflowCategoryLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={localize(link.href)}
                        onClick={() => {
                          startRouteLoading(localize(link.href));
                          setOverflowMenuOpen(false);
                        }}
                        className="block px-3 py-2 text-sm rounded-md hover:text-blue-600 text-muted-foreground"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <LocaleSwitcher />

          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 rounded-full border px-2 py-1.5 hover:border-blue-300 transition-colors"
              >
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                    {getInitials(displayName)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium hidden sm:block">{displayName.split(' ')[0]}</span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </button>

              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-56 rounded-lg border bg-popover p-1 shadow-lg z-20">
                    <div className="px-3 py-2 border-b mb-1">
                      <p className="text-sm font-medium">{displayName}</p>
                      <p className="text-xs text-muted-foreground">{user.email ?? ''}</p>
                    </div>

                    <Link
                      href={localize('/profile')}
                      onClick={() => {
                        startRouteLoading(localize('/profile'));
                        setUserMenuOpen(false);
                      }}
                      className="flex items-center px-3 py-2 text-sm hover:text-blue-600 rounded-md"
                    >
                      {messages.auth.profile}
                    </Link>

                    {isAuthor && (
                      <>
                        <div className="border-t my-1" />
                        <Link
                          href={localize(isAdmin ? '/admin' : '/author/posts')}
                          onClick={() => {
                            startRouteLoading(localize(isAdmin ? '/admin' : '/author/posts'));
                            setUserMenuOpen(false);
                          }}
                          className="flex items-center px-3 py-2 text-sm hover:text-blue-600 rounded-md"
                        >
                          {isAdmin ? messages.auth.admin : 'Yazar Paneli'}
                        </Link>
                      </>
                    )}

                    <div className="border-t my-1" />
                    <button
                      onClick={handleLogout}
                      disabled={logoutMutation.isPending}
                      className="flex w-full items-center px-3 py-2 text-sm hover:text-blue-600 rounded-md text-destructive"
                    >
                      {logoutMutation.isPending ? messages.auth.loggingOut : messages.auth.logout}
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Button asChild size="sm" className="hidden md:flex">
              <Link href={localize('/login')} onClick={() => startRouteLoading(localize('/login'))}>
                {messages.auth.login}
              </Link>
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <nav className="container py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={localize(link.href)}
                onClick={() => {
                  startRouteLoading(localize(link.href));
                  setMobileMenuOpen(false);
                }}
                className={cn(
                  'block px-3 py-2 text-sm font-medium rounded-md transition-colors',
                  basePath === link.href ? 'text-blue-600' : 'text-muted-foreground hover:text-blue-600'
                )}
              >
                {link.label}
              </Link>
            ))}

            {!isAuthenticated && (
              <div className="pt-4 border-t mt-4">
                <Button className="w-full" asChild>
                  <Link href={localize('/login')} onClick={() => startRouteLoading(localize('/login'))}>
                    {messages.auth.login}
                  </Link>
                </Button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
