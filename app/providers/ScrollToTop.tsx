'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { isScrollRestoreDeferredFor } from '@/lib/scroll/defer';

export default function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    if (isScrollRestoreDeferredFor(pathname)) {
      return;
    }

    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
