// features/filters/ui/DropdownMenu.tsx
'use client';

import { ReactNode, useEffect, useRef, useState } from 'react';
import { IconChevron } from '@/shared/ui/icons';

interface DropdownMenuProps {
  id: string;
  icon: ReactNode;
  label: string;
  currentLabel: string;
  isActive: boolean;
  align?: 'left' | 'right';
  closeOnSelect?: boolean;
  children: ReactNode;
}

export default function DropdownMenu({
  id,
  icon,
  label,
  currentLabel,
  isActive,
  align = 'left',
  closeOnSelect = true,
  children,
}: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls={`${id}-dropdown`}
        aria-label={`${label}: ${currentLabel}`}
        title={`${label}: ${currentLabel}`}
        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
          isActive
            ? 'bg-red-600/80 border-red-500/30 text-white shadow-lg shadow-red-900/20'
            : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20 hover:text-white'
        }`}
      >
        <span className={isActive ? 'text-red-100' : 'text-gray-500'}>
          {icon}
        </span>
        <span className="hidden sm:inline">{currentLabel}</span>
        <IconChevron open={isOpen} className="w-3 h-3 opacity-60" />
      </button>

      {isOpen && (
        <div
          id={`${id}-dropdown`}
          className={`absolute z-[60] top-full ${
            align === 'right' ? 'right-0' : 'left-0'
          } min-w-[200px] pt-2`}
          onClick={(event) => {
            if (closeOnSelect) {
              setIsOpen(false);
            } else {
              event.stopPropagation();
            }
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}