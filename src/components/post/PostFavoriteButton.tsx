'use client';

import { Heart } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToggleFavorite } from '@/hooks/mutations/useFavorites';
import { useIsFavorite } from '@/hooks/queries/useFavorites';
import { cn } from '@/lib/utils';
import { useIsAuthenticated } from '@/stores/authStore';

interface PostFavoriteStrings {
  add: string;
  remove: string;
  loginRequired: string;
  loading: string;
}

interface PostFavoriteButtonProps {
  postId: string;
  strings: PostFavoriteStrings;
}

export function PostFavoriteButton({ postId, strings }: PostFavoriteButtonProps) {
  const isAuthenticated = useIsAuthenticated();
  const { data, isLoading } = useIsFavorite(postId);
  const toggleFavorite = useToggleFavorite();
  const [authMessage, setAuthMessage] = useState<string | null>(null);

  const isFavorite = data?.isFavorite ?? false;

  const handleClick = () => {
    if (!isAuthenticated) {
      setAuthMessage(strings.loginRequired);
      window.setTimeout(() => setAuthMessage(null), 2200);
      return;
    }

    setAuthMessage(null);
    toggleFavorite.mutate({ postId, isFavorite });
  };

  const isBusy = isLoading || toggleFavorite.isPending;
  const label = isBusy ? strings.loading : isFavorite ? strings.remove : strings.add;
  const title = isAuthenticated ? label : strings.loginRequired;

  return (
    <div className="relative">
      <Button
        type="button"
        variant={isFavorite ? 'default' : 'outline'}
        size="sm"
        onClick={handleClick}
        disabled={isBusy}
        title={title}
        className="gap-2"
      >
        <Heart className={cn('h-4 w-4', isFavorite && 'fill-current')} />
        <span>{label}</span>
      </Button>
      {authMessage && (
        <p className="absolute left-0 top-full mt-1 whitespace-nowrap text-xs text-amber-600">
          {authMessage}
        </p>
      )}
    </div>
  );
}
