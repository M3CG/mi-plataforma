// features/admin-import/ui/PosterSelector.tsx
'use client';
import Image from 'next/image';

export interface ImageSelectorOption {
  url: string;
  badge?: string;
}

interface PosterSelectorProps {
  options: ImageSelectorOption[];
  value: string;
  onChange: (url: string) => void;
  aspectClassName?: string;
}

export default function PosterSelector({
  options,
  value,
  onChange,
  aspectClassName = 'aspect-[2/3]',
}: PosterSelectorProps) {
  if (options.length === 0) {
    return (
      <p className="text-sm text-gray-500">Sin imágenes disponibles.</p>
    );
  }
  return (
    <div className="grid grid-cols-3 gap-2 max-h-72 overflow-y-auto pr-1">
      {options.map((option) => {
        const selected = value === option.url;
        return (
          <button
            key={option.url}
            type="button"
            onClick={() => onChange(option.url)}
            className={`relative ${aspectClassName} rounded-lg overflow-hidden border-2 transition-all ${
              selected
                ? 'border-red-500'
                : 'border-transparent hover:border-white/30'
            }`}
          >
            <Image
              src={option.url}
              alt=""
              fill
              sizes="120px"
              className="object-cover"
            />
            {option.badge && (
              <span className="absolute bottom-1 left-1 text-[9px] px-1.5 py-0.5 rounded bg-black/70 text-gray-200">
                {option.badge}
              </span>
            )}
            {selected && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-600 flex items-center justify-center text-[10px] text-white">
                ✓
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
