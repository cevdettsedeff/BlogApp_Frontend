import { useQuery } from '@tanstack/react-query';
import { settingsService } from '@/lib/api/services';

export const settingsKeys = {
  all: ['settings'] as const,
  public: () => [...settingsKeys.all, 'public'] as const,
};

export function usePublicSettings() {
  return useQuery({
    queryKey: settingsKeys.public(),
    queryFn: () => settingsService.getPublic(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
