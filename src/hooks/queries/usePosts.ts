import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { postService } from '@/lib/api/services';
import type { PostListQuery } from '@/types';

export const postKeys = {
  all: ['posts'] as const,
  lists: () => [...postKeys.all, 'list'] as const,
  list: (filters: PostListQuery) => [...postKeys.lists(), filters] as const,
  details: () => [...postKeys.all, 'detail'] as const,
  detail: (slug: string) => [...postKeys.details(), slug] as const,
};

export function usePosts(query?: PostListQuery) {
  return useQuery({
    queryKey: postKeys.list(query || {}),
    queryFn: () => postService.list(query),
  });
}

export function useInfinitePosts(query?: Omit<PostListQuery, 'page'>) {
  return useInfiniteQuery({
    queryKey: postKeys.list({ ...query, page: 0 }),
    queryFn: ({ pageParam = 1 }) =>
      postService.list({ ...query, page: pageParam }),
    getNextPageParam: (lastPage) => {
      const totalPages = Math.ceil(lastPage.totalCount / lastPage.pageSize);
      return lastPage.page < totalPages ? lastPage.page + 1 : undefined;
    },
    initialPageParam: 1,
  });
}

export function usePost(slug: string) {
  return useQuery({
    queryKey: postKeys.detail(slug),
    queryFn: () => postService.getBySlug(slug),
    enabled: !!slug,
  });
}
