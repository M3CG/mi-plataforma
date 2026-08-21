// features/filters/ui/RatingFilter.tsx
'use client';
import DropdownMenu from './DropdownMenu';
import { IconStar } from '@/shared/ui/icons';
import { RATING_OPTIONS } from '../config/options';

interface RatingFilterProps {
  value: string | null;
  onChange: (value: string | null) => void;
  forceClose?: boolean;
}

export default function RatingFilter({ value, onChange, forceClose = false }: RatingFilterProps) {
  const currentLabel =
    RATING_OPTIONS.find((option) => option.value === (value ?? 'all'))
      ?.label || 'Puntuación';

  return (
    <DropdownMenu
      id="rating"
      icon={<IconStar />}
      label="Puntuación"
      currentLabel={currentLabel}
      isActive={Boolean(value)}
      forceClose={forceClose}
    >
      <div className="bg-gray-950/95 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-2xl shadow-black/40 min-w-[160px]">
        {RATING_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() =>
              onChange(option.value === 'all' ? null : option.value)
            }
            className={`block w-full text-left px-3 py-2 text-sm rounded-xl transition-colors ${
              (value || 'all') === option.value
                ? 'bg-red-600/80 text-white font-medium'
                : 'text-gray-300 hover:bg-white/5'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </DropdownMenu>
  );
}
