'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAdminUsers } from '@/hooks/queries';
import { useAdminNotificationsStore } from '@/stores/adminNotificationsStore';
import { formatDate, formatDateTime, getInitials } from '@/lib/utils';

const PAGE_SIZE = 10;

interface AdminUsersListPageProps {
  title: string;
  subtitle: string;
  fixedRole?: 'Admin' | 'Author' | 'User';
}

export function AdminUsersListPage({ title, subtitle, fixedRole }: AdminUsersListPageProps) {
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState('');
  const [role, setRole] = useState<'All' | 'Admin' | 'Author' | 'User'>(fixedRole ?? 'All');
  const clearUsersUnread = useAdminNotificationsStore((s) => s.clearUsersUnread);

  useEffect(() => {
    if (fixedRole) {
      setRole(fixedRole);
    }
  }, [fixedRole]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      clearUsersUnread();
    }, 3000);
    return () => window.clearTimeout(timer);
  }, [clearUsersUnread]);

  const effectiveRole = fixedRole ?? (role === 'All' ? undefined : role);
  const { data, isLoading } = useAdminUsers(page, PAGE_SIZE, query, effectiveRole);

  const items = useMemo(() => data?.items ?? [], [data?.items]);
  const totalCount = data?.totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-muted-foreground">{subtitle}</p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-lg border p-3">
          <p className="text-xs text-muted-foreground">Toplam</p>
          <p className="text-lg font-semibold">{totalCount}</p>
        </div>
        <div className="rounded-lg border p-3">
          <p className="text-xs text-muted-foreground">Bu Sayfada</p>
          <p className="text-lg font-semibold">{items.length}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Kullanıcı ara..."
            className="pl-10"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
          />
        </div>

        {!fixedRole && (
          <select
            className="h-10 rounded-md border bg-background px-3 text-sm"
            value={role}
            onChange={(event) => {
              setRole(event.target.value as 'All' | 'Admin' | 'Author' | 'User');
              setPage(1);
            }}
          >
            <option value="All">Tüm Roller</option>
            <option value="Admin">Admin</option>
            <option value="Author">Yazar</option>
            <option value="User">Kullanıcı</option>
          </select>
        )}
      </div>

      {isLoading ? (
        <div className="rounded-lg border p-6 text-center text-sm text-muted-foreground">Yükleniyor...</div>
      ) : items.length === 0 ? (
        <div className="rounded-lg border p-6 text-center text-sm text-muted-foreground">Kayıt bulunamadı.</div>
      ) : (
        <div className="space-y-3">
          {items.map((user) => (
            <article key={user.id} className="rounded-xl border bg-card p-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="font-medium truncate">{user.displayName}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {user.role === 'Author' ? 'Yazar' : user.role === 'User' ? 'Kullanıcı' : 'Admin'}
                  </Badge>
                  <Badge variant={user.status === 'Active' ? 'secondary' : 'destructive'}>
                    {user.status === 'Active' ? 'Aktif' : 'Engelli'}
                  </Badge>
                </div>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">Kayıt: {formatDate(user.createdAt)}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                <span className="text-muted-foreground">
                  Son giriş:{' '}
                  <span className="text-foreground">
                    {user.lastLoginAt ? formatDateTime(user.lastLoginAt) : 'Henüz yok'}
                  </span>
                </span>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">
                  2FA:{' '}
                  <span className={user.twoFactorEnabled ? 'text-green-600' : 'text-muted-foreground'}>
                    {user.twoFactorEnabled ? 'Açık' : 'Kapalı'}
                  </span>
                </span>
              </div>
            </article>
          ))}
        </div>
      )}

      <div className="flex items-center justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage((prev) => Math.max(1, prev - 1))}
          disabled={page <= 1}
        >
          Önceki
        </Button>
        <span className="text-sm text-muted-foreground">
          Sayfa {page} / {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
          disabled={page >= totalPages}
        >
          Sonraki
        </Button>
      </div>
    </div>
  );
}
