import { useQuery } from '@tanstack/react-query';
import { categoryService } from '@/lib/api/services';

export const categoryKeys = {
  all: ['categories'] as const,
  lists: () => [...categoryKeys.all, 'list'] as const,
  list: () => [...categoryKeys.lists()] as const,
  details: () => [...categoryKeys.all, 'detail'] as const,
  detail: (slug: string) => [...categoryKeys.details(), slug] as const,
};

export function useCategories() {
  return useQuery({
    queryKey: categoryKeys.list(),
    queryFn: () => categoryService.list(),
    staleTime: 5 * 60 * 1000, // 5 minutes - categories rarely change
  });
}

export function useCategory(slug: string) {
  return useQuery({
    queryKey: categoryKeys.detail(slug),
    queryFn: () => categoryService.getBySlug(slug),
    enabled: !!slug,
  });
}
