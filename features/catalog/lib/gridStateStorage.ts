import type { Movie } from '@/entities/movie';
import {
  GRID_SCROLL_STORAGE_KEY,
  GRID_STATE_STORAGE_PREFIX,
} from '../config/grid';
import {
  consumeScrollRestoreSignal,
  isScrollRestoreDeferredFor,
} from '@/lib/scroll/defer';

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

function readRawScrollValue(): string | null {
  try {
    return sessionStorage.getItem(GRID_SCROLL_STORAGE_KEY);
  } catch {
    return null;
  }
}

function removeRawScrollValue(): void {
  try {
    sessionStorage.removeItem(GRID_SCROLL_STORAGE_KEY);
  } catch {
    // Ignorar errores de almacenamiento.
  }
}

/**
 * Consulta si hay scroll pendiente para una ruta,
 * sin consumir la señal global.
 *
 * Esto permite que ScrollToTop todavía pueda verla
 * durante el mismo ciclo de navegación.
 */
export function peekPendingScrollFor(returnPath: string): number | null {
  if (!isBrowser()) return null;

  if (!isScrollRestoreDeferredFor(returnPath)) {
    removeRawScrollValue();
    return null;
  }

  const rawValue = readRawScrollValue();
  if (rawValue === null) return null;

  const parsedValue = Number(rawValue);
  if (!Number.isFinite(parsedValue)) {
    removeRawScrollValue();
    return null;
  }

  return parsedValue;
}

/**
 * Consume la señal de scroll pendiente para una ruta
 * y devuelve la posición guardada.
 */
export function consumePendingScrollFor(returnPath: string): number | null {
  if (!isBrowser()) return null;

  const hasPendingSignal = consumeScrollRestoreSignal(returnPath);
  const rawValue = readRawScrollValue();

  if (!hasPendingSignal) {
    removeRawScrollValue();
    return null;
  }

  if (rawValue === null) return null;

  removeRawScrollValue();

  const parsedValue = Number(rawValue);
  if (!Number.isFinite(parsedValue)) {
    return null;
  }

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
