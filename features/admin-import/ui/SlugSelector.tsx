// features/admin-import/ui/SlugSelector.tsx
'use client';
import type { SlugCandidate } from '../types';

interface SlugSelectorProps {
  candidates: SlugCandidate[];
  value: string;
  onChange: (slug: string) => void;
}

export default function SlugSelector({
  candidates,
  value,
  onChange,
}: SlugSelectorProps) {
  if (candidates.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        No slug candidates available.
      </p>
    );
  }
  return (
    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
      {candidates.map((candidate) => {
        const selected = value === candidate.slug;
        return (
          <label
            key={candidate.slug}
            className={`flex items-center gap-3 px-3 py-2 rounded-xl border cursor-pointer transition-all ${
              selected
                ? 'border-red-500/50 bg-red-600/10'
                : 'border-white/10 bg-white/5 hover:bg-white/10'
            } ${candidate.taken ? 'opacity-60' : ''}`}
          >
            <input
              type="radio"
              name="slug-candidate"
              checked={selected}
              onChange={() => onChange(candidate.slug)}
              className="accent-red-600"
            />
            <span className="flex-1 text-sm text-gray-200 font-mono break-all">
              {candidate.slug}
            </span>
            {candidate.recommended && !candidate.taken && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-600/20 text-green-300">
                Recomendado
              </span>
            )}
            {candidate.taken && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-600/20 text-amber-300">
                En uso
              </span>
            )}
          </label>
        );
      })}
    </div>
  );
}
