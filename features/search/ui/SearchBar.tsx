// features/search/ui/SearchBar.tsx
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { IconSearch } from '@/shared/ui/icons';
import { routes } from '@/lib/routes';

const DEBOUNCE_MS = 300;

export default function SearchBar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();

  // Atajo de teclado: "/" enfoca la búsqueda
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Limpiar debounce al desmontar
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const navigateToSearch = useCallback(
    (query: string) => {
      const trimmed = query.trim();
      if (trimmed) {
        router.push(routes.search(trimmed));
      }
    },
    [router]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Cancelar debounce pendiente y navegar inmediatamente
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    navigateToSearch(searchQuery);
    setSearchQuery('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    // Debounce: navegar automáticamente después de 300ms sin escribir
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    const trimmed = value.trim();
    if (trimmed.length >= 2) {
      debounceRef.current = setTimeout(() => {
        navigateToSearch(trimmed);
        debounceRef.current = null;
      }, DEBOUNCE_MS);
    }
  };

  return (
    <form onSubmit={handleSubmit} role="search" className="relative flex-shrink-0">
      <label htmlFor="search-input" className="sr-only">
        Buscar películas
      </label>

      {/* Icono de lupa */}
      <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
        <IconSearch
          className={`w-4 h-4 transition-colors duration-200 ${
            isFocused ? 'text-red-500' : 'text-gray-500'
          }`}
        />
      </div>

      {/* Input */}
      <input
        ref={inputRef}
        id="search-input"
        type="search"
        placeholder="Buscar..."
        title="Buscar películas (presiona / para enfocar)"
        value={searchQuery}
        onChange={handleChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={`w-36 sm:w-44 md:w-56 lg:w-64 bg-white/5 border rounded-full py-2 pl-10 pr-4 text-sm text-white placeholder-gray-500 outline-none transition-all duration-300 ${
          isFocused
            ? 'border-red-500/50 ring-2 ring-red-500/20 bg-white/10 w-44 sm:w-56 md:w-64 lg:w-72'
            : 'border-white/10 hover:border-white/20'
        }`}
      />

      {/* Indicador de atajo (solo desktop) */}
      <div className="absolute inset-y-0 right-0 hidden lg:flex items-center pr-3 pointer-events-none">
        <kbd
          className={`text-[10px] font-mono px-1.5 py-0.5 rounded border transition-colors duration-200 ${
            isFocused
              ? 'border-red-500/30 text-red-400'
              : 'border-white/10 text-gray-600'
          }`}
        >
          /
        </kbd>
      </div>
    </form>
  );
}
