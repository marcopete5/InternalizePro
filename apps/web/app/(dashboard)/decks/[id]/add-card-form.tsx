'use client';

import { useState, useTransition } from 'react';
import { Plus } from 'lucide-react';
import { createCardAction } from './actions';

interface AddCardFormProps {
  deckId: string;
}

export function AddCardForm({ deckId }: AddCardFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await createCardAction(deckId, formData);
      if (result?.error) {
        setError(result.error);
      } else {
        // Reset form
        setIsOpen(false);
      }
    });
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 py-4 text-gray-600 transition-colors hover:border-primary-400 hover:text-primary-600"
      >
        <Plus className="h-5 w-5" />
        Add a card
      </button>
    );
  }

  return (
    <form action={handleSubmit} className="rounded-xl border border-gray-200 bg-white p-6">
      <h3 className="mb-4 font-medium text-gray-900">Add new card</h3>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {/* Front */}
        <div>
          <label htmlFor="front" className="block text-sm font-medium text-gray-700">
            Front (Question)
          </label>
          <textarea
            id="front"
            name="front"
            required
            rows={2}
            placeholder="What do you want to remember?"
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />
        </div>

        {/* Back */}
        <div>
          <label htmlFor="back" className="block text-sm font-medium text-gray-700">
            Back (Answer)
          </label>
          <textarea
            id="back"
            name="back"
            required
            rows={2}
            placeholder="The answer or explanation"
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />
        </div>

        {/* Notes (optional) */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
            Notes <span className="text-gray-400">(optional)</span>
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={2}
            placeholder="Additional context or hints"
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
        >
          {isPending ? 'Adding...' : 'Add card'}
        </button>
      </div>
    </form>
  );
}
