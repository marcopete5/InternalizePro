'use client';

import { useState, useTransition } from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createDeckAction } from '../actions';

const COLORS = [
  '#6366f1', // Indigo
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#ef4444', // Red
  '#f97316', // Orange
  '#eab308', // Yellow
  '#22c55e', // Green
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
  '#6b7280', // Gray
];

export default function NewDeckPage(): React.JSX.Element {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await createDeckAction(formData);
      if (result?.error) {
        setError(result.error);
      }
      // If successful, the action redirects
    });
  }

  return (
    <div className="mx-auto max-w-xl">
      <Link
        href="/decks"
        className="mb-6 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to decks
      </Link>

      <h1 className="text-2xl font-bold text-gray-900">Create a new deck</h1>
      <p className="mt-1 text-gray-600">
        Organize your learning materials into a focused collection
      </p>

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <form action={handleSubmit} className="mt-8 space-y-6">
        {/* Deck name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Deck name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            maxLength={100}
            placeholder="e.g., Spanish Vocabulary, React Hooks, Biology 101"
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description <span className="text-gray-400">(optional)</span>
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            maxLength={500}
            placeholder="What will you learn in this deck?"
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />
        </div>

        {/* Color picker */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Color
          </label>
          <div className="mt-2 flex flex-wrap gap-2">
            {COLORS.map((color, index) => (
              <label key={color} className="cursor-pointer">
                <input
                  type="radio"
                  name="color"
                  value={color}
                  defaultChecked={index === 0}
                  className="peer sr-only"
                />
                <div
                  className="h-8 w-8 rounded-full ring-2 ring-transparent ring-offset-2 transition-all peer-checked:ring-gray-900 peer-focus:ring-primary-500"
                  style={{ backgroundColor: color }}
                />
              </label>
            ))}
          </div>
        </div>

        {/* Submit button */}
        <div className="flex gap-3">
          <Link
            href="/decks"
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isPending}
            className="flex-1 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
          >
            {isPending ? 'Creating...' : 'Create deck'}
          </button>
        </div>
      </form>
    </div>
  );
}
