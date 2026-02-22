'use client';

import Link from 'next/link';
import {
  LayoutDashboard,
  FileText,
  FolderOpen,
  PenSquare,
  Users,
  MessageSquare,
  Inbox,
  Settings,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn, getInitials } from '@/lib/utils';
import { addLocaleToPath, defaultLocale, isLocale } from '@/lib/i18n';
import { startRouteLoading } from '@/components/layout/RouteLoading';
import { useAdminNotificationsStore } from '@/stores/adminNotificationsStore';

const sidebarLinks = [
  { href: '/admin', label: 'Ana Sayfa', icon: LayoutDashboard },
  { href: '/admin/posts', label: 'Yazılar', icon: FileText },
  { href: '/admin/categories', label: 'Kategoriler', icon: FolderOpen },
  { href: '/admin/users', label: 'Kullanıcılar', icon: Users },
  { href: '/admin/authors', label: 'Yazarlar', icon: PenSquare },
  { href: '/admin/comments', label: 'Yorumlar', icon: MessageSquare },
  { href: '/admin/support-requests', label: 'Kullanıcı Talepleri', icon: Inbox },
  { href: '/admin/settings', label: 'Ayarlar', icon: Settings },
];

interface AdminSidebarProps {
  locale: string;
  basePath: string;
  sidebarOpen: boolean;
  onToggle: () => void;
  user: { displayName?: string | null } | null;
}

export function AdminSidebar({
  locale,
  basePath,
  sidebarOpen,
  onToggle,
  user,
}: AdminSidebarProps) {
  const resolvedLocale = isLocale(locale) ? locale : defaultLocale;
  const supportRequestsUnread = useAdminNotificationsStore((s) => s.supportRequestsUnread);
  const commentsUnread = useAdminNotificationsStore((s) => s.commentsUnread);
  const usersUnread = useAdminNotificationsStore((s) => s.usersUnread);

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
              const isSupportRequestsLink = link.href === '/admin/support-requests';
              const isCommentsLink = link.href === '/admin/comments';
              const isUsersLink = link.href === '/admin/users' || link.href === '/admin/authors';
              const unreadCount = isSupportRequestsLink
                ? supportRequestsUnread
                : isCommentsLink
                  ? commentsUnread
                  : isUsersLink
                    ? usersUnread
                  : 0;
              const unreadCountLabel = unreadCount > 99 ? '99+' : unreadCount.toString();

              return (
                <Link
                  key={link.href}
                  href={addLocaleToPath(link.href, resolvedLocale)}
                  onClick={() => startRouteLoading(addLocaleToPath(link.href, resolvedLocale))}
                  className={cn(
                    'relative flex items-center gap-3 rounded-lg text-sm font-medium transition-colors',
                    sidebarOpen ? 'px-3 py-2.5' : 'px-2.5 py-2.5 justify-center',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {sidebarOpen && <span className="truncate">{link.label}</span>}
                  {(isSupportRequestsLink || isCommentsLink || isUsersLink) && unreadCount > 0 && (
                    sidebarOpen ? (
                      <span className="ml-auto rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary">
                        {unreadCountLabel}
                      </span>
                    ) : (
                      <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-primary" />
                    )
                  )}
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
        aria-label={sidebarOpen ? 'Menüyü daralt' : 'Menüyü genişlet'}
        title={sidebarOpen ? 'Menüyü daralt' : 'Menüyü genişlet'}
      >
        <span className="flex h-9 w-9 items-center justify-center text-lg font-semibold rounded-full shadow-[inset_0_0_0_1px_rgba(255,255,255,0.25)]">
          {sidebarOpen ? '<' : '>'}
        </span>
      </button>
    </>
  );
}

