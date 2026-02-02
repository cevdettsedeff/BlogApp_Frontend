import { useQuery } from '@tanstack/react-query';
import { profileService } from '@/lib/api/services';
import { useIsAuthenticated } from '@/stores/authStore';

export const profileKeys = {
  all: ['profile'] as const,
  current: () => [...profileKeys.all, 'current'] as const,
};

export function useProfile() {
  const isAuthenticated = useIsAuthenticated();

  return useQuery({
    queryKey: profileKeys.current(),
    queryFn: () => profileService.get(),
    enabled: isAuthenticated,
  });
}
