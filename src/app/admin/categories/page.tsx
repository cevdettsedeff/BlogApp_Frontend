'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Plus, Search, Edit, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Static data
const initialCategories = [
  { id: '1', name: 'Teknoloji', slug: 'teknoloji', postCount: 24 },
  { id: '2', name: 'Gezi', slug: 'gezi', postCount: 18 },
  { id: '3', name: 'Kariyer', slug: 'kariyer', postCount: 12 },
  { id: '4', name: 'Kişisel Gelişim', slug: 'kisisel-gelisim', postCount: 8 },
  { id: '5', name: 'Yazılım', slug: 'yazilim', postCount: 15 },
];

type CategoryItem = {
  id: string;
  name: string;
  slug: string;
  postCount: number;
};

type SortKey = 'name' | 'slug' | 'postCount';
type SortDir = 'asc' | 'desc';

const DEFAULT_PAGE_SIZE = 5;
const DEFAULT_SORT_KEY: SortKey = 'name';
const DEFAULT_SORT_DIR: SortDir = 'asc';

const isSortKey = (value: string | null): value is SortKey => {
  return value === 'name' || value === 'slug' || value === 'postCount';
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

export default function AdminCategoriesPage() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [categories, setCategories] = useState<CategoryItem[]>(() => initialCategories);
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
    const nextSort = isSortKey(searchParams.get('sort')) ? (searchParams.get('sort') as SortKey) : DEFAULT_SORT_KEY;
    const nextDir = isSortDir(searchParams.get('dir')) ? (searchParams.get('dir') as SortDir) : DEFAULT_SORT_DIR;
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

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return categories;
    return categories.filter((c) =>
      c.name.toLowerCase().includes(normalized) || c.slug.toLowerCase().includes(normalized)
    );
  }, [categories, query]);

  const sorted = useMemo(() => {
    const next = [...filtered];
    next.sort((a, b) => {
      const valueA = a[sortKey];
      const valueB = b[sortKey];
      if (sortKey === 'postCount') {
        return sortDir === 'asc' ? valueA - valueB : valueB - valueA;
      }
      return sortDir === 'asc'
        ? String(valueA).localeCompare(String(valueB))
        : String(valueB).localeCompare(String(valueA));
    });
    return next;
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paged = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, currentPage, pageSize]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
      updateQuery({ page: totalPages });
    }
  }, [page, totalPages]);

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

  const removeCategory = (id: string) => {
    const target = categories.find((c) => c.id === id);
    const label = target ? `${target.name}` : 'bu kategoriyi';
    const confirmed = window.confirm(`${label} silinsin mi?`);
    if (!confirmed) return;
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  const pageItems = getPageItems(currentPage, totalPages);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Kategoriler</h1>
          <p className="text-muted-foreground">Blog kategorilerini yönetin</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Yeni Kategori
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Kategori ara..."
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

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium">
                <button
                  type="button"
                  className="inline-flex items-center gap-1"
                  onClick={() => onSort('name')}
                >
                  Ad
                  {renderSortIcon('name')}
                </button>
              </th>
              <th className="text-left px-4 py-3 text-sm font-medium">
                <button
                  type="button"
                  className="inline-flex items-center gap-1"
                  onClick={() => onSort('slug')}
                >
                  Slug
                  {renderSortIcon('slug')}
                </button>
              </th>
              <th className="text-left px-4 py-3 text-sm font-medium">
                <button
                  type="button"
                  className="inline-flex items-center gap-1"
                  onClick={() => onSort('postCount')}
                >
                  Yazı Sayısı
                  {renderSortIcon('postCount')}
                </button>
              </th>
              <th className="text-right px-4 py-3 text-sm font-medium">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {paged.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-sm text-muted-foreground">
                  Eşleşen kategori bulunamadı.
                </td>
              </tr>
            ) : (
              paged.map((category) => (
                <tr key={category.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{category.name}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">/{category.slug}</td>
                  <td className="px-4 py-3 text-sm">{category.postCount} yazı</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" title="Düzenle">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => removeCategory(category.id)}
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
        <div className="text-muted-foreground">Toplam {filtered.length} kategori</div>
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
