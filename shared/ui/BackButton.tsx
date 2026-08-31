'use client';

import { useRouter } from 'next/navigation';
import { IconBack } from '@/shared/ui/icons';

interface BackButtonProps {
  fallbackHref: string;
}

/**
 * Botón "Volver" genérico.
 *
 * Usa history.back() cuando existe historial previo;
 * si no, redirige al fallback proporcionado por quien lo consume.
 *
 * La verificación de window.history.length se hace en el handler,
 * no en un useEffect, para evitar renders innecesarios.
 */
export default function BackButton({ fallbackHref }: BackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
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
      Back
    </button>
  );
}
