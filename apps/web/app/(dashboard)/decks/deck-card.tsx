import Link from 'next/link';
import { Book, Clock, Sparkles } from 'lucide-react';
import type { DeckWithStats } from '@internalize/shared';

interface DeckCardProps {
  deck: DeckWithStats;
}

export function DeckCard({ deck }: DeckCardProps) {
  const totalCards = deck.cardCount;
  const hasDueCards = deck.dueCount > 0;

  return (
    <Link
      href={`/decks/${deck.id}`}
      className="group block rounded-xl border border-gray-200 bg-white p-5 transition-all hover:border-gray-300 hover:shadow-md"
    >
      {/* Color bar */}
      <div
        className="mb-4 h-2 w-12 rounded-full"
        style={{ backgroundColor: deck.color }}
      />

      {/* Title and description */}
      <h3 className="font-semibold text-gray-900 group-hover:text-primary-600">
        {deck.name}
      </h3>
      {deck.description && (
        <p className="mt-1 line-clamp-2 text-sm text-gray-600">
          {deck.description}
        </p>
      )}

      {/* Stats */}
      <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
        <div className="flex items-center gap-1.5">
          <Book className="h-4 w-4" />
          <span>{totalCards} cards</span>
        </div>

        {hasDueCards && (
          <div className="flex items-center gap-1.5 text-amber-600">
            <Clock className="h-4 w-4" />
            <span>{deck.dueCount} due</span>
          </div>
        )}

        {deck.newCount > 0 && (
          <div className="flex items-center gap-1.5 text-blue-600">
            <Sparkles className="h-4 w-4" />
            <span>{deck.newCount} new</span>
          </div>
        )}
      </div>

      {/* Study button - only show if there are due cards */}
      {hasDueCards && (
        <div className="mt-4">
          <span className="inline-flex items-center rounded-lg bg-primary-50 px-3 py-1.5 text-sm font-medium text-primary-700">
            Study now
          </span>
        </div>
      )}
    </Link>
  );
}
