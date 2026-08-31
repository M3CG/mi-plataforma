// features/movie-detail/ui/TrailerModal.tsx
'use client';

import { IconClose } from '@/shared/ui/icons';

interface TrailerModalProps {
  trailerUrl: string;
  onClose: () => void;
}

export default function TrailerModal({
  trailerUrl,
  onClose,
}: TrailerModalProps) {
  const autoplayUrl = `${trailerUrl}${
    trailerUrl.includes('?') ? '&' : '?'
  }autoplay=1`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Movie trailer"
      className="
        fixed inset-0 z-[100]
        bg-black/90 backdrop-blur-md
        flex items-center justify-center p-4
      "
      onClick={onClose}
    >
      <div
        className="
          relative w-full max-w-5xl aspect-video
          bg-black rounded-2xl overflow-hidden
          shadow-2xl border border-white/10
        "
        onClick={(event) => event.stopPropagation()}
      >
        <iframe
          src={autoplayUrl}
          width="100%"
          height="100%"
          allow="autoplay; encrypted-media; fullscreen"
          allowFullScreen
          frameBorder="0"
          title="Official trailer"
          className="w-full h-full"
        />
      </div>

      <button
        onClick={onClose}
        aria-label="Close trailer"
        className="
          absolute top-6 right-6
          w-10 h-10
          flex items-center justify-center
          rounded-full
          bg-white/10 hover:bg-white/20
          text-white
          transition-all duration-200
        "
      >
        <IconClose className="w-5 h-5" />
      </button>
    </div>
  );
}