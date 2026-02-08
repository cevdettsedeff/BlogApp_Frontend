import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { addLocaleToPath } from '@/lib/i18n';
import { getLocaleFromRequest } from '@/lib/i18n-server';
import { getApiBaseUrl } from '@/lib/api/baseUrl';
import { getMessages } from '@/lib/i18n-dict';
import type { Locale } from '@/lib/i18n';
import type { CategoryDto, PostListItemDtoPagedResponse } from '@/types';

const DEFAULT_COVER =
  'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&h=400&fit=crop';
const DEFAULT_AUTHOR = 'Anonim';
const DEFAULT_PAGE_SIZE = 12;

function parsePage(raw?: string): number {
  const value = Number(raw);
  return Number.isFinite(value) && value > 0 ? value : 1;
}

async function fetchCategory(locale: Locale, slug: string): Promise<CategoryDto | null> {
  const baseUrl = getApiBaseUrl();
  const response = await fetch(`${baseUrl}/api/${locale}/categories/${slug}`, {
    next: { revalidate: 300 },
    headers: {
      accept: 'application/json',
    },
  });

  if (!response.ok) return null;
  return (await response.json()) as CategoryDto;
}

async function fetchCategoryPosts(
  locale: Locale,
  slug: string,
  page: number
): Promise<PostListItemDtoPagedResponse> {
  const baseUrl = getApiBaseUrl();
  const response = await fetch(
    `${baseUrl}/api/${locale}/categories/${encodeURIComponent(slug)}/posts?page=${page}&pageSize=${DEFAULT_PAGE_SIZE}`,
    {
      next: { revalidate: 60 },
      headers: {
        accept: 'application/json',
      },
    }
  );

  if (!response.ok) {
    return {
      items: [],
      page,
      pageSize: DEFAULT_PAGE_SIZE,
      totalCount: 0,
    };
  }

  return (await response.json()) as PostListItemDtoPagedResponse;
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams?: { page?: string };
}) {
  const locale = getLocaleFromRequest();
  const messages = getMessages(locale);
  const currentPage = parsePage(searchParams?.page);
  const getPostHref = (slug: string) => addLocaleToPath(`/posts/${slug}`, locale);
  const baseCategoryHref = addLocaleToPath(`/categories/${params.slug}`, locale);

  const [category, postsResult] = await Promise.all([
    fetchCategory(locale, params.slug),
    fetchCategoryPosts(locale, params.slug, currentPage),
  ]);

  const title = category?.name ?? params.slug;
  const description = category?.name ?? '';
  const posts = (postsResult.items ?? []).filter((post) => post.slug);
  const totalPages = Math.max(1, Math.ceil(postsResult.totalCount / postsResult.pageSize));
  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  const pageHref = (page: number) =>
    page <= 1 ? baseCategoryHref : `${baseCategoryHref}?page=${page}`;

  return (
    <div className="container py-8">
      <div className="mb-8">
        <Badge className="mb-2">{title}</Badge>
        <h1 className="text-3xl font-bold mb-2">{title}</h1>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => {
          if (!post.slug) return null;
          return (
            <article key={post.id} className="group">
              <Link href={getPostHref(post.slug)}>
                <div className="relative aspect-[16/10] rounded-lg overflow-hidden mb-3">
                  <Image
                    src={post.coverImageUrl ?? DEFAULT_COVER}
                    alt={post.title ?? ''}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              </Link>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{post.authorDisplayName ?? DEFAULT_AUTHOR}</span>
                  <span>-</span>
                  <time>{formatDate(post.publishedAt ?? new Date().toISOString())}</time>
                </div>

                <Link href={getPostHref(post.slug)}>
                  <h2 className="font-semibold group-hover:text-primary transition-colors line-clamp-2">
                    {post.title ?? ''}
                  </h2>
                </Link>

                <p className="text-sm text-muted-foreground line-clamp-2">
                  {post.summary ?? ''}
                </p>
              </div>
            </article>
          );
        })}
      </div>

      {posts.length === 0 && (
        <p className="mt-8 text-sm text-muted-foreground">
          {locale === 'tr' ? 'Bu kategoride hen\u00fcz yaz\u0131 yok.' : 'There are no posts in this category yet.'}
        </p>
      )}

      {postsResult.totalCount > 0 && (
        <div className="mt-8 flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            {locale === 'tr'
              ? `Sayfa ${currentPage} / ${totalPages} - Toplam ${postsResult.totalCount} yaz\u0131`
              : `Page ${currentPage} / ${totalPages} - ${postsResult.totalCount} total posts`}
          </p>
          <div className="flex items-center gap-2">
            {hasPrev ? (
              <Button asChild variant="outline" size="sm">
                <Link href={pageHref(currentPage - 1)}>{messages.adminPosts.prev}</Link>
              </Button>
            ) : (
              <Button variant="outline" size="sm" disabled>
                {messages.adminPosts.prev}
              </Button>
            )}
            {hasNext ? (
              <Button asChild variant="outline" size="sm">
                <Link href={pageHref(currentPage + 1)}>{messages.adminPosts.next}</Link>
              </Button>
            ) : (
              <Button variant="outline" size="sm" disabled>
                {messages.adminPosts.next}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
