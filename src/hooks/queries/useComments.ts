import { useQuery } from '@tanstack/react-query';
import { commentService } from '@/lib/api/services';

export const commentKeys = {
  all: ['comments'] as const,
  lists: () => [...commentKeys.all, 'list'] as const,
  listByPost: (postId: string) => [...commentKeys.lists(), { postId }] as const,
};

export function useComments(postId: string) {
  return useQuery({
    queryKey: commentKeys.listByPost(postId),
    queryFn: () => commentService.listByPost(postId),
    enabled: !!postId,
  });
}
