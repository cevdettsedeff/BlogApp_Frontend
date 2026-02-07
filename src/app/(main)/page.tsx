import { HeroSection, PostsSection, PopularPostsSection, NewsletterSection } from '@/components/home';
import { getMessages } from '@/lib/i18n-dict';
import { getLocaleFromRequest } from '@/lib/i18n-server';
import { getApiBaseUrl } from '@/lib/api/baseUrl';
import type { Locale } from '@/lib/i18n';
import type { PostListItemDto, PostListItemDtoPagedResponse } from '@/types';

const DEFAULT_COVER =
  'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&h=800&fit=crop';
const DEFAULT_CATEGORY_SLUG = 'genel';
const DEFAULT_AUTHOR = 'Anonim';

async function fetchPosts(locale: Locale): Promise<PostListItemDto[]> {
  const baseUrl = getApiBaseUrl();
  const response = await fetch(`${baseUrl}/api/${locale}/posts?page=1&pageSize=12`, {
    next: { revalidate: 60 },
    headers: {
      accept: 'application/json',
    },
  });

  if (!response.ok) return [];

  const data = (await response.json()) as PostListItemDtoPagedResponse;
  return data.items ?? [];
}

export default async function HomePage() {
  const locale = getLocaleFromRequest();
  const messages = getMessages(locale);
  const items = await fetchPosts(locale);
  const basePosts = items.filter((post) => post.slug);

  const posts = basePosts.map((post) => ({
    slug: post.slug ?? '',
    title: post.title ?? messages.home.postsTitle,
    summary: post.summary ?? '',
    coverImageUrl: post.coverImageUrl ?? DEFAULT_COVER,
    categoryName: post.categoryName ?? messages.adminPosts.defaultCategory,
    categorySlug: post.categorySlug ?? DEFAULT_CATEGORY_SLUG,
    authorDisplayName: post.authorDisplayName ?? DEFAULT_AUTHOR,
    publishedAt: post.publishedAt ?? new Date().toISOString(),
    likesCount: post.viewCount,
  }));

  const heroPosts = posts
    .slice(0, 3)
    .map(({ slug, title, summary, coverImageUrl, categoryName, categorySlug }) => ({
      slug,
      title,
      summary,
      coverImageUrl,
      categoryName,
      categorySlug,
    }));

  const popularPosts = [...posts]
    .sort((a, b) => b.likesCount - a.likesCount)
    .slice(0, 3)
    .map(({ slug, title, summary, categoryName, categorySlug, authorDisplayName, publishedAt }) => ({
      slug,
      title,
      summary,
      categoryName,
      categorySlug,
      authorDisplayName,
      publishedAt,
    }));

  return (
    <>
      <HeroSection posts={heroPosts} />
      <PostsSection posts={posts} title={messages.home.postsTitle} />
      <PopularPostsSection posts={popularPosts} title={messages.home.popularTitle} locale={locale} />
      <NewsletterSection />
    </>
  );
}
