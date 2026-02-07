'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Upload, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { adminSettingsService } from '@/lib/api/services/adminSettingsService';
import { adminPostService } from '@/lib/api/services/adminPostService';
import { useLocale } from '@/hooks/useLocale';
import type { AdminPostListItemDto, AdminSettingsDto, UpdateSettingsRequest } from '@/types';

type SortKey = 'title' | 'categoryName' | 'publishedAt';
type SortDir = 'asc' | 'desc';

const DEFAULT_PAGE_SIZE = 5;
const DEFAULT_SORT_KEY: SortKey = 'publishedAt';
const DEFAULT_SORT_DIR: SortDir = 'desc';

const isSortKey = (value: string | null): value is SortKey => {
  return value === 'title' || value === 'categoryName' || value === 'publishedAt';
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

const emptySettings: AdminSettingsDto = {
  id: '',
  siteTitle: '',
  siteDescription: '',
  themeMode: 'Auto',
  newsletterEnabled: false,
  newsletterTitle: '',
  newsletterDescription: '',
  logoUrl: '',
  faviconUrl: '',
  featuredPostId: null,
  viewCountDelayMs: 10000,
  createdAt: '',
  updatedAt: null,
};

export default function AdminSettingsPage() {
  const { locale } = useLocale();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [settings, setSettings] = useState<AdminSettingsDto>(emptySettings);

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

  const { data: settingsData, isLoading: isSettingsLoading } = useQuery({
    queryKey: ['admin-settings', locale],
    queryFn: () => adminSettingsService.get(locale),
  });

  useEffect(() => {
    if (settingsData) setSettings(settingsData);
  }, [settingsData]);

  const { data: postsData } = useQuery({
    queryKey: ['admin-settings-posts', locale, page, pageSize],
    queryFn: () =>
      adminPostService.list({
        language: locale,
        status: 'Published',
        page,
        pageSize,
      }),
    keepPreviousData: true,
  });

  const posts = postsData?.items ?? [];

  const filteredPosts = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return posts;
    return posts.filter((post) =>
      (post.title || '').toLowerCase().includes(normalized) ||
      (post.categoryName || '').toLowerCase().includes(normalized)
    );
  }, [query, posts]);

  const sortedPosts = useMemo(() => {
    const sorted = [...filteredPosts];
    sorted.sort((a, b) => {
      if (sortKey === 'publishedAt') {
        const timeA = new Date(a.publishedAt || 0).getTime();
        const timeB = new Date(b.publishedAt || 0).getTime();
        return sortDir === 'asc' ? timeA - timeB : timeB - timeA;
      }
      const valueA = a[sortKey] || '';
      const valueB = b[sortKey] || '';
      return sortDir === 'asc'
        ? String(valueA).localeCompare(String(valueB))
        : String(valueB).localeCompare(String(valueA));
    });
    return sorted;
  }, [filteredPosts, sortKey, sortDir]);

  const totalCount = postsData?.totalCount ?? sortedPosts.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagedPosts = sortedPosts;

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
      updateQuery({ page: totalPages });
    }
  }, [page, totalPages]);

  const updateMutation = useMutation({
    mutationFn: (data: UpdateSettingsRequest) => adminSettingsService.update(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
    },
  });

  const onSave = () => {
    updateMutation.mutate({
      language: locale,
      siteTitle: settings.siteTitle,
      siteDescription: settings.siteDescription,
      themeMode: settings.themeMode || 'Auto',
      newsletterEnabled: settings.newsletterEnabled,
      newsletterTitle: settings.newsletterTitle,
      newsletterDescription: settings.newsletterDescription,
      logoUrl: settings.logoUrl,
      faviconUrl: settings.faviconUrl,
      featuredPostId: settings.featuredPostId,
      viewCountDelayMs: settings.viewCountDelayMs ?? 10000,
    });
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
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Ayarlar</h1>
        <p className="text-muted-foreground">
          Site başlığı, açıklama, logo ve bülten bilgilerini güncelleyin.
        </p>
      </div>

      {/* Settings Form */}
      <div className="max-w-xl space-y-6">
        <div>
          <Label htmlFor="siteTitle">Site başlığı</Label>
          <Input
            id="siteTitle"
            value={settings.siteTitle ?? ''}
            onChange={(e) => setSettings({ ...settings, siteTitle: e.target.value })}
            className="mt-1.5"
            disabled={isSettingsLoading}
          />
        </div>

        <div>
          <Label htmlFor="siteDescription">Site açıklaması</Label>
          <Input
            id="siteDescription"
            value={settings.siteDescription ?? ''}
            onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
            className="mt-1.5"
            disabled={isSettingsLoading}
          />
        </div>

        <div>
          <Label htmlFor="themeMode">Tema</Label>
          <select
            id="themeMode"
            className="mt-1.5 h-10 w-full rounded-md border bg-background px-3 text-sm"
            value={settings.themeMode ?? 'Auto'}
            onChange={(e) => setSettings({ ...settings, themeMode: e.target.value })}
            disabled={isSettingsLoading}
          >
            <option value="Auto">Otomatik</option>
            <option value="Light">Açık</option>
            <option value="Dark">Koyu</option>
          </select>
        </div>

        <div>
          <Label htmlFor="viewCountDelayMs">Goruntulenme artis suresi (ms)</Label>
          <Input
            id="viewCountDelayMs"
            type="number"
            min={0}
            max={600000}
            value={settings.viewCountDelayMs ?? 10000}
            onChange={(e) =>
              setSettings({
                ...settings,
                viewCountDelayMs: Math.max(0, Number(e.target.value || 0)),
              })
            }
            className="mt-1.5"
            disabled={isSettingsLoading}
          />
        </div>

        <div>
          <Label htmlFor="logoUrl">Logo URL</Label>
          <div className="flex items-center gap-3 mt-1.5">
            <Input
              id="logoUrl"
              value={settings.logoUrl ?? ''}
              onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
              className="flex-1"
              placeholder="https://..."
              disabled={isSettingsLoading}
            />
            <Button variant="outline" size="sm" type="button">
              <Upload className="h-4 w-4 mr-2" />
              Seç
            </Button>
          </div>
        </div>

        <div>
          <Label htmlFor="faviconUrl">Favicon URL</Label>
          <Input
            id="faviconUrl"
            value={settings.faviconUrl ?? ''}
            onChange={(e) => setSettings({ ...settings, faviconUrl: e.target.value })}
            className="mt-1.5"
            disabled={isSettingsLoading}
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            id="newsletterEnabled"
            type="checkbox"
            checked={Boolean(settings.newsletterEnabled)}
            onChange={(e) => setSettings({ ...settings, newsletterEnabled: e.target.checked })}
            disabled={isSettingsLoading}
          />
          <Label htmlFor="newsletterEnabled">Bülten aktif</Label>
        </div>

        <div>
          <Label htmlFor="newsletterTitle">Bülten başlığı</Label>
          <Input
            id="newsletterTitle"
            value={settings.newsletterTitle ?? ''}
            onChange={(e) => setSettings({ ...settings, newsletterTitle: e.target.value })}
            className="mt-1.5"
            disabled={!settings.newsletterEnabled}
          />
        </div>

        <div>
          <Label htmlFor="newsletterDescription">Bülten açıklaması</Label>
          <Input
            id="newsletterDescription"
            value={settings.newsletterDescription ?? ''}
            onChange={(e) => setSettings({ ...settings, newsletterDescription: e.target.value })}
            className="mt-1.5"
            disabled={!settings.newsletterEnabled}
          />
        </div>

        <div>
          <Label htmlFor="featuredPostId">Öne çıkan yazı</Label>
          <select
            id="featuredPostId"
            className="mt-1.5 h-10 w-full rounded-md border bg-background px-3 text-sm"
            value={settings.featuredPostId ?? ''}
            onChange={(e) =>
              setSettings({ ...settings, featuredPostId: e.target.value || null })
            }
          >
            <option value="">Seçiniz</option>
            {posts.map((post: AdminPostListItemDto) => (
              <option key={post.id} value={post.id}>
                {post.title}
              </option>
            ))}
          </select>
        </div>

        <Button className="w-full" onClick={onSave} disabled={updateMutation.isPending}>
          Değişiklikleri kaydet
        </Button>
      </div>

      {/* Recent Posts */}
      <div className="mt-12 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-bold">Son Yazılar</h2>
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Yazı ara..."
              className="pl-10"
              value={query}
              onChange={(e) => {
                const value = e.target.value;
                setQuery(value);
                setPage(1);
                updateQuery({ q: value, page: 1 });
              }}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span>Sırala:</span>
          <button type="button" className="inline-flex items-center gap-1" onClick={() => onSort('publishedAt')}>
            Tarih {renderSortIcon('publishedAt')}
          </button>
          <button type="button" className="inline-flex items-center gap-1" onClick={() => onSort('title')}>
            Başlık {renderSortIcon('title')}
          </button>
          <button type="button" className="inline-flex items-center gap-1" onClick={() => onSort('categoryName')}>
            Kategori {renderSortIcon('categoryName')}
          </button>
        </div>

        <div className="space-y-3">
          {pagedPosts.length === 0 ? (
            <div className="rounded-lg border p-6 text-center text-sm text-muted-foreground">
              Eşleşen yazı bulunamadı.
            </div>
          ) : (
            pagedPosts.map((post) => (
              <div
                key={post.id}
                className="flex items-center justify-between p-4 bg-card border rounded-lg"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="secondary" className="text-xs">
                      {post.categoryName}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('tr-TR') : ''}
                    </span>
                  </div>
                  <h3 className="font-medium">{post.title}</h3>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <div className="text-muted-foreground">Toplam {totalCount} yazı</div>
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
    </div>
  );
}
