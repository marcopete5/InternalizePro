import { ArrowLeft, Plus, Play, MoreHorizontal } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getDeck, getCardsByDeck, getDueCards } from '@internalize/api-client';
import { CardList } from './card-list';
import { AddCardForm } from './add-card-form';

interface DeckPageProps {
  params: Promise<{ id: string }>;
}

export default async function DeckPage({ params }: DeckPageProps): Promise<React.JSX.Element> {
  const { id } = await params;
  const supabase = await createClient();

  const [deck, cards, dueCards] = await Promise.all([
    getDeck(id, supabase),
    getCardsByDeck(id, supabase),
    getDueCards(id, undefined, supabase),
  ]);

  if (!deck) {
    notFound();
  }

  const dueCount = dueCards.length;
  const newCount = cards.filter((c) => c.state === 'new').length;

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/decks"
          className="mb-4 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to decks
        </Link>

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div
              className="h-4 w-4 rounded-full"
              style={{ backgroundColor: deck.color }}
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{deck.name}</h1>
              {deck.description && (
                <p className="mt-1 text-gray-600">{deck.description}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {dueCount > 0 && (
              <Link
                href={`/review?deck=${deck.id}`}
                className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
              >
                <Play className="h-4 w-4" />
                Study ({dueCount} due)
              </Link>
            )}
            <button className="rounded-lg border border-gray-300 p-2 text-gray-600 hover:bg-gray-50">
              <MoreHorizontal className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Stats bar */}
        <div className="mt-4 flex items-center gap-6 text-sm text-gray-600">
          <span>{cards.length} cards</span>
          {newCount > 0 && <span className="text-blue-600">{newCount} new</span>}
          {dueCount > 0 && (
            <span className="text-amber-600">{dueCount} due for review</span>
          )}
        </div>
      </div>

      {/* Add card form */}
      <div className="mb-8">
        <AddCardForm deckId={deck.id} />
      </div>

      {/* Card list */}
      {cards.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 py-16">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <Plus className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No cards yet</h3>
          <p className="mt-1 text-gray-600">
            Add your first card using the form above
          </p>
        </div>
      ) : (
        <CardList cards={cards} />
      )}
    </div>
  );
}
