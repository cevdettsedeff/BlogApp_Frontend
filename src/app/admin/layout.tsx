'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode, type CSSProperties } from 'react';
import { ChevronDown } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useIsAuthenticated, useIsAdmin, useAuthLoading, useUser } from '@/stores/authStore';
import { getInitials } from '@/lib/utils';
import { useLocale } from '@/hooks/useLocale';
import { addLocaleToPath } from '@/lib/i18n';
import { RouteLoading, startRouteLoading } from '@/components/layout/RouteLoading';
import { useLogout } from '@/hooks/mutations/useAuth';
import { getMessages } from '@/lib/i18n-dict';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminLiveViewNotifications } from '@/components/admin/AdminLiveViewNotifications';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const { locale, pathname: basePath } = useLocale();
  const messages = getMessages(locale);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const isAuthenticated = useIsAuthenticated();
  const isAdmin = useIsAdmin();
  const isLoading = useAuthLoading();
  const user = useUser();
  const logoutMutation = useLogout();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) {
      router.push(addLocaleToPath('/login', locale));
    }
  }, [isAuthenticated, isAdmin, isLoading, router, locale]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <div
      className="min-h-screen bg-background relative"
      style={
        {
          '--sidebar-width': sidebarOpen ? '16rem' : '4rem',
          '--content-left': '16rem',
        } as CSSProperties
      }
    >
      <div className="pointer-events-none absolute left-0 right-0 top-16 z-20 h-px bg-border/40" />
      {/* Sidebar */}
      <AdminSidebar
        locale={locale}
        basePath={basePath}
        sidebarOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((open) => !open)}
        user={user}
      />

      {/* Main Content */}
      <div className="flex min-h-screen flex-col" style={{ paddingLeft: 'var(--content-left)' }}>
        {/* Top Header */}
        <header className="sticky top-0 z-30 h-16 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-full items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/admin" className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <svg className="h-5 w-5 text-primary-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                </div>
                <span className="text-xl font-bold">Bilgi Blogu</span>
              </Link>
            </div>

            <div className="flex items-center gap-4">
              <Link
                href={addLocaleToPath('/', locale)}
                onClick={() => startRouteLoading(addLocaleToPath('/', locale))}
                className="text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Siteyi Gör
              </Link>
              <AdminLiveViewNotifications />
              <ThemeToggle />
              <div className="relative">
                <button
                  className="flex items-center gap-2"
                  onClick={() => setUserMenuOpen((open) => !open)}
                >
                    <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                      {user ? getInitials(user.displayName ?? user.email ?? 'Admin') : 'A'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium hidden md:block">
                    {user?.displayName?.split(' ')[0] || 'Admin'}
                  </span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </button>

                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 rounded-lg border bg-popover p-1 shadow-lg z-20">
                      <div className="px-3 py-2 border-b mb-1">
                        <p className="text-sm font-medium">{user?.displayName || 'Admin'}</p>
                        <p className="text-xs text-muted-foreground">{user?.email || 'admin@admin.com.tr'}</p>
                      </div>
                      <Link
                        href={addLocaleToPath('/profile', locale)}
                        onClick={() => {
                          startRouteLoading(addLocaleToPath('/profile', locale));
                          setUserMenuOpen(false);
                        }}
                        className="flex items-center px-3 py-2 text-sm hover:bg-accent rounded-md"
                      >
                        {messages.auth.profile}
                      </Link>
                      <Link
                        href={addLocaleToPath('/favorites', locale)}
                        onClick={() => {
                          startRouteLoading(addLocaleToPath('/favorites', locale));
                          setUserMenuOpen(false);
                        }}
                        className="flex items-center px-3 py-2 text-sm hover:bg-accent rounded-md"
                      >
                        {messages.auth.favorites}
                      </Link>
                      {isAdmin && (
                        <>
                          <div className="my-1 border-t" />
                          <Link
                            href={addLocaleToPath('/', locale)}
                            onClick={() => {
                              startRouteLoading(addLocaleToPath('/', locale));
                              setUserMenuOpen(false);
                            }}
                            className="flex items-center px-3 py-2 text-sm hover:bg-accent rounded-md"
                          >
                            Siteyi Gör
                          </Link>
                        </>
                      )}
                      <div className="my-1 border-t" />
                      <button
                        onClick={() => {
                          logoutMutation.mutate();
                          setUserMenuOpen(false);
                        }}
                        disabled={logoutMutation.isPending}
                        className="flex w-full items-center px-3 py-2 text-sm hover:bg-accent rounded-md text-destructive"
                      >
                        {logoutMutation.isPending ? messages.auth.loggingOut : messages.auth.logout}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="relative flex-1 overflow-auto py-6">
          <div className="relative container">
            <div className="route-fade">
              {children}
            </div>
          </div>
        </main>
      </div>
      <RouteLoading variant="skeleton" />
    </div>
  );
}
