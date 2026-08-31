// features/movie-detail/ui/WatchButton.tsx
'use client';

import { IconPlay } from '@/shared/ui/icons';

import { WATCH_SECTION_ID } from '../config/movieDetail';

export default function WatchButton() {
  const handleClick = () => {
    const element = document.getElementById(WATCH_SECTION_ID);

    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  return (
    <button
      onClick={handleClick}
      className="
        inline-flex items-center gap-2.5
        bg-red-600 hover:bg-red-700
        text-white font-semibold
        px-6 py-3 rounded-full
        transition-all duration-200
        text-sm
        shadow-lg shadow-red-600/25
        hover:shadow-red-600/40
        hover:-translate-y-0.5
      "
    >
      <IconPlay className="w-5 h-5" />
      Watch Movie
    </button>
  );
}