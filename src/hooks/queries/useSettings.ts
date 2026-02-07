import { useQuery } from '@tanstack/react-query';
import { settingsService } from '@/lib/api/services';
import { useLocale } from '@/hooks/useLocale';
import type { Locale } from '@/lib/i18n';

export const settingsKeys = {
  all: ['settings'] as const,
  public: (lang: Locale) => [...settingsKeys.all, 'public', lang] as const,
};

export function usePublicSettings(locale?: Locale) {
  const { locale: currentLocale } = useLocale();
  const lang = locale ?? currentLocale;
  return useQuery({
    queryKey: settingsKeys.public(lang),
    queryFn: () => settingsService.getPublic(lang),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
