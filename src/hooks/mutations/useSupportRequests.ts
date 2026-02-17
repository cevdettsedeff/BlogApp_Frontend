import { useMutation } from '@tanstack/react-query';
import { supportRequestService } from '@/lib/api/services/supportRequestService';
import type { CreateSupportRequestRequest } from '@/types';

export function useCreateSupportRequest() {
  return useMutation({
    mutationFn: (data: CreateSupportRequestRequest) => supportRequestService.create(data),
  });
}

