// features/admin-import/ui/ActorPreviewPanel.tsx
'use client';
import { useState } from 'react';
import type {
  ImportStatus,
  PersonPreview,
  SlugCandidate,
} from '../types';
import SlugSelector from './SlugSelector';
import PosterSelector from './PosterSelector';

interface ActorPreviewPanelProps {
  preview: PersonPreview;
  slugCandidates: SlugCandidate[];
  importStatus: ImportStatus;
  importMessage: string | null;
  onImport: (selection: {
    slug: string;
    profileImageUrl?: string;
  }) => void;
}

export default function ActorPreviewPanel({
  preview,
  slugCandidates,
  importStatus,
  importMessage,
  onImport,
}: ActorPreviewPanelProps) {
  const recommended =
    slugCandidates.find((c) => c.recommended) ??
    slugCandidates.find((c) => !c.taken) ??
    slugCandidates[0];
  const [selectedSlug, setSelectedSlug] = useState(
    recommended?.slug ?? ''
  );
  const [selectedPhoto, setSelectedPhoto] = useState(
    preview.defaultProfileUrl ?? ''
  );

  const photoOptions = preview.profiles.map((profile) => ({
    url: profile.url,
  }));

  const handleImport = () => {
    onImport({ slug: selectedSlug, profileImageUrl: selectedPhoto });
  };

  return (
    <section className="mt-10 bg-white/[0.03] border border-white/10 rounded-2xl p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">{preview.name}</h2>
        {preview.knownForDepartment && (
          <p className="text-sm text-gray-400 mt-1">
            {preview.knownForDepartment}
          </p>
        )}
      </div>
      {preview.biography && (
        <p className="text-sm text-gray-500 line-clamp-4">
          {preview.biography}
        </p>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-sm font-semibold text-gray-200 mb-3">
            Slug
          </h3>
          <SlugSelector
            candidates={slugCandidates}
            value={selectedSlug}
            onChange={setSelectedSlug}
          />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-200 mb-3">
            Foto de perfil
          </h3>
          <PosterSelector
            options={photoOptions}
            value={selectedPhoto}
            onChange={setSelectedPhoto}
            aspectClassName="aspect-square"
          />
        </div>
      </div>
      <div className="flex items-center gap-4 pt-4 border-t border-white/5">
        <button
          onClick={handleImport}
          disabled={importStatus === 'saving' || !selectedSlug}
          className="bg-red-600 hover:bg-red-700 disabled:opacity-50 px-6 py-3 rounded-full text-sm font-semibold text-white"
        >
          {importStatus === 'saving' ? 'Agregando...' : 'Agregar actor'}
        </button>
        {importMessage && (
          <p
            className={
              importStatus === 'success'
                ? 'text-green-400 text-sm'
                : 'text-red-400 text-sm'
            }
          >
            {importMessage}
          </p>
        )}
      </div>
    </section>
  );
}
