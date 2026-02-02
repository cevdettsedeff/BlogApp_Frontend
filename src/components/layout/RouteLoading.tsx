'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { stripLocale } from '@/lib/i18n';

const MIN_VISIBLE_MS = 350;
const MAX_VISIBLE_MS = 8000;
const START_EVENT = 'app:route-loading-start';
const STOP_EVENT = 'app:route-loading-stop';

export function startRouteLoading(href?: string, message?: string) {
  if (typeof window === 'undefined') return;
  if (href) {
    const url = new URL(href, window.location.href);
    const current = window.location.pathname + window.location.search;
    const next = url.pathname + url.search;
    if (current === next) return;
  }
  window.dispatchEvent(new CustomEvent(START_EVENT, { detail: { href, message } }));
}

export function stopRouteLoading() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(STOP_EVENT));
}

function isInternalNavigation(target: HTMLAnchorElement) {
  if (target.target && target.target !== '_self') return false;
  if (target.hasAttribute('download')) return false;
  const url = new URL(target.href, window.location.href);
  if (url.origin !== window.location.origin) return false;
  const current = window.location.pathname + window.location.search;
  const next = url.pathname + url.search;
  return current !== next;
}

interface RouteLoadingProps {
  variant?: 'overlay' | 'skeleton';
}

