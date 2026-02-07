import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { postService } from '@/lib/api/services';
import { useLocale } from '@/hooks/useLocale';
import type { Locale } from '@/lib/i18n';
import type { PostListQuery } from '@/types';

export const postKeys = {
  all: ['posts'] as const,
  lists: () => [...postKeys.all, 'list'] as const,
  list: (lang: Locale, filters: PostListQuery) =>
    [...postKeys.lists(), lang, filters] as const,
  details: () => [...postKeys.all, 'detail'] as const,
  detail: (lang: Locale, slug: string) => [...postKeys.details(), lang, slug] as const,
};

export function usePosts(query?: PostListQuery, locale?: Locale) {
  const { locale: currentLocale } = useLocale();
  const lang = locale ?? currentLocale;
  return useQuery({
    queryKey: postKeys.list(lang, query || {}),
    queryFn: () => postService.list(lang, query),
  });
}

export function useInfinitePosts(query?: Omit<PostListQuery, 'page'>, locale?: Locale) {
  const { locale: currentLocale } = useLocale();
  const lang = locale ?? currentLocale;
  return useInfiniteQuery({
    queryKey: postKeys.list(lang, { ...query, page: 0 }),
    queryFn: ({ pageParam = 1 }) =>
      postService.list(lang, { ...query, page: pageParam }),
    getNextPageParam: (lastPage) => {
      const totalPages = Math.ceil(lastPage.totalCount / lastPage.pageSize);
      return lastPage.page < totalPages ? lastPage.page + 1 : undefined;
    },
    initialPageParam: 1,
  });
}

export function usePost(slug: string, locale?: Locale) {
  const { locale: currentLocale } = useLocale();
  const lang = locale ?? currentLocale;
  return useQuery({
    queryKey: postKeys.detail(lang, slug),
    queryFn: () => postService.getBySlug(lang, slug),
    enabled: !!slug,
  });
}
