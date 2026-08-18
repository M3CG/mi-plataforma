'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { IconBack } from '@/shared/ui/icons';

interface BackButtonProps {
  fallbackHref: string;
}

export default function BackButton({ fallbackHref }: BackButtonProps) {
  const router = useRouter();
  const [hasHistory, setHasHistory] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      setHasHistory(true);
    }
  }, []);

  const handleBack = () => {
    if (hasHistory) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  };

  return (
    <button
      onClick={handleBack}
      className="inline-flex items-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-gray-300 hover:text-white rounded-full px-4 py-2 text-sm font-medium transition-all duration-200"
    >
      <IconBack />
      Volver
    </button>
  );
}
