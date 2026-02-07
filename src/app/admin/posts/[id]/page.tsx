'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useLocale } from '@/hooks/useLocale';
import { addLocaleToPath } from '@/lib/i18n';
import { getMessages } from '@/lib/i18n-dict';
import { formatDate } from '@/lib/utils';
import { getReadingTime, renderMarkdown } from '@/components/admin/posts/markdown';
import { adminPostService } from '@/lib/api/services/adminPostService';

export default function AdminPostDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { locale } = useLocale();
  const messages = getMessages(locale);
  const t = messages.adminPosts;
  const queryClient = useQueryClient();

  const { data: post, isLoading } = useQuery({
    queryKey: ['admin-post', params.id],
    queryFn: () => adminPostService.getById(params.id),
    enabled: !!params.id,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminPostService.delete(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
    },
  });
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const localizedPath = (href: string) => addLocaleToPath(href, locale);

  if (isLoading) {
    return (
      <div className="space-y-4 text-sm text-muted-foreground">Yükleniyor...</div>
    );
  }

  if (!post) {
    return (
      <div className="space-y-4">
        <Button asChild variant="outline" size="sm">
          <Link href={localizedPath('/admin/posts')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t.backToList}
          </Link>
        </Button>
        <p className="text-sm text-muted-foreground">{t.notFound}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t.detailTitle}</h1>
          <p className="text-muted-foreground">{post.title}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href={localizedPath('/admin/posts')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t.backToList}
            </Link>
          </Button>
          <Button asChild>
            <Link href={localizedPath(`/admin/posts/${post.id}/edit`)}>
              <Edit className="h-4 w-4 mr-2" />
              {t.actionEdit}
            </Link>
          </Button>
          <Button variant="destructive" onClick={() => setIsDeleteOpen(true)}>
            <Trash2 className="h-4 w-4 mr-2" />
            {t.actionDelete}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          <div className="rounded-lg border p-4 space-y-4">
            <div>
              <p className="text-xs uppercase text-muted-foreground">{t.fieldTitle}</p>
              <p className="text-lg font-semibold">{post.title}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-muted-foreground">{t.fieldSummary}</p>
              <p className="text-muted-foreground">{post.summary || t.noSummary}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-muted-foreground">{t.fieldContent}</p>
              {post.content ? (
                <div className="space-y-3">{renderMarkdown(post.content)}</div>
              ) : (
                <p className="text-muted-foreground">{t.noContent}</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-lg border p-4 space-y-4">
            <div>
              <p className="text-xs uppercase text-muted-foreground">{t.fieldCover}</p>
              {post.coverImageUrl ? (
                <div className="overflow-hidden rounded-md border">
                  <img src={post.coverImageUrl} alt={post.title ?? ''} className="h-40 w-full object-cover" />
                </div>
              ) : (
                <p className="text-muted-foreground">{t.noCover}</p>
              )}
            </div>
            <div>
              <p className="text-xs uppercase text-muted-foreground">{t.fieldSlug}</p>
              <p>{post.slug}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{post.categoryName}</Badge>
              <Badge variant={post.status === 'Published' ? 'default' : 'outline'}>
                {post.status === 'Published' ? t.statusPublished : t.statusDraft}
              </Badge>
            </div>
            <div>
              <p className="text-xs uppercase text-muted-foreground">{t.fieldAuthor}</p>
              <p>{post.authorDisplayName}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-muted-foreground">{t.fieldReadingTime}</p>
              <p>{getReadingTime(post.content || '')} dk</p>
            </div>
            <div>
              <p className="text-xs uppercase text-muted-foreground">{t.fieldCreatedAt}</p>
              <p>{formatDate(post.createdAt)}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-muted-foreground">{t.fieldPublishedAt}</p>
              <p>{post.publishedAt ? formatDate(post.publishedAt) : t.notPublished}</p>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.deleteDialogTitle}</DialogTitle>
            <DialogDescription>
              {t.deleteDialogBody} "{post.title}"
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              {t.deleteDialogCancel}
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                deleteMutation.mutate(post.id);
                setIsDeleteOpen(false);
                router.push(localizedPath('/admin/posts'));
              }}
            >
              {t.deleteDialogConfirm}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
