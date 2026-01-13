import { Plus } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getDecksWithStats } from '@internalize/api-client';
import { DeckCard } from './deck-card';

export default async function DecksPage() {
  const supabase = await createClient();

  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser();

  let decks: Awaited<ReturnType<typeof getDecksWithStats>> = [];

  if (user) {
    try {
      decks = await getDecksWithStats(supabase);
    } catch (error) {
      console.error('Failed to fetch decks:', error);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Your Decks</h1>
          <p className="mt-1 text-gray-600">
            Organize your learning materials into decks
          </p>
        </div>
        <Link
          href="/decks/new"
          className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
        >
          <Plus className="h-4 w-4" />
          New Deck
        </Link>
      </div>

      {decks.length === 0 ? (
        /* Empty state */
        <div className="mt-12 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 py-16">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <Plus className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No decks yet</h3>
          <p className="mt-1 text-gray-600">
            Create your first deck to start learning
          </p>
          <Link
            href="/decks/new"
            className="mt-6 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
          >
            Create a deck
          </Link>
        </div>
      ) : (
        /* Deck grid */
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {decks.map((deck) => (
            <DeckCard key={deck.id} deck={deck} />
          ))}
        </div>
      )}
    </div>
  );
}
