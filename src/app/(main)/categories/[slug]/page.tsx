import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { addLocaleToPath } from '@/lib/i18n';
import { getLocaleFromRequest } from '@/lib/i18n-server';
import { getApiBaseUrl } from '@/lib/api/baseUrl';
import type { Locale } from '@/lib/i18n';
import type { CategoryDto, PostListItemDto, PostListItemDtoPagedResponse } from '@/types';

const DEFAULT_COVER =
  'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&h=400&fit=crop';
const DEFAULT_AUTHOR = 'Anonim';

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

async function fetchCategoryPosts(locale: Locale, slug: string): Promise<PostListItemDto[]> {
  const baseUrl = getApiBaseUrl();
  const response = await fetch(
    `${baseUrl}/api/${locale}/posts?categorySlug=${encodeURIComponent(slug)}&page=1&pageSize=12`,
    {
      next: { revalidate: 60 },
      headers: {
        accept: 'application/json',
      },
    }
  );

  if (!response.ok) return [];
  const data = (await response.json()) as PostListItemDtoPagedResponse;
  return data.items ?? [];
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const locale = getLocaleFromRequest();
  const getPostHref = (slug: string) => addLocaleToPath(`/posts/${slug}`, locale);

  const [category, posts] = await Promise.all([
    fetchCategory(locale, params.slug),
    fetchCategoryPosts(locale, params.slug),
  ]);

  const title = category?.name ?? params.slug;
  const description = category?.name ?? '';

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-8">
        <Badge className="mb-2">{title}</Badge>
        <h1 className="text-3xl font-bold mb-2">{title}</h1>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>

      {/* Posts Grid */}
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
                  <span>Â·</span>
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
    </div>
  );
}
