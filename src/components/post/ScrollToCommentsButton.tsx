'use client';

import { Button } from '@/components/ui/button';

interface ScrollToCommentsButtonProps {
  label: string;
  targetId?: string;
}

export function ScrollToCommentsButton({
  label,
  targetId = 'post-comments',
}: ScrollToCommentsButtonProps) {
  const handleClick = () => {
    const element = document.getElementById(targetId);
    if (!element) return;

    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    element.classList.add(
      'ring-4',
      'ring-primary/35',
      'ring-offset-4',
      'ring-offset-background',
      'rounded-2xl'
    );

    window.setTimeout(() => {
      element.classList.remove(
        'ring-4',
        'ring-primary/35',
        'ring-offset-4',
        'ring-offset-background',
        'rounded-2xl'
      );
    }, 1100);
  };

  return (
    <Button type="button" variant="outline" size="sm" onClick={handleClick}>
      {label}
    </Button>
  );
}
