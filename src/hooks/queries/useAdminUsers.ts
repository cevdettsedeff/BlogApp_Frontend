import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { adminUserService } from '@/lib/api/services/adminUserService';

export function useAdminUsers(
  page = 1,
  pageSize = 20,
  query?: string,
  role?: string
) {
  return useQuery({
    queryKey: ['admin-users', { page, pageSize, query, role }],
    queryFn: () =>
      adminUserService.list({
        page,
        pageSize,
        q: query?.trim() || undefined,
        role: role || undefined,
      }),
    placeholderData: keepPreviousData,
  });
}
