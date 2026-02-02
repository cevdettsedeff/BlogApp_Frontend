'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { addLocaleToPath } from '@/lib/i18n';
import { useLocale } from '@/hooks/useLocale';
import { getMessages } from '@/lib/i18n-dict';
import { formatDate } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Post {
  slug: string;
  title: string;
  summary: string;
  coverImageUrl: string;
  categoryName: string;
  categorySlug: string;
  authorDisplayName: string;
  publishedAt: string;
  likesCount: number;
}

interface PostsSectionProps {
  title: string;
  posts: Post[];
  pageSize?: number;
}

export function PostsSection({ title, posts, pageSize = 6 }: PostsSectionProps) {
  const { locale } = useLocale();
  const messages = getMessages(locale);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<'newest' | 'oldest' | 'likes'>('newest');
  const totalPages = Math.max(1, Math.ceil(posts.length / pageSize));

  const sortedPosts = useMemo(() => {
    const copy = [...posts];
    if (sort === 'likes') {
      copy.sort((a, b) => b.likesCount - a.likesCount);
      return copy;
    }
    copy.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    return sort === 'newest' ? copy : copy.reverse();
  }, [posts, sort]);

  const pagedPosts = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sortedPosts.slice(start, start + pageSize);
  }, [page, pageSize, sortedPosts]);

  const getPostHref = (slug: string) => addLocaleToPath(`/posts/${slug}`, locale);
  const getCategoryHref = (slug: string) => addLocaleToPath(`/categories/${slug}`, locale);

  return (
    <section className="py-12">
      <div className="container">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <h2 className="text-2xl font-bold">{title}</h2>
          <label className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{messages.home.sortLabel}</span>
            <select
              value={sort}
              onChange={(event) => {
                setSort(event.target.value as 'newest' | 'oldest' | 'likes');
                setPage(1);
              }}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground"
            >
              <option value="newest">{messages.home.sortNewest}</option>
              <option value="oldest">{messages.home.sortOldest}</option>
              <option value="likes">{messages.home.sortLikes}</option>
            </select>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
          {pagedPosts.map((post) => (
            <article
              key={post.slug}
              className="group rounded-xl overflow-hidden border bg-card h-full flex flex-col"
            >
              <Link href={getPostHref(post.slug)} className="block">
                <div className="relative aspect-[16/10]">
                  <Image
                    src={post.coverImageUrl}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              </Link>

              <div className="p-4 space-y-3 flex-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Link href={getCategoryHref(post.categorySlug)}>
                    <Badge variant="secondary" className="text-xs font-normal">
                      {post.categoryName}
                    </Badge>
                  </Link>
                  <span>{post.authorDisplayName}</span>
                  <span>·</span>
                  <time>{formatDate(post.publishedAt)}</time>
                </div>

                <Link href={getPostHref(post.slug)}>
                  <h3 className="font-semibold text-foreground hover:text-primary transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                </Link>

                <p className="text-sm text-muted-foreground line-clamp-2">
                  {post.summary}
                </p>
              </div>
            </article>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              className={cn(
                'h-9 w-9 rounded-full border text-sm font-medium transition-colors',
                page === 1
                  ? 'text-muted-foreground/50 cursor-not-allowed'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              aria-label="Previous page"
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4 mx-auto" />
            </button>
            {Array.from({ length: totalPages }).map((_, index) => {
              const value = index + 1;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setPage(value)}
                  className={cn(
                    'h-9 w-9 rounded-full border text-sm font-medium transition-colors',
                    value === page
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                  aria-label={`Page ${value}`}
                >
                  {value}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              className={cn(
                'h-9 w-9 rounded-full border text-sm font-medium transition-colors',
                page === totalPages
                  ? 'text-muted-foreground/50 cursor-not-allowed'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              aria-label="Next page"
              disabled={page === totalPages}
            >
              <ChevronRight className="h-4 w-4 mx-auto" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
