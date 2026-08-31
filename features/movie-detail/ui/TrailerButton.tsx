// features/movie-detail/ui/TrailerButton.tsx
'use client';

import { IconPlay } from '@/shared/ui/icons';

import { useModal } from '../model/useModal';
import TrailerModal from './TrailerModal';

interface TrailerButtonProps {
  trailerUrl?: string;
}

export default function TrailerButton({
  trailerUrl,
}: TrailerButtonProps) {
  const { isOpen, open, close } = useModal();

  if (!trailerUrl) {
    return null;
  }

  return (
    <>
      <button
        onClick={open}
        className="
          inline-flex items-center gap-2.5
          bg-white/10 border border-white/10
          hover:bg-white/20 hover:border-white/20
          text-white font-medium
          px-5 py-2.5 rounded-full
          transition-all duration-200
          text-sm
        "
      >
        <IconPlay className="w-4 h-4" />
        Watch Trailer
      </button>

      {isOpen && (
        <TrailerModal
          trailerUrl={trailerUrl}
          onClose={close}
        />
      )}
    </>
  );
}