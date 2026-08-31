// features/player/ui/PlayerFrame.tsx
'use client';

import type { PlayableSource } from '../types';
import { resolveSandboxAttribute } from '../config/sandbox-policy';

interface PlayerFrameProps {
  source: PlayableSource;
  onLoad: () => void;
}

export default function PlayerFrame({ source, onLoad }: PlayerFrameProps) {
  const sandbox = resolveSandboxAttribute(source.sandbox);

  return (
    <iframe
      src={source.url}
      width="100%"
      height="100%"
      allowFullScreen
      frameBorder="0"
      referrerPolicy="strict-origin-when-cross-origin"
      allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
      sandbox={sandbox}
      className="w-full h-full"
      title={`Video player - ${source.name}`}
      onLoad={onLoad}
    />
  );
}