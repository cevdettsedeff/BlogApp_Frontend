'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { getInitials } from '@/lib/utils';
import { PostViewCount } from '@/components/post/PostViewCount';

export interface ReadingSidebarProps {
  readingTime: number;
  postId: string;
  initialViewCount: number;
  categoryName: string;
  authorName: string;
}

export function ReadingSidebar({
  readingTime,
  postId,
  initialViewCount,
  categoryName,
  authorName,
}: ReadingSidebarProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="lg:hidden fixed bottom-6 right-6 z-30">
        <Button
          type="button"
          className="rounded-full shadow-lg"
          onClick={() => setOpen(true)}
        >
          Okuma Bilgisi
        </Button>
      </div>

      {open && (
        <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setOpen(false)} />
      )}

      {/* Mobile drawer */}
      <aside
        className={`
          fixed inset-y-0 right-0 z-50 w-[20rem] translate-x-full border-l bg-background/95 p-6 shadow-2xl
          transition-transform duration-300 ease-out lg:hidden
          ${open ? 'translate-x-0' : ''}
        `}
      >
        <div className="flex items-center justify-between lg:hidden">
          <p className="text-sm font-semibold">Okuma Paneli</p>
          <Button type="button" variant="ghost" size="icon" onClick={() => setOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-4 space-y-6 lg:mt-0">
          <div className="rounded-2xl border bg-gradient-to-br from-muted/60 via-background to-background p-5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-3">
              Okuma Bilgisi
            </p>
            <div className="grid gap-3 text-sm">
              <div className="rounded-xl border bg-background/80 p-3">
                <p className="text-xs text-muted-foreground">Süre</p>
                <p className="font-semibold">{readingTime} dk</p>
              </div>
              <div className="rounded-xl border bg-background/80 p-3">
                <p className="text-xs text-muted-foreground">Görüntüleme</p>
                <p className="font-semibold">
                  <PostViewCount postId={postId} initialCount={initialViewCount} />
                </p>
              </div>
              <div className="rounded-xl border bg-background/80 p-3">
                <p className="text-xs text-muted-foreground">Kategori</p>
                <p className="font-semibold">{categoryName}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border bg-gradient-to-br from-muted/40 via-background to-background p-6">
            <div className="flex items-start gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="text-lg bg-primary text-primary-foreground">
                  {getInitials(authorName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Yazar</p>
                <h3 className="font-semibold text-lg">{authorName}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Bu yazının hazırlayanı. Yeni yazılar için takipte kalın.
                </p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span className="rounded-full border px-2 py-1">{categoryName}</span>
              <span className="rounded-full border px-2 py-1">{readingTime} dk</span>
              <span className="rounded-full border px-2 py-1">Markdown</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Desktop panel (placed in layout) */}
      <aside className="hidden lg:block w-[22rem]">
        <div className="space-y-6">
          <div className="rounded-2xl border bg-gradient-to-br from-muted/60 via-background to-background p-5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-3">
              Okuma Bilgisi
            </p>
            <div className="grid gap-3 text-sm">
              <div className="rounded-xl border bg-background/80 p-3">
                <p className="text-xs text-muted-foreground">Süre</p>
                <p className="font-semibold">{readingTime} dk</p>
              </div>
              <div className="rounded-xl border bg-background/80 p-3">
                <p className="text-xs text-muted-foreground">Görüntüleme</p>
                <p className="font-semibold">
                  <PostViewCount postId={postId} initialCount={initialViewCount} />
                </p>
              </div>
              <div className="rounded-xl border bg-background/80 p-3">
                <p className="text-xs text-muted-foreground">Kategori</p>
                <p className="font-semibold">{categoryName}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border bg-gradient-to-br from-muted/40 via-background to-background p-6">
            <div className="flex items-start gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="text-lg bg-primary text-primary-foreground">
                  {getInitials(authorName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Yazar</p>
                <h3 className="font-semibold text-lg">{authorName}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Bu yazının hazırlayanı. Yeni yazılar için takipte kalın.
                </p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span className="rounded-full border px-2 py-1">{categoryName}</span>
              <span className="rounded-full border px-2 py-1">{readingTime} dk</span>
              <span className="rounded-full border px-2 py-1">Markdown</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
