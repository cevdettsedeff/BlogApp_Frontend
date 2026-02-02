'use client';

import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from '@/providers/ThemeProvider';
import { Button } from '@/components/ui/button';
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // SSR sırasında placeholder göster
  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-9 w-9">
        <Sun className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(!open)}
        className="h-9 w-9"
      >
        {resolvedTheme === 'dark' ? (
          <Moon className="h-4 w-4" />
        ) : (
          <Sun className="h-4 w-4" />
        )}
      </Button>

      {open && (
        <div className="absolute right-0 mt-2 w-36 rounded-md border bg-popover p-1 shadow-lg z-50">
          <button
            onClick={() => { setTheme('light'); setOpen(false); }}
            className={cn(
              'flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent',
              theme === 'light' && 'bg-accent'
            )}
          >
            <Sun className="h-4 w-4" />
            Açık
          </button>
          <button
            onClick={() => { setTheme('dark'); setOpen(false); }}
            className={cn(
              'flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent',
              theme === 'dark' && 'bg-accent'
            )}
          >
            <Moon className="h-4 w-4" />
            Koyu
          </button>
          <button
            onClick={() => { setTheme('system'); setOpen(false); }}
            className={cn(
              'flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent',
              theme === 'system' && 'bg-accent'
            )}
          >
            <Monitor className="h-4 w-4" />
            Sistem
          </button>
        </div>
      )}
    </div>
  );
}
