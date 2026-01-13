'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Clock, Sparkles, RotateCcw } from 'lucide-react';
import type { Card } from '@internalize/shared';

interface CardListProps {
  cards: Card[];
}

function getStateLabel(state: Card['state']): { label: string; color: string } {
  switch (state) {
    case 'new':
      return { label: 'New', color: 'text-blue-600 bg-blue-50' };
    case 'learning':
      return { label: 'Learning', color: 'text-amber-600 bg-amber-50' };
    case 'review':
      return { label: 'Review', color: 'text-green-600 bg-green-50' };
    case 'relearning':
      return { label: 'Relearning', color: 'text-orange-600 bg-orange-50' };
    default:
      return { label: state, color: 'text-gray-600 bg-gray-50' };
  }
}

function formatDue(due: string): string {
  const dueDate = new Date(due);
  const now = new Date();
  const diffMs = dueDate.getTime() - now.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMs < 0) return 'Due now';
  if (diffDays === 0) return 'Due today';
  if (diffDays === 1) return 'Due tomorrow';
  if (diffDays < 7) return `Due in ${diffDays} days`;
  if (diffDays < 30) return `Due in ${Math.floor(diffDays / 7)} weeks`;
  return `Due in ${Math.floor(diffDays / 30)} months`;
}

function CardItem({ card }: { card: Card }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const stateInfo = getStateLabel(card.state);
  const isDue = new Date(card.due) <= new Date();

  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between p-4 text-left"
      >
        <div className="flex-1 pr-4">
          <p className="font-medium text-gray-900 line-clamp-1">{card.front}</p>
          <div className="mt-1 flex items-center gap-3 text-sm">
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${stateInfo.color}`}>
              {stateInfo.label}
            </span>
            {isDue ? (
              <span className="flex items-center gap-1 text-amber-600">
                <Clock className="h-3 w-3" />
                Due now
              </span>
            ) : (
              <span className="text-gray-500">{formatDue(card.due)}</span>
            )}
            {card.reps > 0 && (
              <span className="flex items-center gap-1 text-gray-500">
                <RotateCcw className="h-3 w-3" />
                {card.reps} reviews
              </span>
            )}
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-gray-400" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-400" />
        )}
      </button>

      {isExpanded && (
        <div className="border-t border-gray-100 p-4">
          <div className="space-y-3">
            <div>
              <p className="text-xs font-medium uppercase text-gray-500">Front</p>
              <p className="mt-1 text-gray-900">{card.front}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase text-gray-500">Back</p>
              <p className="mt-1 text-gray-900">{card.back}</p>
            </div>
            {card.notes && (
              <div>
                <p className="text-xs font-medium uppercase text-gray-500">Notes</p>
                <p className="mt-1 text-gray-600">{card.notes}</p>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="mt-4 flex items-center gap-4 border-t border-gray-100 pt-4 text-xs text-gray-500">
            <span>Stability: {card.stability.toFixed(2)}</span>
            <span>Difficulty: {card.difficulty.toFixed(2)}</span>
            <span>Lapses: {card.lapses}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export function CardList({ cards }: CardListProps) {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-medium text-gray-900">Cards ({cards.length})</h2>
      </div>
      <div className="space-y-2">
        {cards.map((card) => (
          <CardItem key={card.id} card={card} />
        ))}
      </div>
    </div>
  );
}
