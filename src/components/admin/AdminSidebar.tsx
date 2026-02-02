'use client';

import Link from 'next/link';
import {
  LayoutDashboard,
  FileText,
  FolderOpen,
  Users,
  MessageSquare,
  Settings,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn, getInitials } from '@/lib/utils';
import { addLocaleToPath } from '@/lib/i18n';
import { startRouteLoading } from '@/components/layout/RouteLoading';

const sidebarLinks = [
  { href: '/admin', label: 'Ana Sayfa', icon: LayoutDashboard },
  { href: '/admin/posts', label: 'Yazılar', icon: FileText },
  { href: '/admin/categories', label: 'Kategoriler', icon: FolderOpen },
  { href: '/admin/users', label: 'Kullanıcılar', icon: Users },
  { href: '/admin/comments', label: 'Yorumlar', icon: MessageSquare },
  { href: '/admin/settings', label: 'Ayarlar', icon: Settings },
];

interface AdminSidebarProps {
  locale: string;
  basePath: string;
  sidebarOpen: boolean;
  onToggle: () => void;
  user: { displayName?: string } | null;
}

export function AdminSidebar({
  locale,
  basePath,
  sidebarOpen,
  onToggle,
  user,
}: AdminSidebarProps) {
  return (
    <>
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen bg-sidebar flex flex-col transition-all duration-200 border-r border-border/40',
          sidebarOpen ? 'w-64' : 'w-16'
        )}
      >

        <div className={cn('h-16', sidebarOpen ? 'px-4' : 'px-3')}>
          <div className={cn('flex h-full items-center', sidebarOpen ? 'gap-3' : 'justify-center')}>
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {user ? getInitials(user.displayName || 'Admin') : 'A'}
              </AvatarFallback>
            </Avatar>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.displayName || 'Admin'}</p>
                <p className="text-xs text-muted-foreground">Admin</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1">
          <nav className={cn('space-y-1', sidebarOpen ? 'p-4' : 'p-2')}>
            {sidebarLinks.map((link) => {
              const Icon = link.icon;
              const isActive =
                basePath === link.href ||
                (link.href !== '/admin' && basePath.startsWith(link.href));

              return (
                <Link
                  key={link.href}
                  href={addLocaleToPath(link.href, locale)}
                  onClick={() => startRouteLoading(addLocaleToPath(link.href, locale))}
                  className={cn(
                    'flex items-center gap-3 rounded-lg text-sm font-medium transition-colors',
                    sidebarOpen ? 'px-3 py-2.5' : 'px-2.5 py-2.5 justify-center',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {sidebarOpen && link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      <button
        type="button"
        onClick={onToggle}
        className="fixed top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 rounded-full border border-border bg-background/80 text-muted-foreground shadow-md backdrop-blur transition-all hover:text-foreground hover:shadow-lg"
        style={{ left: 'var(--sidebar-width)' }}
        aria-label={sidebarOpen ? 'Menuyu daralt' : 'Menuyu genislet'}
        title={sidebarOpen ? 'Menuyu daralt' : 'Menuyu genislet'}
      >
        <span className="flex h-9 w-9 items-center justify-center text-lg font-semibold rounded-full shadow-[inset_0_0_0_1px_rgba(255,255,255,0.25)]">
          {sidebarOpen ? '<' : '>'}
        </span>
      </button>
    </>
  );
}
