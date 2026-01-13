'use client';

import { useState } from 'react';
import { Upload } from 'lucide-react';
import { ImportCardsModal } from './import-cards-modal';

interface ImportCardsButtonProps {
  deckId: string;
}

export function ImportCardsButton({ deckId }: ImportCardsButtonProps): React.JSX.Element {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        <Upload className="h-4 w-4" />
        Import
      </button>

      {isModalOpen && (
        <ImportCardsModal
          deckId={deckId}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}
