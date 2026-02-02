'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PostEditor } from '@/components/admin/posts/PostEditor';
import { useAdminPostsStore } from '@/stores/adminPostsStore';
import { useUser } from '@/stores/authStore';
import { useLocale } from '@/hooks/useLocale';
import { addLocaleToPath } from '@/lib/i18n';
import { getMessages } from '@/lib/i18n-dict';

export default function AuthorPostEditPage() {
  const params = useParams<{ id: string }>();
  const { locale } = useLocale();
  const messages = getMessages(locale);
  const t = messages.adminPosts;
  const user = useUser();
  const post = useAdminPostsStore((state) =>
    state.posts.find((item) => item.id === params.id)
  );

  const localizedPath = (href: string) => addLocaleToPath(href, locale);

  if (!post) {
    return (
      <div className="space-y-4">
        <Button asChild variant="outline" size="sm">
          <Link href={localizedPath('/author/posts')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t.backToList}
          </Link>
        </Button>
        <p className="text-sm text-muted-foreground">{t.notFound}</p>
      </div>
    );
  }

  const canManage =
    user?.role === 'Admin' || (user && post.authorDisplayName === user.displayName);

  if (!canManage) {
    return (
      <div className="space-y-4">
        <Button asChild variant="outline" size="sm">
          <Link href={localizedPath('/author/posts')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t.backToList}
          </Link>
        </Button>
        <p className="text-sm text-muted-foreground">Bu yazıyı düzenleme yetkiniz yok.</p>
      </div>
    );
  }

  return (
    <PostEditor
      mode="edit"
      postId={params.id}
      currentAuthorDisplayName={user?.displayName}
    />
  );
}
