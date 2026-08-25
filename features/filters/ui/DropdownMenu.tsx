// features/filters/ui/DropdownMenu.tsx
'use client';

import { ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { IconChevron } from '@/shared/ui/icons';

interface DropdownMenuProps {
  id: string;
  icon: ReactNode;
  label: string;
  currentLabel: string;
  isActive: boolean;
  align?: 'left' | 'right';
  closeOnSelect?: boolean;
  /** Fuerza el cierre del dropdown (ej: cuando la barra se colapsa) */
  forceClose?: boolean;
  /** Clases para el contenedor raíz (el padre controla el ancho) */
  className?: string;
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
  forceClose = false,
  className,
  children,
}: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ─── Force close desde el padre ───
  // Patrón React 19: ajustar estado durante render usando useState.
  // Ver: https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  //
  // No usa useRef para trackear el valor anterior porque la regla
  // react-hooks/refs de Next.js 16 prohíbe acceder a ref.current
  // durante el render.
  const [prevForceClose, setPrevForceClose] = useState(forceClose);
  if (prevForceClose !== forceClose) {
    if (forceClose) {
      setIsOpen(false);
    }
    setPrevForceClose(forceClose);
  }

  // Limpiar timeout de cierre diferido cuando forceClose se activa.
  // Los effects pueden acceder a refs; el render no.
  useEffect(() => {
    if (forceClose && closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  }, [forceClose]);

  // ─── Programar cierre con delay ───
  // 300ms de gracia para que el mouse pueda viajar
  // del botón al panel sin cerrar el dropdown.
  const scheduleClose = useCallback(() => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    closeTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 300);
  }, []);

  const cancelClose = useCallback(() => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  }, []);

  // ─── Click outside + Escape ───
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  // ─── Cleanup del timeout al desmontar ───
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      className={`relative ${className ?? ''}`}
      ref={ref}
      onMouseLeave={scheduleClose}
      onMouseEnter={cancelClose}
    >
      <button
        onClick={() => {
          cancelClose();
          setIsOpen(!isOpen);
        }}
        aria-expanded={isOpen}
        aria-controls={`${id}-dropdown`}
        aria-label={`${label}: ${currentLabel}`}
        title={`${label}: ${currentLabel}`}
        className={`flex w-full items-center justify-between gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
          isActive
            ? 'bg-red-600/80 border-red-500/30 text-white shadow-lg shadow-red-900/20'
            : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20 hover:text-white'
        }`}
      >
        <span className={isActive ? 'text-red-100' : 'text-gray-500'}>
          {icon}
        </span>
        <span className="min-w-0 flex-1 truncate text-left">
          {currentLabel}
        </span>
        <IconChevron open={isOpen} className="w-3 h-3 opacity-60" />
      </button>

      {isOpen && (
        <div
          id={`${id}-dropdown`}
          className={`absolute z-[200] top-full mt-2 ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
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