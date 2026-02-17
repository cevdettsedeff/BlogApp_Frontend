'use client';

import { useEffect, useRef, useState } from 'react';
import { ReadingSidebar, type ReadingSidebarProps } from '@/components/post/ReadingSidebar';

export function FixedReadingSidebar(props: ReadingSidebarProps) {
  const slotRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ left: number; top: number; width: number } | null>(null);

  useEffect(() => {
    let frameId = 0;

    const updatePosition = () => {
      if (!slotRef.current) return;
      const { left, top, width } = slotRef.current.getBoundingClientRect();

      setPosition({
        left: Math.round(left),
        top: Math.round(top),
        width: Math.round(width),
      });
    };

    const scheduleUpdate = () => {
      cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(updatePosition);
    };

    scheduleUpdate();
    window.addEventListener('resize', scheduleUpdate);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', scheduleUpdate);
    };
  }, []);

  return (
    <div className="hidden lg:block">
      <div ref={slotRef} className="w-[22rem]" />
      <div
        className="fixed"
        style={
          position === null
            ? undefined
            : {
                left: `${position.left}px`,
                top: `${position.top}px`,
                width: `${position.width}px`,
              }
        }
      >
        <ReadingSidebar {...props} />
      </div>
    </div>
  );
}
