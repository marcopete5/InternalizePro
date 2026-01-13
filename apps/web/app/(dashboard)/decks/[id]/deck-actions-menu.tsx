'use client';

import { useState, useRef, useEffect } from 'react';
import { MoreHorizontal, Trash2, Edit } from 'lucide-react';
import { deleteDeckAction } from '../actions';

interface DeckActionsMenuProps {
  deckId: string;
  deckName: string;
}

export function DeckActionsMenu({ deckId, deckName }: DeckActionsMenuProps): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowConfirm(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDelete = async () => {
    if (!showConfirm) {
      setShowConfirm(true);
      return;
    }

    setIsDeleting(true);
    try {
      const result = await deleteDeckAction(deckId);
      if (result?.error) {
        console.error('Failed to delete deck:', result.error);
        alert('Failed to delete deck. Please try again.');
      }
    } catch {
      // redirect happens on success, so this catch handles any other errors
    } finally {
      setIsDeleting(false);
      setIsOpen(false);
      setShowConfirm(false);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="rounded-lg border border-gray-300 p-2 text-gray-600 hover:bg-gray-50"
        aria-label="Deck actions"
      >
        <MoreHorizontal className="h-5 w-5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-10 mt-2 w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
          {showConfirm ? (
            <div className="px-4 py-3">
              <p className="mb-3 text-sm text-gray-700">
                Delete &quot;{deckName}&quot;? This cannot be undone.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 rounded-md bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          ) : (
            <>
              <button
                onClick={handleDelete}
                className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
                Delete deck
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
