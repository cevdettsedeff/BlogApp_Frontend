'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { useAdminPostsStore } from '@/stores/adminPostsStore';

export default function AdminPostsPage() {
  const { locale } = useLocale();
  const messages = getMessages(locale);
  const t = messages.adminPosts;

  const posts = useAdminPostsStore((state) => state.posts);
  const deletePost = useAdminPostsStore((state) => state.deletePost);

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesSearch =
        post.title.toLowerCase().includes(search.toLowerCase()) ||
        post.slug.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter ? post.categoryName === categoryFilter : true;
      const matchesStatus = statusFilter ? post.status === statusFilter : true;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [posts, search, categoryFilter, statusFilter]);

  const localizedPath = (href: string) => addLocaleToPath(href, locale);

  const deleteTarget = useMemo(
    () => posts.find((post) => post.id === deleteTargetId) ?? null,
    [posts, deleteTargetId]
  );

  const confirmDelete = () => {
    if (!deleteTargetId) return;
    deletePost(deleteTargetId);
    setDeleteTargetId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t.title}</h1>
          <p className="text-muted-foreground">{t.subtitle}</p>
        </div>
        <Button asChild>
          <Link href={localizedPath('/admin/posts/new')}>
            <Plus className="h-4 w-4 mr-2" />
            {t.newPost}
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t.searchPlaceholder}
            className="pl-10"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <select
            className="h-10 rounded-md border bg-background px-3 text-sm"
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
          >
            <option value="">{t.allCategories}</option>
            <option value="Teknoloji">{t.categoryTech}</option>
            <option value="Gezi">{t.categoryTravel}</option>
            <option value="Kariyer">{t.categoryCareer}</option>
          </select>
          <select
            className="h-10 rounded-md border bg-background px-3 text-sm"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="">{t.allStatuses}</option>
            <option value="Published">{t.statusPublished}</option>
            <option value="Draft">{t.statusDraft}</option>
          </select>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium">{t.tableTitle}</th>
              <th className="text-left px-4 py-3 text-sm font-medium">{t.tableCategory}</th>
              <th className="text-left px-4 py-3 text-sm font-medium">{t.tableStatus}</th>
              <th className="text-left px-4 py-3 text-sm font-medium">{t.tableAuthor}</th>
              <th className="text-left px-4 py-3 text-sm font-medium">{t.tableDate}</th>
              <th className="text-right px-4 py-3 text-sm font-medium">{t.tableActions}</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredPosts.map((post) => (
              <tr key={post.id} className="hover:bg-muted/30">
                <td className="px-4 py-3">
                  <p className="font-medium line-clamp-1">{post.title}</p>
                </td>
                <td className="px-4 py-3">
                  <Badge variant="secondary">{post.categoryName}</Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge
                    variant={post.status === 'Published' ? 'default' : 'outline'}
                    className={post.status === 'Published' ? 'bg-green-500' : ''}
                  >
                    {post.status === 'Published' ? t.statusPublished : t.statusDraft}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {post.authorDisplayName}
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {formatDate(post.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                      <Link
                        href={localizedPath(`/admin/posts/${post.id}`)}
                        aria-label={t.actionView}
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                      <Link
                        href={localizedPath(`/admin/posts/${post.id}/edit`)}
                        aria-label={t.actionEdit}
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => setDeleteTargetId(post.id)}
                      aria-label={t.actionDelete}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredPosts.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  {t.empty}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {t.totalLabel} {filteredPosts.length} {t.totalUnit}
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled>
            {t.prev}
          </Button>
          <Button variant="outline" size="sm" disabled>
            {t.next}
          </Button>
        </div>
      </div>

      <Dialog open={Boolean(deleteTargetId)} onOpenChange={(open) => !open && setDeleteTargetId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.deleteDialogTitle}</DialogTitle>
            <DialogDescription>
              {t.deleteDialogBody}{' '}
              {deleteTarget ? `"${deleteTarget.title}"` : ''}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTargetId(null)}>
              {t.deleteDialogCancel}
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              {t.deleteDialogConfirm}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
