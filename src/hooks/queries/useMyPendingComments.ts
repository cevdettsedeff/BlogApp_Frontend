import { useQuery } from '@tanstack/react-query';
import { commentService } from '@/lib/api/services';

export const myPendingCommentKeys = {
  all: ['comments', 'myPending'] as const,
  list: (postId?: string, page?: number, pageSize?: number) =>
    [...myPendingCommentKeys.all, { postId, page, pageSize }] as const,
};

export function useMyPendingComments(
  postId?: string,
  page = 1,
  pageSize = 5,
  enabled = true
) {
  return useQuery({
    queryKey: myPendingCommentKeys.list(postId, page, pageSize),
    queryFn: () => commentService.listMyPending(postId, page, pageSize),
    enabled: enabled,
  });
}
