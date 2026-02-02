import { PostCard } from './PostCard';
import { addLocaleToPath, type Locale } from '@/lib/i18n';

interface Post {
  slug: string;
  title: string;
  summary: string;
  categoryName: string;
  categorySlug: string;
  authorDisplayName: string;
  publishedAt: string;
}

interface PopularPostsSectionProps {
  posts: Post[];
  title: string;
  locale: Locale;
}

export function PopularPostsSection({
  posts,
  title,
  locale,
}: PopularPostsSectionProps) {
  const getCategoryHref = (slug: string) => addLocaleToPath(`/categories/${slug}`, locale);
  const getPostHref = (slug: string) => addLocaleToPath(`/posts/${slug}`, locale);

  return (
    <section className="py-12">
      <div className="container">
        <h2 className="text-2xl font-bold mb-6">{title}</h2>
        <div className="divide-y">
          {posts.map((post) => (
            <PostCard
              key={post.slug}
              post={post}
              categoryHref={getCategoryHref(post.categorySlug)}
              postHref={getPostHref(post.slug)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
