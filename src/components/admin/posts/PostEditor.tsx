'use client';

import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Bold, Italic, List, ListOrdered, Quote, Heading2, Heading3, Image, Code } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { adminPostService } from '@/lib/api/services/adminPostService';
import { adminCategoryService } from '@/lib/api/services/adminCategoryService';
import { useUser } from '@/stores/authStore';
import type { CategoryDto, CreatePostRequest, UpdatePostRequest } from '@/types';
import { getReadingTime, renderMarkdown } from './markdown';

interface PostFormState {
  title: string;
  summary: string;
  content: string;
  categoryId: string;
  coverImageUrl: string;
}

const defaultForm: PostFormState = {
  title: '',
  summary: '',
  content: '',
  categoryId: '',
  coverImageUrl: '',
};

interface PostEditorProps {
  mode: 'create' | 'edit';
  postId?: string;
}

export function PostEditor({ mode, postId }: PostEditorProps) {
  const router = useRouter();
  const { locale } = useLocale();
  const user = useUser();
  const messages = getMessages(locale);
  const t = messages.adminPosts;
  const queryClient = useQueryClient();

  const { data: categories = [] } = useQuery({
    queryKey: ['admin-categories', locale],
    queryFn: () => adminCategoryService.list(locale),
    staleTime: 5 * 60 * 1000,
  });

  const { data: existingPost, isLoading: isPostLoading } = useQuery({
    queryKey: ['admin-post', postId],
    queryFn: () => adminPostService.getById(postId as string),
    enabled: mode === 'edit' && Boolean(postId),
  });

  const [formState, setFormState] = useState<PostFormState>(defaultForm);
  const [contentMode, setContentMode] = useState<'split' | 'edit' | 'preview'>('split');
  const [codeLanguage, setCodeLanguage] = useState('text');
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const contentRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (mode === 'edit' && existingPost) {
      setFormState({
        title: existingPost.title ?? '',
        summary: existingPost.summary ?? '',
        content: existingPost.content ?? '',
        categoryId: existingPost.categoryId ?? '',
        coverImageUrl: existingPost.coverImageUrl ?? '',
      });
    }
  }, [mode, existingPost]);

  const updateContent = (value: string, selectionStart?: number, selectionEnd?: number) => {
    setFormState((prev) => ({ ...prev, content: value }));
    if (selectionStart === undefined || selectionEnd === undefined) return;
    requestAnimationFrame(() => {
      const element = contentRef.current;
      if (!element) return;
      element.focus();
      element.setSelectionRange(selectionStart, selectionEnd);
    });
  };

  const getActiveRange = (value: string, start: number, end: number) => {
    if (start !== end) {
      return { start, end };
    }
    const lineStart = value.lastIndexOf('\n', start - 1) + 1;
    const lineEndIndex = value.indexOf('\n', start);
    const lineEnd = lineEndIndex === -1 ? value.length : lineEndIndex;
    return { start: lineStart, end: lineEnd };
  };

  const wrapSelection = (prefix: string, suffix = prefix) => {
    const element = contentRef.current;
    if (!element) return;
    const { selectionStart, selectionEnd, value } = element;
    const selected = value.slice(selectionStart, selectionEnd);
    const nextValue =
      value.slice(0, selectionStart) + prefix + selected + suffix + value.slice(selectionEnd);
    const nextStart = selectionStart + prefix.length;
    const nextEnd = selectionEnd + prefix.length;
    updateContent(nextValue, nextStart, nextEnd);
  };

  const prefixLines = (type: 'unordered' | 'ordered') => {
    const element = contentRef.current;
    if (!element) return;
    const { selectionStart, selectionEnd, value } = element;
    const range = getActiveRange(value, selectionStart, selectionEnd);
    const selected = value.slice(range.start, range.end);
    const lines = selected.split('\n');
    let number = 1;
    const nextLines = lines.map((line) => {
      const trimmed = line.replace(/^(\d+\.\s+|[-*]\s+)/, '');
      if (!trimmed.trim()) {
        return line;
      }
      if (type === 'ordered') {
        return `${number++}. ${trimmed}`;
      }
      return `- ${trimmed}`;
    });
    const nextBlock = nextLines.join('\n');
    const nextValue = value.slice(0, range.start) + nextBlock + value.slice(range.end);
    updateContent(nextValue, range.start, range.start + nextBlock.length);
  };

  const prefixQuote = () => {
    const element = contentRef.current;
    if (!element) return;
    const { selectionStart, selectionEnd, value } = element;
    const range = getActiveRange(value, selectionStart, selectionEnd);
    const selected = value.slice(range.start, range.end);
    const lines = selected.split('\n');
    const nextLines = lines.map((line) => {
      if (!line.trim()) return line;
      return line.replace(/^>\s+/, '');
    });
    const quoted = nextLines.map((line) => (line.trim() ? `> ${line}` : line)).join('\n');
    const nextValue = value.slice(0, range.start) + quoted + value.slice(range.end);
    updateContent(nextValue, range.start, range.start + quoted.length);
  };

  const adjustHeading = (direction: 'up' | 'down') => {
    const element = contentRef.current;
    if (!element) return;
    const { selectionStart, selectionEnd, value } = element;
    const range = getActiveRange(value, selectionStart, selectionEnd);
    const selected = value.slice(range.start, range.end);
    const lines = selected.split('\n');
    const nextLines = lines.map((line) => {
      const match = line.match(/^(#{1,6})\s+(.*)$/);
      const content = match ? match[2] : line.trim();
      const level = match ? match[1].length : 0;

      if (!content) return line;

      if (direction === 'up') {
        if (level === 0) {
          return `## ${line.trim()}`;
        }
        return `${'#'.repeat(Math.max(1, level - 1))} ${content}`;
      }

      if (level === 0) {
        return `### ${line.trim()}`;
      }
      return `${'#'.repeat(Math.min(6, level + 1))} ${content}`;
    });
    const nextBlock = nextLines.join('\n');
    const nextValue = value.slice(0, range.start) + nextBlock + value.slice(range.end);
    updateContent(nextValue, range.start, range.start + nextBlock.length);
  };

  const insertImage = () => {
    const element = contentRef.current;
    if (!element) return;
    const { selectionStart, selectionEnd, value } = element;
    const selected = value.slice(selectionStart, selectionEnd).trim();
    const altText = selected || 'görsel-açıklama';
    const urlText = 'https://...';
    const template = `![${altText}](${urlText})`;
    const nextValue = value.slice(0, selectionStart) + template + value.slice(selectionEnd);
    const urlStart = selectionStart + template.indexOf(urlText);
    const urlEnd = urlStart + urlText.length;
    updateContent(nextValue, urlStart, urlEnd);
  };

  const insertCodeBlock = () => {
    const element = contentRef.current;
    if (!element) return;
    const { selectionStart, selectionEnd, value } = element;
    const selected = value.slice(selectionStart, selectionEnd);
    const content = selected || 'kod';
    const lang = codeLanguage === 'text' ? '' : codeLanguage;
    const template = `\n\`\`\`${lang}\n${content}\n\`\`\`\n`;
    const nextValue = value.slice(0, selectionStart) + template + value.slice(selectionEnd);
    const contentStart = selectionStart + template.indexOf(content);
    const contentEnd = contentStart + content.length;
    updateContent(nextValue, contentStart, contentEnd);
  };

  const handleContentKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const modifier = event.metaKey || event.ctrlKey;
    if (!modifier) return;

    if (event.key.toLowerCase() === 'b') {
      event.preventDefault();
      wrapSelection('**');
      return;
    }

    if (event.key.toLowerCase() === 'i') {
      event.preventDefault();
      wrapSelection('*');
      return;
    }

    if (event.shiftKey && event.key === '8') {
      event.preventDefault();
      prefixLines('unordered');
      return;
    }

    if (event.shiftKey && event.key === '7') {
      event.preventDefault();
      prefixLines('ordered');
      return;
    }

    if (event.shiftKey && (event.key === '.' || event.key === '>')) {
      event.preventDefault();
      adjustHeading('up');
      return;
    }

    if (event.shiftKey && (event.key === ',' || event.key === '<')) {
      event.preventDefault();
      adjustHeading('down');
      return;
    }

    if (event.shiftKey && event.key.toLowerCase() === 'q') {
      event.preventDefault();
      prefixQuote();
    }
  };

  const localizedPath = (href: string) => addLocaleToPath(href, locale);

  const createMutation = useMutation({
    mutationFn: (data: CreatePostRequest) => adminPostService.create(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; payload: UpdatePostRequest }) =>
      adminPostService.update(data.id, data.payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
      await queryClient.invalidateQueries({ queryKey: ['admin-post', postId] });
    },
  });

  const canSubmit =
    formState.title.trim() &&
    formState.summary.trim() &&
    formState.content.trim() &&
    formState.categoryId &&
    (mode === 'edit' || Boolean(user?.authorId));

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canSubmit) return;

    if (mode === 'create') {
      const payload: CreatePostRequest = {
        title: formState.title,
        summary: formState.summary,
        content: formState.content,
        categoryId: formState.categoryId,
        authorId: user?.authorId || '',
        coverImageUrl: formState.coverImageUrl || null,
        language: locale,
      };
      createMutation.mutate(payload, {
        onSuccess: () => router.push(localizedPath('/admin/posts')),
      });
    }

    if (mode === 'edit' && postId) {
      const payload: UpdatePostRequest = {
        title: formState.title,
        summary: formState.summary,
        content: formState.content,
        categoryId: formState.categoryId,
        coverImageUrl: formState.coverImageUrl || null,
        language: locale,
      };
      updateMutation.mutate(
        { id: postId, payload },
        { onSuccess: () => router.push(localizedPath(`/admin/posts/${postId}`)) }
      );
    }
  };

  if (mode === 'edit' && isPostLoading) {
    return <div className="text-sm text-muted-foreground">Yükleniyor...</div>;
  }

  if (mode === 'edit' && !existingPost) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={localizedPath('/admin/posts')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t.backToList}
            </Link>
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">{t.notFound}</p>
      </div>
    );
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="space-y-3">
        <h1 className="text-2xl font-bold">
          {mode === 'create' ? t.createTitle : t.editTitle}
        </h1>
        <div className="flex flex-col gap-2">
          <div>
            <Button asChild variant="outline">
              <Link href={localizedPath('/admin/posts')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t.backToList}
              </Link>
            </Button>
          </div>
          <p className="text-muted-foreground">
            {mode === 'create' ? t.createSubtitle : t.editSubtitle}
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="post-title">{t.fieldTitle}</Label>
          <Input
            id="post-title"
            value={formState.title}
            onChange={(event) =>
              setFormState((prev) => ({ ...prev, title: event.target.value }))
            }
            placeholder={t.titlePlaceholder}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="post-summary">{t.fieldSummary}</Label>
          <textarea
            id="post-summary"
            className="min-h-[140px] w-full rounded-md border bg-background px-3 py-2 text-sm"
            value={formState.summary}
            onChange={(event) =>
              setFormState((prev) => ({ ...prev, summary: event.target.value }))
            }
            placeholder={t.summaryPlaceholder}
          />
        </div>
        {mode === 'edit' && (
          <div className="space-y-2">
            <Label htmlFor="post-slug">{t.fieldSlug}</Label>
            <Input
              id="post-slug"
              value={existingPost?.slug ?? ''}
              disabled
            />
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="post-category">{t.fieldCategory}</Label>
          <select
            id="post-category"
            className="h-10 w-full rounded-md border bg-background px-3 text-sm"
            value={formState.categoryId}
            onChange={(event) =>
              setFormState((prev) => ({ ...prev, categoryId: event.target.value }))
            }
          >
            <option value="">{t.categoryPlaceholder}</option>
            {categories.map((category: CategoryDto) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        {mode === 'edit' && (
          <div className="space-y-2">
            <Label htmlFor="post-status">{t.fieldStatus}</Label>
            <Input id="post-status" value={existingPost?.status ?? ''} disabled />
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="post-cover">{t.fieldCoverUrl}</Label>
          <Input
            id="post-cover"
            value={formState.coverImageUrl}
            onChange={(event) =>
              setFormState((prev) => ({ ...prev, coverImageUrl: event.target.value }))
            }
            placeholder={t.coverPlaceholder}
          />
        </div>
        {formState.coverImageUrl && (
          <div className="overflow-hidden rounded-md border">
            <img src={formState.coverImageUrl} alt={formState.title} className="h-72 w-full object-cover" />
          </div>
        )}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Label htmlFor="post-content">{t.fieldContentMarkdown}</Label>
            <div className="flex gap-2 text-xs">
              <Button
                type="button"
                variant={contentMode === 'edit' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setContentMode('edit')}
              >
                {t.contentModeEdit}
              </Button>
              <Button
                type="button"
                variant={contentMode === 'preview' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setContentMode('preview')}
              >
                {t.contentModePreview}
              </Button>
              <Button
                type="button"
                variant={contentMode === 'split' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setContentMode('split')}
              >
                {t.contentModeSplit}
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 border rounded-md bg-muted/30 p-2 text-xs">
            <Button type="button" variant="ghost" size="sm" onClick={() => wrapSelection('**')} title={t.shortcutBold}>
              <Bold className="h-4 w-4 mr-1" />
              {t.toolbarBold}
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => wrapSelection('*')} title={t.shortcutItalic}>
              <Italic className="h-4 w-4 mr-1" />
              {t.toolbarItalic}
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => adjustHeading('up')} title={t.shortcutHeadingUp}>
              <Heading2 className="h-4 w-4 mr-1" />
              {t.toolbarBigger}
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => adjustHeading('down')} title={t.shortcutHeadingDown}>
              <Heading3 className="h-4 w-4 mr-1" />
              {t.toolbarSmaller}
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => prefixLines('unordered')} title={t.shortcutBullets}>
              <List className="h-4 w-4 mr-1" />
              {t.toolbarBullets}
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => prefixLines('ordered')} title={t.shortcutNumbered}>
              <ListOrdered className="h-4 w-4 mr-1" />
              {t.toolbarNumbered}
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={prefixQuote} title={t.shortcutQuote}>
              <Quote className="h-4 w-4 mr-1" />
              {t.toolbarQuote}
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={insertImage} title={t.shortcutImage}>
              <Image className="h-4 w-4 mr-1" />
              {t.toolbarImage}
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={insertCodeBlock} title={t.shortcutCode}>
              <Code className="h-4 w-4 mr-1" />
              {t.toolbarCode}
            </Button>
            <div className="flex items-center gap-2 rounded-md border bg-background px-2 py-1 text-xs text-muted-foreground">
              <span className="text-foreground">{t.toolbarCodeLang || 'Kod dili'}</span>
              <select
                className="h-7 min-w-[120px] rounded-md border bg-background px-2 text-xs text-foreground"
                value={codeLanguage}
                onChange={(event) => setCodeLanguage(event.target.value)}
                aria-label={t.toolbarCodeLang || 'Kod dili'}
                style={{
                  color: 'hsl(var(--foreground))',
                  backgroundColor: 'hsl(var(--background))',
                }}
              >
                <option value="text">{t.codeLangText || 'Metin'}</option>
                <option value="js">{t.codeLangJs || 'JavaScript'}</option>
                <option value="ts">{t.codeLangTs || 'TypeScript'}</option>
                <option value="html">{t.codeLangHtml || 'HTML'}</option>
                <option value="css">{t.codeLangCss || 'CSS'}</option>
                <option value="json">{t.codeLangJson || 'JSON'}</option>
                <option value="bash">{t.codeLangBash || 'Bash'}</option>
                <option value="python">{t.codeLangPython || 'Python'}</option>
              </select>
            </div>
          </div>
          <div
            className={`grid gap-3 ${contentMode === 'split' ? 'md:grid-cols-2' : 'grid-cols-1'}`}
          >
            {(contentMode === 'edit' || contentMode === 'split') && (
              <textarea
                id="post-content"
                className="min-h-[220px] w-full rounded-md border bg-background px-3 py-2 text-sm"
                ref={contentRef}
                value={formState.content}
                onKeyDown={handleContentKeyDown}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, content: event.target.value }))
                }
                placeholder={t.contentPlaceholder}
              />
            )}
            {(contentMode === 'preview' || contentMode === 'split') && (
              <div className="min-h-[220px] w-full rounded-md border bg-background p-3 text-sm">
                {formState.content ? (
                  <div className="space-y-3">{renderMarkdown(formState.content)}</div>
                ) : (
                  <p className="text-muted-foreground">{t.previewEmpty}</p>
                )}
              </div>
            )}
          </div>
          <div className="rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground">
            {t.readingTimeEstimateLabel} {getReadingTime(formState.content)} dk
          </div>
        </div>
      </div>

      {!user?.authorId && mode === 'create' && (
        <div className="rounded-lg border p-3 text-xs text-amber-600">
          Yazar profili bulunamadı. Yeni yazı oluşturmak için authorId gerekli.
        </div>
      )}

      <div className="sticky bottom-6 z-20">
        <div className="flex items-center justify-end gap-2 bg-background/95 px-4 py-3 backdrop-blur">
          <Button type="button" variant="outline" onClick={() => setIsCancelOpen(true)}>
            {t.cancel}
          </Button>
          <Button type="submit" disabled={!canSubmit || createMutation.isPending || updateMutation.isPending}>
            {t.save}
          </Button>
        </div>
      </div>

      <Dialog open={isCancelOpen} onOpenChange={setIsCancelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.cancelDialogTitle}</DialogTitle>
            <DialogDescription>{t.cancelDialogBody}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCancelOpen(false)}>
              {t.cancelDialogStay}
            </Button>
            <Button
              variant="destructive"
              onClick={() => router.push(localizedPath('/admin/posts'))}
            >
              {t.cancelDialogLeave}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </form>
  );
}
