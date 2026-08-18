// features/filters/model/useStickySentinel.ts
'use client';

import { useEffect, useRef, useState } from 'react';

export function useStickySentinel<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T | null>(null);
  const [isStuck, setIsStuck] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsStuck(!entry.isIntersecting);
      },
      { threshold: 0 }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, []);

  return { ref, isStuck };
}