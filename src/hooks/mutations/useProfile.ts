import { useMutation, useQueryClient } from '@tanstack/react-query';
import { profileService } from '@/lib/api/services';
import { profileKeys } from '@/hooks/queries/useProfile';
import type {
  UpdateEmailRequest,
  UpdatePasswordRequest,
  UpdateSocialsRequest,
} from '@/types';

export function useUpdateEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateEmailRequest) => profileService.updateEmail(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.current() });
    },
  });
}

export function useUpdatePassword() {
  return useMutation({
    mutationFn: (data: UpdatePasswordRequest) => profileService.updatePassword(data),
  });
}

export function useUpdateSocials() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateSocialsRequest) => profileService.updateSocials(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.current() });
    },
  });
}
