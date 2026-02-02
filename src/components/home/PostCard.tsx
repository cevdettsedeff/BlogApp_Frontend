import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';

interface PostCardProps {
  post: {
    slug: string;
    title: string;
    summary: string;
    categoryName: string;
    categorySlug: string;
    authorDisplayName: string;
    publishedAt: string;
  };
  categoryHref: string;
  postHref: string;
}

export function PostCard({ post, categoryHref, postHref }: PostCardProps) {
  return (
    <article className="py-4 border-b last:border-b-0">
      <div className="flex items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Link href={categoryHref}>
              <Badge variant="secondary" className="text-xs font-normal">
                {post.categoryName}
              </Badge>
            </Link>
            <span className="text-xs text-muted-foreground">
              {post.authorDisplayName}
            </span>
            <span className="text-xs text-muted-foreground">·</span>
            <time className="text-xs text-muted-foreground">
              {formatDate(post.publishedAt)}
            </time>
          </div>

          <Link href={postHref}>
            <h3 className="font-semibold text-foreground hover:text-primary transition-colors line-clamp-2 mb-1">
              {post.title}
            </h3>
          </Link>

          <p className="text-sm text-muted-foreground line-clamp-1">
            {post.summary}
          </p>
        </div>
      </div>
    </article>
  );
}
