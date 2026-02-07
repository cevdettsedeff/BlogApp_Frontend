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
    queryFn: async () => {
      const roots = await commentService.listByPost(postId);
      const withReplies = await Promise.all(
        roots.map(async (comment) => ({
          ...comment,
          replies: await commentService.listReplies(comment.id),
        }))
      );
      return withReplies;
    },
    enabled: !!postId,
  });
}
