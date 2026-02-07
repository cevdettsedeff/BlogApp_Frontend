'use client';

import { useEffect, useState } from 'react';

interface PostViewCountProps {
  postId: string;
  initialCount: number;
  className?: string;
}

interface PostViewUpdatedDetail {
  postId: string;
  viewCount: number;
}

export function PostViewCount({ postId, initialCount, className }: PostViewCountProps) {
  const [count, setCount] = useState(initialCount);

  useEffect(() => {
    setCount(initialCount);
  }, [initialCount, postId]);

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<PostViewUpdatedDetail>).detail;
      if (!detail || detail.postId !== postId) return;
      setCount(detail.viewCount);
    };

    window.addEventListener('post-view-updated', handler as EventListener);
    return () => window.removeEventListener('post-view-updated', handler as EventListener);
  }, [postId]);

  return <span className={className}>{count}</span>;
}
