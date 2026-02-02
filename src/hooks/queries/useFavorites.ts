import { useQuery } from '@tanstack/react-query';
import { favoriteService } from '@/lib/api/services';
import { useIsAuthenticated } from '@/stores/authStore';

export const favoriteKeys = {
  all: ['favorites'] as const,
  lists: () => [...favoriteKeys.all, 'list'] as const,
  list: (page?: number) => [...favoriteKeys.lists(), { page }] as const,
  checks: () => [...favoriteKeys.all, 'check'] as const,
  check: (postId: string) => [...favoriteKeys.checks(), postId] as const,
};

export function useFavorites(page?: number, pageSize?: number) {
  const isAuthenticated = useIsAuthenticated();

  return useQuery({
    queryKey: favoriteKeys.list(page),
    queryFn: () => favoriteService.list({ page, pageSize }),
    enabled: isAuthenticated,
  });
}

export function useIsFavorite(postId: string) {
  const isAuthenticated = useIsAuthenticated();

  return useQuery({
    queryKey: favoriteKeys.check(postId),
    queryFn: () => favoriteService.isFavorite(postId),
    enabled: isAuthenticated && !!postId,
  });
}
