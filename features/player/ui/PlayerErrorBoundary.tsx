'use client';

import { Component, type ReactNode } from 'react';
import { IconWarning, IconRefresh } from '@/shared/ui/icons';
import { logger } from '@/lib/utils/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Error boundary específico para el reproductor de video.
 *
 * Si el player falla, muestra un fallback elegante sin romper
 * toda la página de detalle de la película.
 */
export default class PlayerErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error('Player component crashed', {
      component: 'PlayerErrorBoundary',
      error,
      errorInfo,
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="aspect-video bg-black/50 border border-white/10 rounded-2xl flex flex-col items-center justify-center gap-4 p-6">
          <div className="w-14 h-14 rounded-full bg-red-600/10 border border-red-600/20 flex items-center justify-center">
            <IconWarning className="w-7 h-7 text-red-500" />
          </div>
          <div className="text-center">
            <h3 className="text-white font-semibold mb-1">
              Error en el reproductor
            </h3>
            <p className="text-sm text-gray-400 max-w-sm">
              No se pudo cargar el video. Podés seguir explorando la información de la película.
            </p>
          </div>
          <button
            onClick={this.handleRetry}
            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-5 py-2.5 rounded-full transition-colors"
          >
            <IconRefresh className="w-4 h-4" />
            Reintentar
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
