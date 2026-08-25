// features/filters/ui/CountryFilter.tsx
'use client';

import DropdownMenu from './DropdownMenu';
import { IconGlobe } from '@/shared/ui/icons';

interface CountryFilterProps {
  countries: string[];
  value: string | null;
  onChange: (value: string | null) => void;
  forceClose?: boolean;
  className?: string;
}

export default function CountryFilter({
  countries,
  value,
  onChange,
  forceClose = false,
  className,
}: CountryFilterProps) {
  return (
    <DropdownMenu
      id="country"
      icon={<IconGlobe />}
      label="País"
      currentLabel={value || 'País'}
      isActive={Boolean(value)}
      align="right"
      forceClose={forceClose}
      className={className}
    >
      <div className="bg-gray-950/95 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-2xl shadow-black/40 w-52 max-h-64 overflow-y-auto scrollbar-hide">
        <button
          onClick={() => onChange(null)}
          className={`block w-full text-left px-3 py-2 text-sm rounded-xl transition-colors ${
            !value
              ? 'bg-red-600/80 text-white font-medium'
              : 'text-gray-300 hover:bg-white/5'
          }`}
        >
          Todos
        </button>
        {countries.map((countryName) => (
          <button
            key={countryName}
            onClick={() => onChange(countryName)}
            className={`block w-full text-left px-3 py-2 text-sm rounded-xl transition-colors ${
              value === countryName
                ? 'bg-red-600/80 text-white font-medium'
                : 'text-gray-300 hover:bg-white/5'
            }`}
          >
            {countryName}
          </button>
        ))}
      </div>
    </DropdownMenu>
  );
}