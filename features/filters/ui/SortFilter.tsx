// features/filters/ui/SortFilter.tsx
'use client';

import DropdownMenu from './DropdownMenu';
import { IconSort } from '@/shared/ui/icons';
import { SORT_OPTIONS } from '../config/options';
import type { MovieSort } from '@/entities/movie';

interface SortFilterProps {
  value: MovieSort;
  onChange: (value: MovieSort) => void;
  forceClose?: boolean;
  className?: string;
}

export default function SortFilter({
  value,
  onChange,
  forceClose = false,
  className,
}: SortFilterProps) {
  const currentLabel =
    SORT_OPTIONS.find((option) => option.value === value)?.label ||
    'Ordenar';

  return (
    <DropdownMenu
      id="sort"
      icon={<IconSort />}
      label="Ordenar"
      currentLabel={currentLabel}
      isActive={false}
      align="right"
      forceClose={forceClose}
      className={className}
    >
      <div className="bg-gray-950/95 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-2xl shadow-black/40 min-w-[180px]">
        {SORT_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`block w-full text-left px-3 py-2 text-sm rounded-xl transition-colors ${
              value === option.value
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