import { useQuery } from '@tanstack/react-query';
import { commentService } from '@/lib/api/services';

export const myCommentKeys = {
  all: ['comments', 'mine'] as const,
  list: (postId?: string, page?: number, pageSize?: number) =>
    [...myCommentKeys.all, { postId, page, pageSize }] as const,
};

export function useMyComments(
  postId?: string,
  page = 1,
  pageSize = 20,
  enabled = true
) {
  return useQuery({
    queryKey: myCommentKeys.list(postId, page, pageSize),
    queryFn: () => commentService.listMine(postId, page, pageSize),
    enabled,
  });
}
