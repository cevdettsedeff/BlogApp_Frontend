import { useMutation, useQueryClient } from '@tanstack/react-query';
import { favoriteService } from '@/lib/api/services';
import { favoriteKeys } from '@/hooks/queries/useFavorites';

export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, isFavorite }: { postId: string; isFavorite: boolean }) => {
      if (isFavorite) {
        return favoriteService.remove(postId);
      } else {
        return favoriteService.add({ postId });
      }
    },
    onMutate: async ({ postId, isFavorite }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: favoriteKeys.check(postId) });

      // Snapshot the previous value
      const previousValue = queryClient.getQueryData(favoriteKeys.check(postId));

      // Optimistically update
      queryClient.setQueryData(favoriteKeys.check(postId), {
        isFavorite: !isFavorite,
      });

      return { previousValue, postId };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousValue) {
        queryClient.setQueryData(
          favoriteKeys.check(context.postId),
          context.previousValue
        );
      }
    },
    onSettled: (data, error, variables) => {
      // Refetch after mutation
      queryClient.invalidateQueries({ queryKey: favoriteKeys.check(variables.postId) });
      queryClient.invalidateQueries({ queryKey: favoriteKeys.lists() });
    },
  });
}

export function useAddFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => favoriteService.add({ postId }),
    onSuccess: (_, postId) => {
      queryClient.invalidateQueries({ queryKey: favoriteKeys.check(postId) });
      queryClient.invalidateQueries({ queryKey: favoriteKeys.lists() });
    },
  });
}

export function useRemoveFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => favoriteService.remove(postId),
    onSuccess: (_, postId) => {
      queryClient.invalidateQueries({ queryKey: favoriteKeys.check(postId) });
      queryClient.invalidateQueries({ queryKey: favoriteKeys.lists() });
    },
  });
}
