import { useQuery } from '@tanstack/react-query';
import { categoryService } from '@/lib/api/services';
import { useLocale } from '@/hooks/useLocale';
import type { Locale } from '@/lib/i18n';

export const categoryKeys = {
  all: ['categories'] as const,
  lists: () => [...categoryKeys.all, 'list'] as const,
  list: (lang: Locale) => [...categoryKeys.lists(), lang] as const,
  details: () => [...categoryKeys.all, 'detail'] as const,
  detail: (lang: Locale, slug: string) => [...categoryKeys.details(), lang, slug] as const,
};

export function useCategories(locale?: Locale) {
  const { locale: currentLocale } = useLocale();
  const lang = locale ?? currentLocale;
  return useQuery({
    queryKey: categoryKeys.list(lang),
    queryFn: () => categoryService.list(lang),
    staleTime: 5 * 60 * 1000, // 5 minutes - categories rarely change
  });
}

export function useCategory(slug: string, locale?: Locale) {
  const { locale: currentLocale } = useLocale();
  const lang = locale ?? currentLocale;
  return useQuery({
    queryKey: categoryKeys.detail(lang, slug),
    queryFn: () => categoryService.getBySlug(lang, slug),
    enabled: !!slug,
  });
}
