// features/catalog/lib/gridStateStorage.ts

import type { Movie } from '@/types';
import {
  GRID_SCROLL_STORAGE_KEY,
  GRID_STATE_STORAGE_PREFIX,
} from '../config/grid';
import { consumeScrollRestoreSignal } from '@/lib/scroll/defer';

export interface SavedGridState {
  movies: Movie[];
  hasMore: boolean;
  page: number;
}

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

export function getFilterKey(filters: unknown): string {
  try {
    return JSON.stringify(filters ?? {});
  } catch {
    return '{}';
  }
}

/**
 * Consume la señal de scroll pendiente y devuelve la posición guardada.
 *
 * Si no hay señal pendiente, limpia cualquier valor huérfano y devuelve null.
 */
export function consumePendingScroll(): number | null {
  if (!isBrowser()) return null;

  const hasPendingSignal = consumeScrollRestoreSignal();

  let rawValue: string | null = null;

  try {
    rawValue = sessionStorage.getItem(GRID_SCROLL_STORAGE_KEY);
  } catch {
    return null;
  }

  if (!hasPendingSignal) {
    if (rawValue !== null) {
      try {
        sessionStorage.removeItem(GRID_SCROLL_STORAGE_KEY);
      } catch {
        // Ignorar errores de almacenamiento.
      }
    }

    return null;
  }

  if (rawValue === null) return null;

  try {
    sessionStorage.removeItem(GRID_SCROLL_STORAGE_KEY);
  } catch {
    // Ignorar errores de almacenamiento.
  }

  const parsedValue = Number(rawValue);

  if (!Number.isFinite(parsedValue)) return null;

  return parsedValue;
}

export function readSavedGridState(
  filterKey: string
): SavedGridState | null {
  if (!isBrowser()) return null;

  const storageKey = `${GRID_STATE_STORAGE_PREFIX}${filterKey}`;

  try {
    const rawState = sessionStorage.getItem(storageKey);

    if (!rawState) return null;

    const parsedState = JSON.parse(rawState);

    if (
      !parsedState ||
      !Array.isArray(parsedState.movies) ||
      parsedState.movies.length === 0
    ) {
      return null;
    }

    return {
      movies: parsedState.movies as Movie[],
      hasMore: Boolean(parsedState.hasMore),
      page: Number(parsedState.page) || 1,
    };
  } catch {
    sessionStorage.removeItem(storageKey);
    return null;
  }
}

export function writeGridState(
  filterKey: string,
  state: SavedGridState
): void {
  if (!isBrowser()) return;

  const storageKey = `${GRID_STATE_STORAGE_PREFIX}${filterKey}`;

  try {
    sessionStorage.setItem(storageKey, JSON.stringify(state));
  } catch {
    // Silenciar errores de quota de sessionStorage.
  }
}

export function hasPendingGridScroll(): boolean {
  if (!isBrowser()) return false;

  return sessionStorage.getItem(GRID_SCROLL_STORAGE_KEY) !== null;
}