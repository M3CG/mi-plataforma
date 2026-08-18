// features/filters/model/useScrollCollapse.ts
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface UseScrollCollapseOptions {
  hideAfter?: number;
  showDelta?: number;
}

export function useScrollCollapse(options?: UseScrollCollapseOptions): boolean {
  const hideAfter = options?.hideAfter ?? 150;
  const showDelta = options?.showDelta ?? 5;

  const [isCollapsed, setIsCollapsed] = useState(false);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  const handleScroll = useCallback(() => {
    if (ticking.current) return;

    ticking.current = true;

    window.requestAnimationFrame(() => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY.current && currentScrollY > hideAfter) {
        setIsCollapsed(true);
      } else if (currentScrollY < lastScrollY.current - showDelta) {
        setIsCollapsed(false);
      }

      lastScrollY.current = currentScrollY;
      ticking.current = false;
    });
  }, [hideAfter, showDelta]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  return isCollapsed;
}