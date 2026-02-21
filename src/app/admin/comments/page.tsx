'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Search, Check, X, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatDate, getInitials } from '@/lib/utils';
import { adminCommentService } from '@/lib/api/services/adminCommentService';
import type { PendingCommentDto } from '@/types';

type SortKey = 'createdAt' | 'postTitle' | 'author';
type SortDir = 'asc' | 'desc';

const DEFAULT_PAGE_SIZE = 5;
const DEFAULT_SORT_KEY: SortKey = 'createdAt';
const DEFAULT_SORT_DIR: SortDir = 'desc';

const isSortKey = (value: string | null): value is SortKey => {
  return value === 'createdAt' || value === 'postTitle' || value === 'author';
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

export default function AdminCommentsPage() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [query, setQuery] = useState(() => searchParams.get('q') ?? '');
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
    const nextSort = isSortKey(searchParams.get('sort'))
      ? (searchParams.get('sort') as SortKey)
      : DEFAULT_SORT_KEY;
    const nextDir = isSortDir(searchParams.get('dir'))
      ? (searchParams.get('dir') as SortDir)
      : DEFAULT_SORT_DIR;
    const nextPageRaw = Number(searchParams.get('page'));
    const nextPage = Number.isFinite(nextPageRaw) && nextPageRaw > 0 ? nextPageRaw : 1;
    const nextPageSizeRaw = Number(searchParams.get('pageSize'));
    const nextPageSize = Number.isFinite(nextPageSizeRaw) && nextPageSizeRaw > 0 ? nextPageSizeRaw : DEFAULT_PAGE_SIZE;

    if (nextQuery !== query) setQuery(nextQuery);
    if (nextSort !== sortKey) setSortKey(nextSort);
    if (nextDir !== sortDir) setSortDir(nextDir);
    if (nextPage !== page) setPage(nextPage);
    if (nextPageSize !== pageSize) setPageSize(nextPageSize);
  }, [searchParams, query, sortKey, sortDir, page, pageSize]);

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

  const { data, isLoading } = useQuery({
    queryKey: ['admin-comments', { page, pageSize }],
    queryFn: () => adminCommentService.listPending({ page, pageSize }),
    placeholderData: keepPreviousData,
  });

  const comments = useMemo(() => data?.items ?? [], [data?.items]);
  const totalCount = data?.totalCount ?? comments.length;

  const filteredComments = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return comments;

    return comments.filter((comment) => {
      const author = (comment.userDisplayName || comment.guestName || '').toLowerCase();
      const content = (comment.content || '').toLowerCase();
      const postTitle = (comment.postTitle || '').toLowerCase();
      return (
        author.includes(normalizedQuery) ||
        content.includes(normalizedQuery) ||
        postTitle.includes(normalizedQuery)
      );
    });
  }, [comments, query]);

  const sortedComments = useMemo(() => {
    const sorted = [...filteredComments];
    sorted.sort((a, b) => {
      if (sortKey === 'createdAt') {
        const timeA = new Date(a.createdAt).getTime();
        const timeB = new Date(b.createdAt).getTime();
        return sortDir === 'asc' ? timeA - timeB : timeB - timeA;
      }
      if (sortKey === 'author') {
        const authorA = (a.userDisplayName || a.guestName || '').toLowerCase();
        const authorB = (b.userDisplayName || b.guestName || '').toLowerCase();
        return sortDir === 'asc' ? authorA.localeCompare(authorB) : authorB.localeCompare(authorA);
      }
      const valueA = a[sortKey] || '';
      const valueB = b[sortKey] || '';
      return sortDir === 'asc'
        ? String(valueA).localeCompare(String(valueB))
        : String(valueB).localeCompare(String(valueA));
    });
    return sorted;
  }, [filteredComments, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagedComments = sortedComments;

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
      updateQuery({ page: totalPages });
    }
  }, [page, totalPages, updateQuery]);

  const moderateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'Approved' | 'Spam' | 'Pending' }) =>
      adminCommentService.updateStatus(id, { status }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-comments'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminCommentService.delete(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-comments'] });
    },
  });

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
      <div>
        <h1 className="text-2xl font-bold">Yorumlar</h1>
        <p className="text-muted-foreground">Bekleyen yorumları yönetin</p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-lg border p-3">
          <p className="text-xs text-muted-foreground">Toplam</p>
          <p className="text-lg font-semibold">{totalCount}</p>
        </div>
        <div className="rounded-lg border p-3">
          <p className="text-xs text-muted-foreground">Beklemede</p>
          <p className="text-lg font-semibold">{totalCount}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Yorum ara..."
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
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Sırala:</span>
          <button type="button" className="inline-flex items-center gap-1" onClick={() => onSort('createdAt')}>
            Tarih {renderSortIcon('createdAt')}
          </button>
          <button type="button" className="inline-flex items-center gap-1" onClick={() => onSort('author')}>
            Yazar {renderSortIcon('author')}
          </button>
          <button type="button" className="inline-flex items-center gap-1" onClick={() => onSort('postTitle')}>
            Yazı {renderSortIcon('postTitle')}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="rounded-lg border p-6 text-center text-sm text-muted-foreground">
            Yükleniyor...
          </div>
        ) : pagedComments.length === 0 ? (
          <div className="rounded-lg border p-6 text-center text-sm text-muted-foreground">
            Eşleşen yorum bulunamadı.
          </div>
        ) : (
          pagedComments.map((comment: PendingCommentDto) => {
            const displayName = comment.userDisplayName || comment.guestName || 'Anonim';
            const isGuest = !comment.userDisplayName;

            return (
              <div key={comment.id} className="border rounded-lg p-4">
                <div className="flex items-start gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-medium">{displayName}</span>
                      {isGuest && (
                        <Badge variant="outline" className="text-xs">Misafir</Badge>
                      )}
                      <Badge variant="secondary">Beklemede</Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>

                    <p className="text-sm text-muted-foreground mb-2">
                      Yazı: <span className="text-foreground">{comment.postTitle}</span>
                    </p>

                    <p className="text-sm">{comment.content}</p>

                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      <Button
                        size="sm"
                        className="h-8 bg-green-500 hover:bg-green-600"
                        onClick={() => moderateMutation.mutate({ id: comment.id, status: 'Approved' })}
                        title="Onayla"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Onayla
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8"
                        onClick={() => moderateMutation.mutate({ id: comment.id, status: 'Spam' })}
                        title="Spam"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Spam
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 text-muted-foreground hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => deleteMutation.mutate(comment.id)}
                        title="Sil"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Sil
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
        <div className="text-muted-foreground">Toplam {filteredComments.length} yorum</div>
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
    </div>
  );
}