export function RouteLoading({ variant = 'overlay' }: RouteLoadingProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [active, setActive] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const pendingRef = useRef(false);
  const startRef = useRef(0);
  const targetPathRef = useRef<string | null>(null);
  const maxTimerRef = useRef<number | null>(null);
  const hideTimerRef = useRef<number | null>(null);

  const clearTimers = () => {
    if (maxTimerRef.current) window.clearTimeout(maxTimerRef.current);
    if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
    maxTimerRef.current = null;
    hideTimerRef.current = null;
  };

  const show = () => {
    if (active) return;
    startRef.current = Date.now();
    setActive(true);
    clearTimers();
    maxTimerRef.current = window.setTimeout(() => {
      setActive(false);
      pendingRef.current = false;
    }, MAX_VISIBLE_MS);
  };

  const hide = () => {
    if (!active) return;
    const elapsed = Date.now() - startRef.current;
    const remaining = Math.max(MIN_VISIBLE_MS - elapsed, 0);
    clearTimers();
    hideTimerRef.current = window.setTimeout(() => {
      setActive(false);
    }, remaining);
  };

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = (event.target as HTMLElement | null)?.closest('a');
      if (!target) return;
      if (!isInternalNavigation(target)) return;
      const url = new URL(target.href, window.location.href);
      targetPathRef.current = url.pathname;
      pendingRef.current = true;
      show();
    };

    const onPopState = () => {
      targetPathRef.current = window.location.pathname;
      pendingRef.current = true;
      show();
    };

    const onStart = (event: Event) => {
      const detail = (event as CustomEvent<{ href?: string; message?: string }>).detail;
      if (detail?.href) {
        const url = new URL(detail.href, window.location.href);
        const current = window.location.pathname + window.location.search;
        const next = url.pathname + url.search;
        if (current === next) return;
        targetPathRef.current = url.pathname;
      }
      setMessage(detail?.message || null);
      pendingRef.current = true;
      show();
    };

    const onStop = () => {
      pendingRef.current = false;
      setMessage(null);
      hide();
    };

    document.addEventListener('click', onClick);
    window.addEventListener('popstate', onPopState);
    window.addEventListener(START_EVENT, onStart);
    window.addEventListener(STOP_EVENT, onStop);
    return () => {
      document.removeEventListener('click', onClick);
      window.removeEventListener('popstate', onPopState);
      window.removeEventListener(START_EVENT, onStart);
      window.removeEventListener(STOP_EVENT, onStop);
      clearTimers();
    };
  }, [active]);

  useEffect(() => {
    if (!pendingRef.current) return;
    pendingRef.current = false;
    hide();
  }, [pathname, searchParams]);

  const basePath = stripLocale(targetPathRef.current ?? pathname).pathname;

  useEffect(() => {
    const root = document.documentElement;
    if (active) {
      root.setAttribute('data-route-loading', '1');
    } else {
      root.removeAttribute('data-route-loading');
    }
    return () => {
      root.removeAttribute('data-route-loading');
    };
  }, [active]);

  const renderSkeleton = () => {
    if (basePath === '/') {
      return (
        <div className="relative container py-8 space-y-8">
          <div className="h-56 md:h-72 rounded-2xl bg-muted/60 animate-pulse" />
          <div className="space-y-3 max-w-2xl">
            <div className="h-6 w-2/3 rounded bg-muted/60 animate-pulse" />
            <div className="h-4 w-full rounded bg-muted/60 animate-pulse" />
            <div className="h-4 w-5/6 rounded bg-muted/60 animate-pulse" />
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="h-44 rounded-xl bg-muted/60 animate-pulse" />
            <div className="h-44 rounded-xl bg-muted/60 animate-pulse" />
            <div className="h-44 rounded-xl bg-muted/60 animate-pulse" />
          </div>
          <div className="space-y-3 max-w-xl">
            <div className="h-5 w-1/2 rounded bg-muted/60 animate-pulse" />
            <div className="h-4 w-3/4 rounded bg-muted/60 animate-pulse" />
          </div>
        </div>
      );
    }

    if (basePath === '/categories') {
      return (
        <div className="relative container py-8 space-y-8">
          <div className="space-y-3 max-w-lg">
            <div className="h-6 w-1/2 rounded bg-muted/60 animate-pulse" />
            <div className="h-4 w-2/3 rounded bg-muted/60 animate-pulse" />
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="h-40 rounded-xl bg-muted/60 animate-pulse" />
            <div className="h-40 rounded-xl bg-muted/60 animate-pulse" />
            <div className="h-40 rounded-xl bg-muted/60 animate-pulse" />
            <div className="h-40 rounded-xl bg-muted/60 animate-pulse" />
            <div className="h-40 rounded-xl bg-muted/60 animate-pulse" />
            <div className="h-40 rounded-xl bg-muted/60 animate-pulse" />
          </div>
        </div>
      );
    }

    if (basePath.startsWith('/categories/')) {
      return (
        <div className="relative container py-8 space-y-8">
          <div className="space-y-3 max-w-xl">
            <div className="h-7 w-2/3 rounded bg-muted/60 animate-pulse" />
            <div className="h-4 w-1/2 rounded bg-muted/60 animate-pulse" />
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="h-56 rounded-xl bg-muted/60 animate-pulse" />
            <div className="h-56 rounded-xl bg-muted/60 animate-pulse" />
            <div className="h-56 rounded-xl bg-muted/60 animate-pulse" />
            <div className="h-56 rounded-xl bg-muted/60 animate-pulse" />
            <div className="h-56 rounded-xl bg-muted/60 animate-pulse" />
            <div className="h-56 rounded-xl bg-muted/60 animate-pulse" />
          </div>
        </div>
      );
    }

    if (basePath.startsWith('/posts/')) {
      return (
        <div className="relative container py-8 space-y-8">
          <div className="h-64 md:h-80 rounded-2xl bg-muted/60 animate-pulse" />
          <div className="space-y-3 max-w-3xl">
            <div className="h-8 w-3/4 rounded bg-muted/60 animate-pulse" />
            <div className="h-4 w-1/2 rounded bg-muted/60 animate-pulse" />
          </div>
          <div className="space-y-3">
            <div className="h-4 w-full rounded bg-muted/60 animate-pulse" />
            <div className="h-4 w-11/12 rounded bg-muted/60 animate-pulse" />
            <div className="h-4 w-10/12 rounded bg-muted/60 animate-pulse" />
            <div className="h-4 w-9/12 rounded bg-muted/60 animate-pulse" />
          </div>
        </div>
      );
    }

    if (basePath === '/about') {
      return (
        <div className="relative container py-8 space-y-10">
          <div className="h-56 md:h-72 rounded-2xl bg-muted/60 animate-pulse" />
          <div className="space-y-3 max-w-2xl">
            <div className="h-7 w-1/2 rounded bg-muted/60 animate-pulse" />
            <div className="h-4 w-full rounded bg-muted/60 animate-pulse" />
            <div className="h-4 w-5/6 rounded bg-muted/60 animate-pulse" />
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="h-36 rounded-xl bg-muted/60 animate-pulse" />
            <div className="h-36 rounded-xl bg-muted/60 animate-pulse" />
          </div>
        </div>
      );
    }

    if (basePath === '/favorites') {
      return (
        <div className="relative container py-8 space-y-8">
          <div className="h-7 w-48 rounded bg-muted/60 animate-pulse" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="h-56 rounded-xl bg-muted/60 animate-pulse" />
            <div className="h-56 rounded-xl bg-muted/60 animate-pulse" />
            <div className="h-56 rounded-xl bg-muted/60 animate-pulse" />
          </div>
        </div>
      );
    }

    if (basePath === '/profile') {
      return (
        <div className="relative container py-8">
          <div className="h-44 md:h-56 rounded-2xl bg-muted/60 animate-pulse" />
          <div className="mt-8 grid gap-8 md:grid-cols-[240px_1fr]">
            <div className="space-y-4">
              <div className="h-16 w-16 rounded-full bg-muted/60 animate-pulse" />
              <div className="h-4 w-32 rounded bg-muted/60 animate-pulse" />
              <div className="h-4 w-24 rounded bg-muted/60 animate-pulse" />
              <div className="h-9 w-full rounded bg-muted/60 animate-pulse" />
              <div className="h-9 w-full rounded bg-muted/60 animate-pulse" />
              <div className="h-9 w-full rounded bg-muted/60 animate-pulse" />
            </div>
            <div className="space-y-4">
              <div className="h-6 w-48 rounded bg-muted/60 animate-pulse" />
              <div className="h-10 w-full rounded bg-muted/60 animate-pulse" />
              <div className="h-10 w-full rounded bg-muted/60 animate-pulse" />
              <div className="h-10 w-40 rounded bg-muted/60 animate-pulse" />
            </div>
          </div>
        </div>
      );
    }

    if (basePath === '/login' || basePath === '/register') {
      return (
        <div className="relative container py-16 flex items-center justify-center">
          <div className="w-full max-w-lg space-y-5">
            <div className="h-7 w-1/2 mx-auto rounded bg-muted/60 animate-pulse" />
            <div className="h-4 w-2/3 mx-auto rounded bg-muted/60 animate-pulse" />
            <div className="h-10 w-full rounded bg-muted/60 animate-pulse" />
            <div className="h-10 w-full rounded bg-muted/60 animate-pulse" />
            <div className="h-10 w-full rounded bg-muted/60 animate-pulse" />
            <div className="h-10 w-full rounded bg-muted/60 animate-pulse" />
          </div>
        </div>
      );
    }

    if (basePath === '/admin') {
      return (
        <div className="relative p-6 space-y-8">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="h-24 rounded-xl bg-muted/60 animate-pulse" />
            <div className="h-24 rounded-xl bg-muted/60 animate-pulse" />
            <div className="h-24 rounded-xl bg-muted/60 animate-pulse" />
            <div className="h-24 rounded-xl bg-muted/60 animate-pulse" />
          </div>
          <div className="h-72 rounded-2xl bg-muted/60 animate-pulse" />
        </div>
      );
    }

    if (basePath === '/admin/posts') {
      return (
        <div className="relative p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-6 w-40 rounded bg-muted/60 animate-pulse" />
              <div className="h-4 w-56 rounded bg-muted/60 animate-pulse" />
            </div>
            <div className="h-10 w-36 rounded bg-muted/60 animate-pulse" />
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="h-10 rounded bg-muted/60 animate-pulse" />
            <div className="h-10 rounded bg-muted/60 animate-pulse" />
            <div className="h-10 rounded bg-muted/60 animate-pulse" />
          </div>
          <div className="space-y-3">
            <div className="h-11 rounded bg-muted/60 animate-pulse" />
            <div className="h-11 rounded bg-muted/60 animate-pulse" />
            <div className="h-11 rounded bg-muted/60 animate-pulse" />
            <div className="h-11 rounded bg-muted/60 animate-pulse" />
            <div className="h-11 rounded bg-muted/60 animate-pulse" />
          </div>
        </div>
      );
    }

    if (basePath.startsWith('/admin/posts/')) {
      return (
        <div className="relative p-6 space-y-6">
          <div className="space-y-2">
            <div className="h-7 w-64 rounded bg-muted/60 animate-pulse" />
            <div className="h-4 w-48 rounded bg-muted/60 animate-pulse" />
          </div>
          <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
            <div className="space-y-4">
              <div className="h-12 rounded bg-muted/60 animate-pulse" />
              <div className="h-12 rounded bg-muted/60 animate-pulse" />
              <div className="h-80 rounded-2xl bg-muted/60 animate-pulse" />
            </div>
            <div className="space-y-4">
              <div className="h-10 rounded bg-muted/60 animate-pulse" />
              <div className="h-10 rounded bg-muted/60 animate-pulse" />
              <div className="h-32 rounded-xl bg-muted/60 animate-pulse" />
              <div className="h-10 rounded bg-muted/60 animate-pulse" />
            </div>
          </div>
        </div>
      );
    }

    if (basePath === '/admin/categories') {
      return (
        <div className="relative p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-6 w-40 rounded bg-muted/60 animate-pulse" />
              <div className="h-4 w-56 rounded bg-muted/60 animate-pulse" />
            </div>
            <div className="h-10 w-36 rounded bg-muted/60 animate-pulse" />
          </div>
          <div className="h-10 w-64 rounded bg-muted/60 animate-pulse" />
          <div className="space-y-3">
            <div className="h-10 rounded bg-muted/60 animate-pulse" />
            <div className="h-10 rounded bg-muted/60 animate-pulse" />
            <div className="h-10 rounded bg-muted/60 animate-pulse" />
            <div className="h-10 rounded bg-muted/60 animate-pulse" />
            <div className="h-10 rounded bg-muted/60 animate-pulse" />
          </div>
        </div>
      );
    }

    if (basePath === '/admin/users') {
      return (
        <div className="relative p-6 space-y-6">
          <div className="space-y-2">
            <div className="h-6 w-40 rounded bg-muted/60 animate-pulse" />
            <div className="h-4 w-64 rounded bg-muted/60 animate-pulse" />
          </div>
          <div className="h-10 w-64 rounded bg-muted/60 animate-pulse" />
          <div className="space-y-3">
            <div className="h-12 rounded bg-muted/60 animate-pulse" />
            <div className="h-12 rounded bg-muted/60 animate-pulse" />
            <div className="h-12 rounded bg-muted/60 animate-pulse" />
            <div className="h-12 rounded bg-muted/60 animate-pulse" />
          </div>
        </div>
      );
    }

    if (basePath === '/admin/comments') {
      return (
        <div className="relative p-6 space-y-6">
          <div className="space-y-2">
            <div className="h-6 w-40 rounded bg-muted/60 animate-pulse" />
            <div className="h-4 w-64 rounded bg-muted/60 animate-pulse" />
          </div>
          <div className="grid gap-3 md:grid-cols-4">
            <div className="h-16 rounded-lg bg-muted/60 animate-pulse" />
            <div className="h-16 rounded-lg bg-muted/60 animate-pulse" />
            <div className="h-16 rounded-lg bg-muted/60 animate-pulse" />
            <div className="h-16 rounded-lg bg-muted/60 animate-pulse" />
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="h-10 w-64 rounded bg-muted/60 animate-pulse" />
            <div className="h-10 w-44 rounded bg-muted/60 animate-pulse" />
          </div>
          <div className="space-y-4">
            <div className="h-24 rounded-lg bg-muted/60 animate-pulse" />
            <div className="h-24 rounded-lg bg-muted/60 animate-pulse" />
            <div className="h-24 rounded-lg bg-muted/60 animate-pulse" />
          </div>
        </div>
      );
    }

    if (basePath === '/admin/settings') {
      return (
        <div className="relative p-6 space-y-8">
          <div className="space-y-2">
            <div className="h-6 w-56 rounded bg-muted/60 animate-pulse" />
            <div className="h-4 w-80 rounded bg-muted/60 animate-pulse" />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="h-12 rounded bg-muted/60 animate-pulse" />
            <div className="h-12 rounded bg-muted/60 animate-pulse" />
            <div className="h-12 rounded bg-muted/60 animate-pulse" />
            <div className="h-12 rounded bg-muted/60 animate-pulse" />
          </div>
          <div className="h-36 rounded-2xl bg-muted/60 animate-pulse" />
          <div className="space-y-3">
            <div className="h-10 rounded bg-muted/60 animate-pulse" />
            <div className="h-10 rounded bg-muted/60 animate-pulse" />
            <div className="h-10 rounded bg-muted/60 animate-pulse" />
          </div>
        </div>
      );
    }

    if (basePath.startsWith('/admin/')) {
      return (
        <div className="relative p-6 space-y-6">
          <div className="h-8 w-48 rounded bg-muted/60 animate-pulse" />
          <div className="space-y-3">
            <div className="h-10 w-full rounded bg-muted/60 animate-pulse" />
            <div className="h-10 w-full rounded bg-muted/60 animate-pulse" />
            <div className="h-10 w-full rounded bg-muted/60 animate-pulse" />
            <div className="h-10 w-full rounded bg-muted/60 animate-pulse" />
            <div className="h-10 w-full rounded bg-muted/60 animate-pulse" />
          </div>
        </div>
      );
    }

    return (
      <div className="relative container py-8 space-y-6">
        <div className="h-6 w-1/2 rounded bg-muted/60 animate-pulse" />
        <div className="h-4 w-full rounded bg-muted/60 animate-pulse" />
        <div className="h-4 w-5/6 rounded bg-muted/60 animate-pulse" />
      </div>
    );
  };

  if (variant === 'skeleton') {
    return (
      <div
        className={cn(
          'pointer-events-none absolute inset-0 z-40 transition-opacity duration-200',
          active ? 'opacity-100' : 'opacity-0'
        )}
        aria-hidden={!active}
      >
        <div className="absolute inset-0 bg-background" />
        {renderSkeleton()}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-background/65 backdrop-blur-sm transition-opacity duration-200',
        active ? 'opacity-100' : 'opacity-0'
      )}
      aria-hidden={!active}
    >
      <div
        className={cn(
          'flex items-center gap-3 rounded-full border border-border bg-card px-5 py-3 shadow-sm',
          active ? 'scale-100 opacity-100' : 'scale-95 opacity-0',
          'transition-all duration-200'
        )}
        role="status"
        aria-live="polite"
      >
        <span className="relative inline-flex h-4 w-4">
          <span className="absolute inset-0 animate-ping rounded-full bg-primary/40" />
          <span className="relative inline-flex h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </span>
        <span className="text-sm font-medium text-muted-foreground">
          {message || 'Yukleniyor...'}
        </span>
      </div>
    </div>
  );
}
