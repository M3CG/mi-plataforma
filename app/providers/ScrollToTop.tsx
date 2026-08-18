// components/ScrollToTop.tsx
'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { isScrollRestoreDeferred } from '@/lib/scroll/defer';

export default function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    // Si alguna feature marcó que quiere controlar el scroll,
    // no intervenimos.
    if (isScrollRestoreDeferred()) {
      return;
    }

    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}