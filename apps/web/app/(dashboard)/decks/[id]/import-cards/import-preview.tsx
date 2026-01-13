'use client';

import { useState, useTransition } from 'react';
import { ArrowLeft, AlertTriangle, CheckCircle, X, Loader2 } from 'lucide-react';
import { importCardsAction } from '../actions';
import type { ParseResult } from './types';

interface ImportPreviewProps {
  deckId: string;
  parseResult: ParseResult;
  onBack: () => void;
  onClose: () => void;
}

export function ImportPreview({
  deckId,
  parseResult,
  onBack,
  onClose,
}: ImportPreviewProps): React.JSX.Element {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleImport = () => {
    setError(null);
    startTransition(async () => {
      const result = await importCardsAction(
        deckId,
        parseResult.cards.map((c) => ({
          front: c.front,
          back: c.back,
          notes: c.notes,
        }))
      );

      if (result?.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        setTimeout(onClose, 1500);
      }
    });
  };

  // Success state
  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-gray-900">Import successful!</h3>
          <p className="mt-2 text-sm text-gray-600">
            {parseResult.cards.length} cards have been added to your deck.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="flex max-h-[85vh] w-full max-w-3xl flex-col rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              disabled={isPending}
              className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h2 className="text-lg font-semibold text-gray-900">Preview import</h2>
          </div>
          <button
            onClick={onClose}
            disabled={isPending}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Summary */}
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-gray-900">
                {parseResult.cards.length} cards ready
              </span>
            </div>
            {parseResult.errors.length > 0 && (
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <span className="text-sm font-medium text-gray-900">
                  {parseResult.errors.length} rows skipped
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {/* Error message */}
          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              <AlertTriangle className="h-5 w-5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {/* Errors list */}
          {parseResult.errors.length > 0 && (
            <div className="mb-6">
              <h4 className="mb-2 text-sm font-medium text-gray-700">Skipped rows</h4>
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                <ul className="space-y-1 text-sm text-amber-800">
                  {parseResult.errors.slice(0, 10).map((err, i) => (
                    <li key={i}>
                      Row {err.rowNumber}: {err.message}
                    </li>
                  ))}
                  {parseResult.errors.length > 10 && (
                    <li className="text-amber-600">
                      ... and {parseResult.errors.length - 10} more
                    </li>
                  )}
                </ul>
              </div>
            </div>
          )}

          {/* Preview table */}
          <div>
            <h4 className="mb-2 text-sm font-medium text-gray-700">
              Cards to import ({parseResult.cards.length})
            </h4>
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 font-medium text-gray-600">#</th>
                    <th className="px-4 py-2 font-medium text-gray-600">Front</th>
                    <th className="px-4 py-2 font-medium text-gray-600">Back</th>
                    <th className="px-4 py-2 font-medium text-gray-600">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {parseResult.cards.slice(0, 50).map((card, i) => (
                    <tr key={i} className="border-t border-gray-100">
                      <td className="px-4 py-2 text-gray-400">{i + 1}</td>
                      <td className="max-w-[200px] truncate px-4 py-2 text-gray-900">
                        {card.front}
                      </td>
                      <td className="max-w-[200px] truncate px-4 py-2 text-gray-900">
                        {card.back}
                      </td>
                      <td className="max-w-[150px] truncate px-4 py-2 text-gray-500">
                        {card.notes || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {parseResult.cards.length > 50 && (
                <div className="border-t border-gray-100 bg-gray-50 px-4 py-2 text-center text-sm text-gray-500">
                  ... and {parseResult.cards.length - 50} more cards
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4">
          <button
            onClick={onClose}
            disabled={isPending}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={isPending || parseResult.cards.length === 0}
            className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Importing...
              </>
            ) : (
              `Import ${parseResult.cards.length} cards`
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
