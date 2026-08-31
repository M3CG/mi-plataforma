// features/player/ui/PlayerLoadingOverlay.tsx

interface PlayerLoadingOverlayProps {
  serverName?: string;
  timeoutMs: number;
}

export default function PlayerLoadingOverlay({
  serverName,
  timeoutMs,
}: PlayerLoadingOverlayProps) {
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-black/80">
      <div className="w-10 h-10 border-4 border-red-600/60 border-t-transparent rounded-full animate-spin" />

      <p className="text-sm text-gray-400">
        Connecting to{' '}
        <span className="text-white font-medium">
          {serverName || 'server'}
        </span>
        ...
      </p>

      <p className="text-[11px] text-gray-600">
        If it does not load in {Math.round(timeoutMs / 1000)}s, another
        server will be tried automatically
      </p>
    </div>
  );
}