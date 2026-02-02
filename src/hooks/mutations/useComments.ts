import { useMutation, useQueryClient } from '@tanstack/react-query';
import { commentService } from '@/lib/api/services';
import { commentKeys } from '@/hooks/queries/useComments';
import type { CreateCommentRequest } from '@/types';

export function useCreateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCommentRequest) => commentService.create(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: commentKeys.listByPost(variables.postId),
      });
    },
  });
}
