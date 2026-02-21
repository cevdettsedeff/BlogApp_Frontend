'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Plus, Search, Edit, Trash2, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useLocale } from '@/hooks/useLocale';
import { addLocaleToPath } from '@/lib/i18n';
import { getMessages } from '@/lib/i18n-dict';
import { formatDate } from '@/lib/utils';
import { authorPostService } from '@/lib/api/services/authorPostService';
import { adminCategoryService } from '@/lib/api/services/adminCategoryService';
import { adminPostService } from '@/lib/api/services/adminPostService';
import type { AuthorPostListItemDto, CategoryDto } from '@/types';

type SortKey = 'title' | 'categoryName' | 'status' | 'createdAt';
type SortDir = 'asc' | 'desc';

const DEFAULT_PAGE_SIZE = 5;
const DEFAULT_SORT_KEY: SortKey = 'createdAt';
const DEFAULT_SORT_DIR: SortDir = 'desc';

const isSortKey = (value: string | null): value is SortKey => {
  return value === 'title' || value === 'categoryName' || value === 'status' || value === 'createdAt';
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

export default function AuthorPostsPage() {
  const { locale } = useLocale();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const messages = getMessages(locale);
  const t = messages.adminPosts;
  const queryClient = useQueryClient();

  const [search, setSearch] = useState(() => searchParams.get('q') ?? '');
  const [categoryFilter, setCategoryFilter] = useState(() => searchParams.get('category') ?? '');
  const [statusFilter, setStatusFilter] = useState(() => searchParams.get('status') ?? '');
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
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
    const nextSearch = searchParams.get('q') ?? '';
    const nextCategory = searchParams.get('category') ?? '';
    const nextStatus = searchParams.get('status') ?? '';
    const nextSort = isSortKey(searchParams.get('sort')) ? (searchParams.get('sort') as SortKey) : DEFAULT_SORT_KEY;
    const nextDir = isSortDir(searchParams.get('dir')) ? (searchParams.get('dir') as SortDir) : DEFAULT_SORT_DIR;
    const nextPageRaw = Number(searchParams.get('page'));
    const nextPage = Number.isFinite(nextPageRaw) && nextPageRaw > 0 ? nextPageRaw : 1;
    const nextPageSizeRaw = Number(searchParams.get('pageSize'));
    const nextPageSize = Number.isFinite(nextPageSizeRaw) && nextPageSizeRaw > 0 ? nextPageSizeRaw : DEFAULT_PAGE_SIZE;

    if (nextSearch !== search) setSearch(nextSearch);
    if (nextCategory !== categoryFilter) setCategoryFilter(nextCategory);
    if (nextStatus !== statusFilter) setStatusFilter(nextStatus);
    if (nextSort !== sortKey) setSortKey(nextSort);
    if (nextDir !== sortDir) setSortDir(nextDir);
    if (nextPage !== page) setPage(nextPage);
    if (nextPageSize !== pageSize) setPageSize(nextPageSize);
  }, [searchParams, search, categoryFilter, statusFilter, sortKey, sortDir, page, pageSize]);

  const updateQuery = useCallback((updates: Record<string, string | number | undefined>) => {
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
  }, [searchParams, router, pathname]);

  const { data: categories = [] } = useQuery({
    queryKey: ['admin-categories', locale],
    queryFn: () => adminCategoryService.list(locale),
    staleTime: 5 * 60 * 1000,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['author-posts', locale, { search, categoryFilter, statusFilter, page, pageSize }],
    queryFn: () =>
      authorPostService.list(locale, {
        q: search || undefined,
        categorySlug: categoryFilter || undefined,
        status: statusFilter || undefined,
        page,
        pageSize,
      }),
    placeholderData: keepPreviousData,
  });

  const posts = useMemo(() => data?.items ?? [], [data?.items]);
  const totalCount = data?.totalCount ?? posts.length;

  const sortedPosts = useMemo(() => {
    const sorted = [...posts];
    sorted.sort((a, b) => {
      const valueA = a[sortKey];
      const valueB = b[sortKey];
      if (sortKey === 'createdAt') {
        const timeA = new Date(valueA || 0).getTime();
        const timeB = new Date(valueB || 0).getTime();
        return sortDir === 'asc' ? timeA - timeB : timeB - timeA;
      }
      return sortDir === 'asc'
        ? String(valueA).localeCompare(String(valueB))
        : String(valueB).localeCompare(String(valueA));
    });
    return sorted;
  }, [posts, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagedPosts = sortedPosts;

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
      updateQuery({ page: totalPages });
    }
  }, [page, totalPages, updateQuery]);

  const localizedPath = (href: string) => addLocaleToPath(href, locale);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminPostService.delete(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['author-posts'] });
    },
  });

  const deleteTarget = useMemo(
    () => posts.find((post) => post.id === deleteTargetId) ?? null,
    [posts, deleteTargetId]
  );

  const confirmDelete = () => {
    if (!deleteTargetId) return;
    deleteMutation.mutate(deleteTargetId);
    setDeleteTargetId(null);
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Yazılar</h1>
          <p className="text-muted-foreground">Kendi yazılarını yönet</p>
        </div>
        <Button asChild>
          <Link href={localizedPath('/author/posts/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Yeni Yazı
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Yazı ara..."
            className="pl-10"
            value={search}
            onChange={(event) => {
              const value = event.target.value;
              setSearch(value);
              setPage(1);
              updateQuery({ q: value, page: 1 });
            }}
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <select
            className="h-10 rounded-md border bg-background px-3 text-sm"
            value={categoryFilter}
            onChange={(event) => {
              const value = event.target.value;
              setCategoryFilter(value);
              setPage(1);
              updateQuery({ category: value, page: 1 });
            }}
          >
            <option value="">{t.allCategories}</option>
            {categories.map((category: CategoryDto) => (
              <option key={category.id} value={category.slug ?? ''}>
                {category.name}
              </option>
            ))}
          </select>
          <select
            className="h-10 rounded-md border bg-background px-3 text-sm"
            value={statusFilter}
            onChange={(event) => {
              const value = event.target.value;
              setStatusFilter(value);
              setPage(1);
              updateQuery({ status: value, page: 1 });
            }}
          >
            <option value="">{t.allStatuses}</option>
            <option value="Published">{t.statusPublished}</option>
            <option value="Draft">{t.statusDraft}</option>
          </select>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium">
                <button
                  type="button"
                  className="inline-flex items-center gap-1"
                  onClick={() => onSort('title')}
                >
                  Başlık
                  {renderSortIcon('title')}
                </button>
              </th>
              <th className="text-left px-4 py-3 text-sm font-medium">
                <button
                  type="button"
                  className="inline-flex items-center gap-1"
                  onClick={() => onSort('categoryName')}
                >
                  Kategori
                  {renderSortIcon('categoryName')}
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
                  Tarih
                  {renderSortIcon('createdAt')}
                </button>
              </th>
              <th className="text-right px-4 py-3 text-sm font-medium">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  Yükleniyor...
                </td>
              </tr>
            ) : (
              pagedPosts.map((post: AuthorPostListItemDto) => (
                <tr key={post.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <p className="font-medium line-clamp-1">{post.title}</p>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="secondary">{post.categoryName}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={post.status === 'Published' ? 'default' : 'outline'}
                      className={post.status === 'Published' ? 'bg-green-500' : ''}
                    >
                      {post.status === 'Published' ? t.statusPublished : t.statusDraft}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {formatDate(post.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button asChild variant="ghost" size="icon" className="h-8 w-8" title="Görüntüle">
                        <Link href={localizedPath(`/author/posts/${post.id}`)} aria-label="Görüntüle">
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button asChild variant="ghost" size="icon" className="h-8 w-8" title="Düzenle">
                        <Link href={localizedPath(`/author/posts/${post.id}/edit`)} aria-label="Düzenle">
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => setDeleteTargetId(post.id)}
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
            {!isLoading && pagedPosts.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  Yazı bulunamadı.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
        <div className="text-muted-foreground">
          Toplam {totalCount} yazı
        </div>
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

      <Dialog open={Boolean(deleteTargetId)} onOpenChange={(open) => !open && setDeleteTargetId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.deleteDialogTitle}</DialogTitle>
            <DialogDescription>
              {t.deleteDialogBody}{' '}
              {deleteTarget ? `"${deleteTarget.title}"` : ''}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTargetId(null)}>
              {t.deleteDialogCancel}
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              {t.deleteDialogConfirm}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
