import Image from 'next/image';
import Link from 'next/link';
import { Manrope, Playfair_Display } from 'next/font/google';
import { Badge } from '@/components/ui/badge';
import { CommentsSection } from '@/components/post/CommentsSection';
import { MarkdownContent } from '@/components/post/MarkdownContent';
import { ReadingSidebar } from '@/components/post/ReadingSidebar';
import { PostViewCount } from '@/components/post/PostViewCount';
import { PostViewTracker } from '@/components/post/PostViewTracker';
import { formatDate } from '@/lib/utils';
import { addLocaleToPath } from '@/lib/i18n';
import { getMessages } from '@/lib/i18n-dict';
import { getLocaleFromRequest } from '@/lib/i18n-server';
import { getApiBaseUrl } from '@/lib/api/baseUrl';
import type { Locale } from '@/lib/i18n';
import type { PostDetailDto } from '@/types';

const DEFAULT_COVER =
  'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&h=600&fit=crop';
const DEFAULT_CATEGORY_SLUG = 'genel';
const DEFAULT_AUTHOR = 'Anonim';

const displayFont = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
});

const bodyFont = Manrope({
  subsets: ['latin'],
  variable: '--font-body',
});

async function fetchPost(locale: Locale, slug: string): Promise<PostDetailDto | null> {
  const baseUrl = getApiBaseUrl();
  const response = await fetch(`${baseUrl}/api/${locale}/posts/${slug}`, {
    next: { revalidate: 60 },
    headers: {
      accept: 'application/json',
    },
  });

  if (!response.ok) return null;
  return (await response.json()) as PostDetailDto;
}

export default async function PostDetailPage({ params }: { params: { slug: string } }) {
  const locale = getLocaleFromRequest();
  const messages = getMessages(locale);
  const post = await fetchPost(locale, params.slug);
  const getCategoryHref = (slug: string) => addLocaleToPath(`/categories/${slug}`, locale);
  const getPostHref = (slug: string) => addLocaleToPath(`/posts/${slug}`, locale);

  if (!post) {
    return (
      <div className="container py-16 text-center text-muted-foreground">
        {messages.pages.post.comments.emptyTitle}
      </div>
    );
  }

  const categorySlug = post.categorySlug ?? DEFAULT_CATEGORY_SLUG;
  const categoryName = post.categoryName ?? messages.adminPosts.defaultCategory;
  const authorName = post.authorDisplayName ?? DEFAULT_AUTHOR;
  const title = post.title ?? '';
  const summary = post.summary ?? '';
  const coverImageUrl = post.coverImageUrl ?? DEFAULT_COVER;
  const content = post.content ?? '';
  const relatedPosts = post.relatedPosts ?? [];
  const readingTime = post.readingTimeMinutes ?? 0;

  return (
    <article className={`relative post-detail font-body ${displayFont.variable} ${bodyFont.variable}`}>
      <PostViewTracker postId={post.id} locale={locale} />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_hsl(var(--primary))_0%,_transparent_45%)] opacity-10" />

      {/* Hero */}
      <header className="relative overflow-hidden border-b bg-gradient-to-b from-muted/60 via-background to-background">
        <div className="absolute -top-24 right-0 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-16 left-10 h-48 w-48 rounded-full bg-primary/20 blur-3xl" />

        <div className="container py-12 md:py-16">
          <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-wide text-muted-foreground mb-5 animate-fade-up">
            <Link href={getCategoryHref(categorySlug)}>
              <Badge className="bg-primary hover:bg-primary/90">{categoryName}</Badge>
            </Link>
            <span>-</span>
            <span>{authorName}</span>
            <span>-</span>
            <time>{formatDate(post.publishedAt ?? new Date().toISOString())}</time>
            <span>-</span>
            <span>{readingTime} dk okuma</span>
            <span>-</span>
            <span>
              <PostViewCount postId={post.id} initialCount={post.viewCount} /> görüntülenme
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl lg:text-6xl font-semibold leading-tight max-w-4xl font-display animate-fade-up animate-delay-1">
            {title}
          </h1>
          {summary && (
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mt-4 animate-fade-up animate-delay-2">
              {summary}
            </p>
          )}

          {post.tags && post.tags.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2 animate-fade-up animate-delay-3">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Cover Image */}
      <section className="-mt-10 pb-10 md:-mt-14 animate-fade-in">
        <div className="container">
          <div className="relative aspect-[21/9] overflow-hidden rounded-[2.5rem] border shadow-2xl">
            <Image
              src={coverImageUrl}
              alt={title}
              fill
              className="object-cover object-[center_35%]"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/5 to-transparent" />
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="container pb-14">
        <div className="relative lg:grid lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-10">
          <div>
            <div className="prose-blog text-[17px] leading-7 mb-12">
              <MarkdownContent content={content} />
            </div>

            <CommentsSection postId={post.id} strings={messages.pages.post.comments} />

            {relatedPosts.length > 0 && (
              <section className="mt-12 rounded-2xl border p-5">
                <h2 className="text-lg font-semibold mb-4">{messages.pages.post.popularTitle}</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {relatedPosts.map((p) => (
                    <article key={p.id} className="flex items-start gap-3">
                      <div className="relative h-16 w-24 overflow-hidden rounded-lg">
                        <Image
                          src={p.coverImageUrl ?? DEFAULT_COVER}
                          alt={p.title ?? ''}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        {p.slug && (
                          <Link href={getPostHref(p.slug)}>
                            <h3 className="text-sm font-medium hover:text-primary transition-colors line-clamp-2">
                              {p.title ?? ''}
                            </h3>
                          </Link>
                        )}
                        <time className="mt-1 block text-xs text-muted-foreground">
                          {formatDate(p.publishedAt ?? new Date().toISOString())}
                        </time>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}
          </div>

          <div className="hidden lg:block">
            <div className="sticky top-24">
              <ReadingSidebar
                readingTime={readingTime}
                postId={post.id}
                initialViewCount={post.viewCount}
                categoryName={categoryName}
                authorName={authorName}
              />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
