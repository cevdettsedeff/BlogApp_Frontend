import { useQuery } from '@tanstack/react-query';
import { supportRequestService } from '@/lib/api/services/supportRequestService';

export function useAdminSupportRequests(page = 1, pageSize = 20) {
  return useQuery({
    queryKey: ['admin-support-requests', { page, pageSize }],
    queryFn: () => supportRequestService.listAdmin({ page, pageSize }),
    keepPreviousData: true,
  });
}

