// features/catalog/model/useInfiniteScroll.ts
'use client';

import { useEffect, useRef } from 'react';

import {
  INFINITE_SCROLL_ROOT_MARGIN,
  INFINITE_SCROLL_THRESHOLD,
} from '../config/grid';

interface UseInfiniteScrollProps {
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
}

export function useInfiniteScroll({
  hasMore,
  isLoading,
  onLoadMore,
}: UseInfiniteScrollProps) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = sentinelRef.current;

    if (!node || !hasMore || isLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore();
        }
      },
      {
        rootMargin: INFINITE_SCROLL_ROOT_MARGIN,
        threshold: INFINITE_SCROLL_THRESHOLD,
      }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [hasMore, isLoading, onLoadMore]);

  return sentinelRef;
}