'use client';

import { useEffect } from 'react';
import { postService } from '@/lib/api/services/postService';
import { usePublicSettings } from '@/hooks/queries/useSettings';
import type { Locale } from '@/lib/i18n';

interface PostViewTrackerProps {
  postId: string;
  locale: Locale;
  delayMs?: number;
}

const DEFAULT_DELAY_MS = 10000;
const ENV_DELAY_MS = Number(process.env.NEXT_PUBLIC_POST_VIEW_DELAY_MS);
const CONFIGURED_DELAY_MS =
  Number.isFinite(ENV_DELAY_MS) && ENV_DELAY_MS >= 0 ? ENV_DELAY_MS : DEFAULT_DELAY_MS;

export function PostViewTracker({ postId, locale, delayMs }: PostViewTrackerProps) {
  const { data: settings } = usePublicSettings(locale);
  const settingsDelayMs = settings?.viewCountDelayMs;
  const resolvedDelayMs = delayMs ?? settingsDelayMs ?? CONFIGURED_DELAY_MS;

  useEffect(() => {
    if (!postId) return;

    const key = `viewed:${postId}`;
    if (typeof window !== 'undefined' && sessionStorage.getItem(key)) return;

    const timer = window.setTimeout(() => {
      postService
        .incrementView(locale, postId)
        .then((res) => {
          if (!res || typeof res.viewCount !== 'number') return;
          window.dispatchEvent(
            new CustomEvent('post-view-updated', {
              detail: { postId, viewCount: res.viewCount },
            })
          );
        })
        .catch(() => null)
        .finally(() => {
          try {
            sessionStorage.setItem(key, '1');
          } catch {
            // ignore
          }
        });
    }, resolvedDelayMs);

    return () => window.clearTimeout(timer);
  }, [postId, locale, resolvedDelayMs]);

  return null;
}
