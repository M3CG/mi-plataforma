#!/usr/bin/env bash
set -euo pipefail

GREEN='\033[0;32m'
CYAN='\033[0;36m'
NC='\033[0m'

echo "━━━ Simplificación: Mostrar modal SIEMPRE antes de cada película ━━━"

# ═══════════════════════════════════════════════════════════════
# 1. Simplificar adblock-storage.ts (sin detección)
# ═══════════════════════════════════════════════════════════════
echo -e "${CYAN}→ Simplificando adblock-storage.ts${NC}"

cat > shared/lib/adblock-storage.ts << 'EOF_STORAGE'
// shared/lib/adblock-storage.ts

/**
 * Estado en memoria: se resetea cuando el usuario recarga la página.
 * Esto permite que la advertencia aparezca 1 vez por carga de página,
 * pero no moleste en cada película de la misma sesión de navegación.
 */
let warnedInCurrentSession = false;

/**
 * Verifica si se debe mostrar la advertencia.
 *
 * true si la advertencia NO fue mostrada en esta carga de página.
 * No verifica si tiene adblocker o no, siempre muestra.
 */
export function shouldShowWarning(): boolean {
  return !warnedInCurrentSession;
}

/**
 * Marca que la advertencia se mostró en la sesión actual.
 * Se resetea automáticamente cuando el usuario recarga la página.
 */
export function markAsWarnedInSession(): void {
  warnedInCurrentSession = true;
}
EOF_STORAGE

echo "  ✓ shared/lib/adblock-storage.ts simplificado"

# ═══════════════════════════════════════════════════════════════
# 2. Simplificar VideoPlayer.tsx (sin detección de adblocker)
# ═══════════════════════════════════════════════════════════════
echo -e "${CYAN}→ Simplificando VideoPlayer.tsx${NC}"

cat > features/player/ui/VideoPlayer.tsx << 'EOF_PLAYER'
// features/player/ui/VideoPlayer.tsx
'use client';

import { useState } from 'react';
import type { PlayableSource } from '../types';
import { LOAD_TIMEOUT_MS } from '../config/player';

import { useServerFailover } from '../model/useServerFailover';
import { shouldShowWarning, markAsWarnedInSession } from '@/shared/lib/adblock-storage';

import ServerSelector from './ServerSelector';
import PlayerLoadingOverlay from './PlayerLoadingOverlay';
import PlayerErrorOverlay from './PlayerErrorOverlay';
import PlayerFrame from './PlayerFrame';
import AdblockWarningModal from '@/shared/ui/AdblockWarningModal';

export interface VideoPlayerProps {
  sources: PlayableSource[];
}

export default function VideoPlayer({ sources }: VideoPlayerProps) {
  // ─── Estado de advertencia ───
  // Si shouldShowWarning() es true, mostramos el modal.
  // Se resetea cuando el usuario recarga la página.
  const [showWarningModal, setShowWarningModal] = useState(() => shouldShowWarning());
  const [userDismissedWarning, setUserDismissedWarning] = useState(false);

  const {
    activeSource,
    activeIndex,
    failedSourceIds,
    loadStatus,
    autoSwitched,
    retryCounter,
    allFailed,

    handleIframeLoad,
    handleRetry,
    handleSelectSource,
  } = useServerFailover({ sources });

  // El iframe solo se permite si el usuario ya fue advertido en esta sesión
  const iframeAllowed = !showWarningModal || userDismissedWarning;

  const handleContinue = () => {
    markAsWarnedInSession();
    setUserDismissedWarning(true);
    setShowWarningModal(false);
  };

  const handleClose = () => {
    markAsWarnedInSession();
    setUserDismissedWarning(true);
    setShowWarningModal(false);
  };

  if (!sources || sources.length === 0) {
    return (
      <div className="aspect-video bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-center text-gray-500">
        No servers available for this movie.
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* ─── Modal de advertencia (SIEMPRE se muestra la primera vez) ─── */}
      <AdblockWarningModal
        isOpen={showWarningModal && !userDismissedWarning}
        onClose={handleClose}
        onContinue={handleContinue}
      />

      <ServerSelector
        sources={sources}
        activeIndex={activeIndex}
        failedSourceIds={failedSourceIds}
        onSelectSource={handleSelectSource}
      />

      {autoSwitched && loadStatus === 'loading' && (
        <div className="mb-3 flex items-center gap-2 text-xs text-amber-400/80 bg-amber-500/5 border border-amber-500/10 rounded-lg px-3 py-2">
          <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse flex-shrink-0" />
          The previous server did not respond. Automatically switching to{' '}
          <strong>{activeSource?.name}</strong>...
        </div>
      )}

      <div className="relative aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl shadow-black/30 border border-white/5">
        {/* ─── Si no fue advertido, mostrar overlay ─── */}
        {!iframeAllowed && (
          <div className="absolute inset-0 z-10 bg-gray-950 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-14 h-14 bg-amber-500/20 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-7 h-7 text-amber-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <p className="text-white font-semibold text-lg mb-2">
              Recomendación antes de reproducir
            </p>
            <p className="text-gray-400 text-sm max-w-md">
              Para una mejor experiencia, te recomendamos instalar un bloqueador
              de anuncios. Revisá la ventana emergente con las opciones.
            </p>
          </div>
        )}

        {iframeAllowed && loadStatus === 'loading' && (
          <PlayerLoadingOverlay
            serverName={activeSource?.name}
            timeoutMs={LOAD_TIMEOUT_MS}
          />
        )}

        {iframeAllowed && (loadStatus === 'timeout' || allFailed) && (
          <PlayerErrorOverlay
            allFailed={allFailed}
            onRetry={handleRetry}
          />
        )}

        {iframeAllowed && activeSource && loadStatus !== 'timeout' && !allFailed && (
          <PlayerFrame
            key={`${activeSource.url}-${retryCounter}`}
            source={activeSource}
            onLoad={handleIframeLoad}
          />
        )}
      </div>

      <p className="mt-2 text-[10px] text-gray-600 text-center">
        Content plays in a sandboxed environment for security. If a
        server shows pop-up ads, close them directly in the
        player.
      </p>
    </div>
  );
}
EOF_PLAYER

