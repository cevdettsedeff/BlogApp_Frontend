'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Search, Ban, Check, Pencil, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { formatDate, getInitials } from '@/lib/utils';

// Static data
const initialUsers = [
  {
    id: '1',
    displayName: 'Berna Selin Sedef',
    email: 'bernaselin@example.com',
    role: 'Admin',
    status: 'Active',
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    displayName: 'Ahmet Yılmaz',
    email: 'ahmet@example.com',
    role: 'User',
    status: 'Active',
    createdAt: '2024-02-20T14:30:00Z',
  },
  {
    id: '3',
    displayName: 'Mehmet Kaya',
    email: 'mehmet@example.com',
    role: 'Author',
    status: 'Banned',
    createdAt: '2024-03-10T09:00:00Z',
  },
];

type UserRole = 'Admin' | 'Author' | 'User';
type UserStatus = 'Active' | 'Banned';

type UserItem = {
  id: string;
  displayName: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
};

type SortKey = 'displayName' | 'role' | 'status' | 'createdAt';
type SortDir = 'asc' | 'desc';

const DEFAULT_PAGE_SIZE = 5;
const DEFAULT_SORT_KEY: SortKey = 'createdAt';
const DEFAULT_SORT_DIR: SortDir = 'desc';

const isSortKey = (value: string | null): value is SortKey => {
  return value === 'displayName' || value === 'role' || value === 'status' || value === 'createdAt';
};

const isSortDir = (value: string | null): value is SortDir => value === 'asc' || value === 'desc';

const getPageItems = (current: number, total: number) => {
  const items: Array<number | 'ellipsis'> = [];
  if (total <= 7) {
    for (let i = 1; i <= total; i += 1) items.push(i);
    return items;
  }
  items.push(1);
  const left = Math.max(2, current - 1);
  const right = Math.min(total - 1, current + 1);
  if (left > 2) items.push('ellipsis');
  for (let i = left; i <= right; i += 1) items.push(i);
  if (right < total - 1) items.push('ellipsis');
  items.push(total);
  return items;
};

