'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { IconSearch } from '@/shared/ui/icons';
import { routes } from '@/lib/routes';
import { useAutocomplete } from '../model/useAutocomplete';
import AutocompleteSuggestions from './AutocompleteSuggestions';

const DEBOUNCE_MS = 300;

export default function SearchBar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();

  // Hook de autocomplete
  const { suggestions, isLoading } = useAutocomplete(
    showSuggestions ? searchQuery : ''
  );

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

  // Cerrar sugerencias al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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
        setShowSuggestions(false);
      }
    },
    [router]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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

    // Mostrar sugerencias si hay suficiente texto
    if (value.trim().length >= 2) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    if (searchQuery.trim().length >= 2) {
      setShowSuggestions(true);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Dar tiempo suficiente para que los clicks en sugerencias se registren
    setTimeout(() => {
      setShowSuggestions(false);
    }, 300); // ← Aumentar de 200ms a 300ms
  };

  const handleCloseSuggestions = () => {
    setShowSuggestions(false);
  };

  return (
    <div ref={containerRef} className="relative flex-shrink-0">
      <form onSubmit={handleSubmit} role="search" className="relative">
        <label htmlFor="search-input" className="sr-only">
          Buscar películas
        </label>

        {/* Icono de lupa */}
        <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
          <IconSearch
            className={`w-4 h-4 transition-colors duration-200 ${isFocused ? 'text-red-500' : 'text-gray-500'
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
          onFocus={handleFocus}
          onBlur={handleBlur}
          autoComplete="off"  // ← AGREGAR: desactiva autocomplete del navegador
          autoCorrect="off"   // ← AGREGAR
          autoCapitalize="off" // ← AGREGAR
          spellCheck="false"   // ← AGREGAR
          className={`w-36 sm:w-44 md:w-56 lg:w-64 bg-white/5 border rounded-full py-2 pl-10 pr-4 text-sm text-white placeholder-gray-500 outline-none transition-all duration-300 ${isFocused
            ? 'border-red-500/50 ring-2 ring-red-500/20 bg-white/10 w-44 sm:w-56 md:w-64 lg:w-72'
            : 'border-white/10 hover:border-white/20'
            }`}
        />

        {/* Indicador de atajo (solo desktop) */}
        <div className="absolute inset-y-0 right-0 hidden lg:flex items-center pr-3 pointer-events-none">
          <kbd
            className={`text-[10px] font-mono px-1.5 py-0.5 rounded border transition-colors duration-200 ${isFocused
              ? 'border-red-500/30 text-red-400'
              : 'border-white/10 text-gray-600'
              }`}
          >
            /
          </kbd>
        </div>
      </form>

      {/* Sugerencias de autocomplete */}
      {showSuggestions && (
        <AutocompleteSuggestions
          suggestions={suggestions}
          isLoading={isLoading}
          query={searchQuery}
          onClose={handleCloseSuggestions}
        />
      )}
    </div>
  );
}