echo "  ✓ features/player/ui/VideoPlayer.tsx simplificado"

# ═══════════════════════════════════════════════════════════════
# 3. Actualizar AdblockWarningModal (texto más directo)
# ═══════════════════════════════════════════════════════════════
echo -e "${CYAN}→ Actualizando AdblockWarningModal.tsx${NC}"

cat > shared/ui/AdblockWarningModal.tsx << 'EOF_MODAL'
// shared/ui/AdblockWarningModal.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { detectBrowser, getAdblockRecommendation } from '@/shared/lib/adblock-detector';
import { markAsWarnedInSession } from '@/shared/lib/adblock-storage';

export interface AdblockWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
}

export default function AdblockWarningModal({
  isOpen,
  onClose,
  onContinue,
}: AdblockWarningModalProps) {
  const [browser, setBrowser] = useState<string>('other');
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setBrowser(detectBrowser());

      const timer = setTimeout(() => {
        dialogRef.current?.focus();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const recommendation = getAdblockRecommendation(browser);

  const handleInstall = () => {
    window.open(recommendation.url, '_blank', 'noopener,noreferrer');
  };

  const handleContinue = () => {
    markAsWarnedInSession();
    onContinue();
  };

  const handleClose = () => {
    markAsWarnedInSession();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="
        fixed inset-0 z-[9999]
        flex items-center justify-center
        bg-black/80 backdrop-blur-sm
        p-4
      "
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="adblock-warning-title"
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="
          bg-gray-900 border border-white/10
          rounded-2xl shadow-2xl
          max-w-lg w-full
          p-6 sm:p-8
          outline-none
        "
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-amber-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        </div>

        <h2
          id="adblock-warning-title"
          className="text-xl font-bold text-white text-center mb-3"
        >
          Recomendación antes de reproducir
        </h2>

        <p className="text-gray-300 text-center mb-4 leading-relaxed">
          Los servidores de video muestran publicidad invasiva que puede hacer
          difícil o imposible ver las películas. Te recomendamos instalar un
          bloqueador de anuncios para una mejor experiencia.
        </p>

        <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
          <p className="text-sm font-semibold text-white mb-2">
            Extensión recomendada para tu navegador:
          </p>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <p className="text-white font-medium">{recommendation.name}</p>
              <p className="text-gray-400 text-sm">{recommendation.description}</p>
            </div>
            <button
              onClick={handleInstall}
              className="
                bg-blue-600 hover:bg-blue-700
                text-white font-semibold
                px-4 py-2 rounded-lg
                transition-colors
                text-sm
              "
            >
              Instalar
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleInstall}
            className="
              flex-1 bg-blue-600 hover:bg-blue-700
              text-white font-semibold
              px-4 py-3 rounded-lg
              transition-colors
            "
          >
            Instalar bloqueador
          </button>
          <button
            onClick={handleContinue}
            className="
              flex-1 bg-gray-800 hover:bg-gray-700
              text-gray-300 font-medium
              px-4 py-3 rounded-lg
              transition-colors
              border border-white/10
            "
          >
            Continuar sin bloqueador
          </button>
        </div>

        <p className="text-gray-500 text-xs text-center mt-4">
          Si elegís continuar, verás anuncios invasivos durante la reproducción.
          Esta advertencia aparecerá nuevamente la próxima vez que cargues la página.
        </p>
      </div>
    </div>
  );
}
EOF_MODAL

echo "  ✓ shared/ui/AdblockWarningModal.tsx actualizado"

# ═══════════════════════════════════════════════════════════════
# 4. Verificaciones
# ═══════════════════════════════════════════════════════════════
echo ""
echo -e "${CYAN}Verificando TypeScript...${NC}"
npx tsc --noEmit 2>&1 | tail -5 && echo -e "${GREEN}✓ TypeScript OK${NC}"

echo ""
echo -e "${GREEN}━━━ Simplificación completada ━━━${NC}"
echo ""
echo "Cambios:"
echo "  • Eliminada la detección de adblocker"
echo "  • El modal SIEMPRE aparece antes de cada película"
echo "  • Solo 1 vez por carga de página (se resetea al recargar)"
echo "  • El usuario elige: instalar bloqueador o continuar"
echo ""
echo "Flujo:"
echo "  1. Usuario entra a una película"
echo "  2. Modal aparece inmediatamente"
echo "  3. Usuario elige:"
echo "     → 'Instalar bloqueador': abre link de la extensión"
echo "     → 'Continuar sin bloqueador': carga el iframe"
echo "  4. Si navega a otra película SIN recargar:"
echo "     → NO vuelve a mostrar el modal"
echo "  5. Si RECARGA la página:"
echo "     → El modal vuelve a aparecer"
echo ""
echo "Para probar:"
echo "  npm run dev"
echo "  Entrar a cualquier película → el modal debería aparecer"