export default function AdminUsersPage() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [users, setUsers] = useState<UserItem[]>(() => initialUsers);
  const [query, setQuery] = useState(() => searchParams.get('q') ?? '');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'All'>(() => {
    const raw = searchParams.get('role');
    if (raw === 'Admin' || raw === 'Author' || raw === 'User') return raw;
    return 'All';
  });
  const [statusFilter, setStatusFilter] = useState<UserStatus | 'All'>(() => {
    const raw = searchParams.get('status');
    if (raw === 'Active' || raw === 'Banned') return raw;
    return 'All';
  });
  const [editOpen, setEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<UserItem | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>(() => {
    const raw = searchParams.get('sort');
    return isSortKey(raw) ? raw : DEFAULT_SORT_KEY;
  });
  const [sortDir, setSortDir] = useState<SortDir>(() => {
    const raw = searchParams.get('dir');
    return isSortDir(raw) ? raw : DEFAULT_SORT_DIR;
  });
  const [page, setPage] = useState(() => {
    const raw = Number(searchParams.get('page'));
    return Number.isFinite(raw) && raw > 0 ? raw : 1;
  });
  const [pageSize, setPageSize] = useState(() => {
    const raw = Number(searchParams.get('pageSize'));
    return Number.isFinite(raw) && raw > 0 ? raw : DEFAULT_PAGE_SIZE;
  });

  useEffect(() => {
    const nextQuery = searchParams.get('q') ?? '';
    const nextRole = (() => {
      const raw = searchParams.get('role');
      if (raw === 'Admin' || raw === 'Author' || raw === 'User') return raw;
      return 'All';
    })();
    const nextStatus = (() => {
      const raw = searchParams.get('status');
      if (raw === 'Active' || raw === 'Banned') return raw;
      return 'All';
    })();
    const nextSort = isSortKey(searchParams.get('sort')) ? (searchParams.get('sort') as SortKey) : DEFAULT_SORT_KEY;
    const nextDir = isSortDir(searchParams.get('dir')) ? (searchParams.get('dir') as SortDir) : DEFAULT_SORT_DIR;
    const nextPageRaw = Number(searchParams.get('page'));
    const nextPage = Number.isFinite(nextPageRaw) && nextPageRaw > 0 ? nextPageRaw : 1;
    const nextPageSizeRaw = Number(searchParams.get('pageSize'));
    const nextPageSize = Number.isFinite(nextPageSizeRaw) && nextPageSizeRaw > 0 ? nextPageSizeRaw : DEFAULT_PAGE_SIZE;

    if (nextQuery !== query) setQuery(nextQuery);
    if (nextRole !== roleFilter) setRoleFilter(nextRole);
    if (nextStatus !== statusFilter) setStatusFilter(nextStatus);
    if (nextSort !== sortKey) setSortKey(nextSort);
    if (nextDir !== sortDir) setSortDir(nextDir);
    if (nextPage !== page) setPage(nextPage);
    if (nextPageSize !== pageSize) setPageSize(nextPageSize);
  }, [searchParams, query, roleFilter, statusFilter, sortKey, sortDir, page, pageSize]);

  const updateQuery = (updates: Record<string, string | number | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === '' || value === null) {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const filteredUsers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return users.filter((user) => {
      if (roleFilter !== 'All' && user.role !== roleFilter) return false;
      if (statusFilter !== 'All' && user.status !== statusFilter) return false;
      if (!normalizedQuery) return true;

      return (
        user.displayName.toLowerCase().includes(normalizedQuery) ||
        user.email.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [users, query, roleFilter, statusFilter]);

  const sortedUsers = useMemo(() => {
    const sorted = [...filteredUsers];
    sorted.sort((a, b) => {
      const valueA = a[sortKey];
      const valueB = b[sortKey];
      if (sortKey === 'createdAt') {
        const timeA = new Date(valueA).getTime();
        const timeB = new Date(valueB).getTime();
        return sortDir === 'asc' ? timeA - timeB : timeB - timeA;
      }
      return sortDir === 'asc'
        ? String(valueA).localeCompare(String(valueB))
        : String(valueB).localeCompare(String(valueA));
    });
    return sorted;
  }, [filteredUsers, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sortedUsers.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedUsers.slice(start, start + pageSize);
  }, [sortedUsers, currentPage, pageSize]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
      updateQuery({ page: totalPages });
    }
  }, [page, totalPages]);

  const updateRole = (id: string, role: UserRole) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)));
  };

  const toggleBan = (id: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, status: u.status === 'Active' ? 'Banned' : 'Active' } : u
      )
    );
  };

  const removeUser = (id: string) => {
    const target = users.find((u) => u.id === id);
    const label = target ? `${target.displayName} (${target.email})` : 'bu kullanıcıyı';
    const confirmed = window.confirm(`${label} silinsin mi?`);
    if (!confirmed) return;
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  const openEdit = (user: UserItem) => {
    setEditTarget(user);
    setEditOpen(true);
  };

  const saveEdit = () => {
    if (!editTarget) return;
    setUsers((prev) => prev.map((u) => (u.id === editTarget.id ? editTarget : u)));
    setEditOpen(false);
  };

  const onSort = (key: SortKey) => {
    if (key === sortKey) {
      const nextDir = sortDir === 'asc' ? 'desc' : 'asc';
      setSortDir(nextDir);
      setPage(1);
      updateQuery({ sort: key, dir: nextDir, page: 1 });
      return;
    }
    setSortKey(key);
    setSortDir('asc');
    setPage(1);
    updateQuery({ sort: key, dir: 'asc', page: 1 });
  };

  const renderSortIcon = (key: SortKey) => {
    if (key !== sortKey) return null;
    return sortDir === 'asc' ? (
      <ChevronUp className="h-3.5 w-3.5" />
    ) : (
      <ChevronDown className="h-3.5 w-3.5" />
    );
  };

  const pageItems = getPageItems(currentPage, totalPages);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Kullanıcılar</h1>
        <p className="text-muted-foreground">Tüm kullanıcıları yönetin</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Kullanıcı ara..."
            className="pl-10"
            value={query}
            onChange={(event) => {
              const value = event.target.value;
              setQuery(value);
              setPage(1);
              updateQuery({ q: value, page: 1 });
            }}
          />
        </div>
        <select
          className="h-10 rounded-md border bg-background px-3 text-sm"
          value={roleFilter}
          onChange={(event) => {
            const value = event.target.value === 'All' ? 'All' : (event.target.value as UserRole);
            setRoleFilter(value);
            setPage(1);
            updateQuery({ role: value === 'All' ? '' : value, page: 1 });
          }}
        >
          <option value="All">Tüm Roller</option>
          <option value="Admin">Admin</option>
          <option value="Author">Yazar</option>
          <option value="User">Kullanıcı</option>
        </select>
        <select
          className="h-10 rounded-md border bg-background px-3 text-sm"
          value={statusFilter}
          onChange={(event) => {
            const value = event.target.value === 'All' ? 'All' : (event.target.value as UserStatus);
            setStatusFilter(value);
            setPage(1);
            updateQuery({ status: value === 'All' ? '' : value, page: 1 });
          }}
        >
          <option value="All">Tüm Durumlar</option>
          <option value="Active">Aktif</option>
          <option value="Banned">Engelli</option>
        </select>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium">
                <button
                  type="button"
                  className="inline-flex items-center gap-1"
                  onClick={() => onSort('displayName')}
                >
                  Kullanıcı
                  {renderSortIcon('displayName')}
                </button>
              </th>
              <th className="text-left px-4 py-3 text-sm font-medium">
                <button
                  type="button"
                  className="inline-flex items-center gap-1"
                  onClick={() => onSort('role')}
                >
                  Rol
                  {renderSortIcon('role')}
                </button>
              </th>
              <th className="text-left px-4 py-3 text-sm font-medium">
                <button
                  type="button"
                  className="inline-flex items-center gap-1"
                  onClick={() => onSort('status')}
                >
                  Durum
                  {renderSortIcon('status')}
                </button>
              </th>
              <th className="text-left px-4 py-3 text-sm font-medium">
                <button
                  type="button"
                  className="inline-flex items-center gap-1"
                  onClick={() => onSort('createdAt')}
                >
                  Kayıt Tarihi
                  {renderSortIcon('createdAt')}
                </button>
              </th>
              <th className="text-right px-4 py-3 text-sm font-medium">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {pagedUsers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-sm text-muted-foreground">
                  Eşleşen kullanıcı bulunamadı.
                </td>
              </tr>
            ) : (
              pagedUsers.map((user) => (
                <tr key={user.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.displayName}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      className="h-8 rounded-md border bg-background px-2 text-xs"
                      value={user.role}
                      onChange={(event) => updateRole(user.id, event.target.value as UserRole)}
                    >
                      <option value="Admin">Admin</option>
                      <option value="Author">Yazar</option>
                      <option value="User">Kullanıcı</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={user.status === 'Active' ? 'secondary' : 'destructive'}
                      className={user.status === 'Active' ? 'bg-green-500 text-white' : ''}
                    >
                      {user.status === 'Active' ? 'Aktif' : 'Engelli'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openEdit(user)}
                        aria-label="Düzenle"
                        title="Düzenle"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => toggleBan(user.id)}
                        aria-label={user.status === 'Active' ? 'Engelle' : 'Engeli kaldır'}
                        title={user.status === 'Active' ? 'Engelle' : 'Engeli kaldır'}
                      >
                        <Ban className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => removeUser(user.id)}
                        aria-label="Sil"
                        title="Sil"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
        <div className="text-muted-foreground">Toplam {sortedUsers.length} kullanıcı</div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2">
            <span className="text-muted-foreground">Sayfa boyutu</span>
            <select
              className="h-8 rounded-md border bg-background px-2 text-xs"
              value={pageSize}
              onChange={(event) => {
                const next = Number(event.target.value);
                setPageSize(next);
                setPage(1);
                updateQuery({ pageSize: next, page: 1 });
              }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
          </label>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              className="h-8"
              onClick={() => {
                const next = Math.max(1, currentPage - 1);
                setPage(next);
                updateQuery({ page: next });
              }}
              disabled={currentPage === 1}
            >
              Önceki
            </Button>
            {pageItems.map((item, index) =>
              item === 'ellipsis' ? (
                <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">
                  …
                </span>
              ) : (
                <Button
                  key={item}
                  variant={item === currentPage ? 'default' : 'outline'}
                  size="sm"
                  className="h-8 w-9"
                  onClick={() => {
                    setPage(item);
                    updateQuery({ page: item });
                  }}
                >
                  {item}
                </Button>
              )
            )}
            <Button
              variant="outline"
              size="sm"
              className="h-8"
              onClick={() => {
                const next = Math.min(totalPages, currentPage + 1);
                setPage(next);
                updateQuery({ page: next });
              }}
              disabled={currentPage === totalPages}
            >
              Sonraki
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Kullanıcıyı Düzenle</DialogTitle>
          </DialogHeader>
          {editTarget && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="editName">Ad Soyad</Label>
                <Input
                  id="editName"
                  className="mt-1.5"
                  value={editTarget.displayName}
                  onChange={(e) => setEditTarget({ ...editTarget, displayName: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="editEmail">E-posta</Label>
                <Input
                  id="editEmail"
                  className="mt-1.5"
                  value={editTarget.email}
                  onChange={(e) => setEditTarget({ ...editTarget, email: e.target.value })}
                />
              </div>
              <div>
                <Label>Rol</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(['Admin', 'Author', 'User'] as UserRole[]).map((role) => (
                    <Button
                      key={role}
                      type="button"
                      variant={editTarget.role === role ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setEditTarget({ ...editTarget, role })}
                    >
                      {role === 'Author' ? 'Yazar' : role === 'User' ? 'Kullanıcı' : 'Admin'}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <Label htmlFor="editStatus">Durum</Label>
                <select
                  id="editStatus"
                  className="mt-1.5 h-10 w-full rounded-md border bg-background px-3 text-sm"
                  value={editTarget.status}
                  onChange={(e) => setEditTarget({ ...editTarget, status: e.target.value as UserStatus })}
                >
                  <option value="Active">Aktif</option>
                  <option value="Banned">Engelli</option>
                </select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Vazgeç
            </Button>
            <Button onClick={saveEdit}>
              <Check className="h-4 w-4 mr-1" />
              Kaydet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
