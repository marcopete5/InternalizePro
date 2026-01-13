'use client';

import { useState, useCallback, useMemo } from 'react';
import { X, Check, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { Card, RatingValue } from '@internalize/shared';
import { getScheduler } from '@internalize/shared/fsrs';
import { reviewCardAction } from './actions';

interface ReviewSessionProps {
  initialCards: Card[];
  deckId?: string;
}

type SessionState = 'reviewing' | 'complete';

export function ReviewSession({ initialCards, deckId }: ReviewSessionProps) {
  const [cards, setCards] = useState<Card[]>(initialCards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [sessionState, setSessionState] = useState<SessionState>('reviewing');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewedCount, setReviewedCount] = useState(0);
  const [startTime] = useState(() => Date.now());

  const currentCard = cards[currentIndex];
  const scheduler = useMemo(() => getScheduler(), []);

  // Get preview intervals for current card
  const preview = useMemo(() => {
    if (!currentCard) return null;
    return scheduler.getPreview(currentCard);
  }, [currentCard, scheduler]);

  const handleRating = useCallback(async (rating: RatingValue) => {
    if (!currentCard || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const result = await reviewCardAction(currentCard.id, rating);

      if (result.error) {
        console.error('Failed to submit review:', result.error);
        // Continue anyway to not block the user
      }

      setReviewedCount((prev) => prev + 1);

      // Move to next card
      if (currentIndex + 1 < cards.length) {
        setCurrentIndex((prev) => prev + 1);
        setShowAnswer(false);
      } else {
        setSessionState('complete');
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [currentCard, currentIndex, cards.length, isSubmitting]);

  // Keyboard shortcuts
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (sessionState !== 'reviewing') return;

    if (!showAnswer) {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        setShowAnswer(true);
      }
    } else {
      if (e.key === '1') handleRating(1);
      if (e.key === '2') handleRating(2);
      if (e.key === '3') handleRating(3);
      if (e.key === '4') handleRating(4);
    }
  }, [showAnswer, sessionState, handleRating]);

  if (sessionState === 'complete') {
    const duration = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;

    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <Check className="h-10 w-10 text-green-600" />
        </div>
        <h1 className="mt-6 text-2xl font-bold text-gray-900">Session complete!</h1>
        <p className="mt-2 text-gray-600">
          You reviewed {reviewedCount} cards in {minutes > 0 ? `${minutes}m ` : ''}{seconds}s
        </p>
        <div className="mt-8 flex gap-4">
          <Link
            href="/decks"
            className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Back to decks
          </Link>
          <Link
            href={deckId ? `/review?deck=${deckId}` : '/review'}
            className="rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-primary-700"
            onClick={() => window.location.reload()}
          >
            Review more
          </Link>
        </div>
      </div>
    );
  }

  if (!currentCard) {
    return null;
  }

  return (
    <div
      className="flex min-h-[70vh] flex-col"
      onKeyDown={handleKeyPress}
      tabIndex={0}
    >
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href={deckId ? `/decks/${deckId}` : '/decks'}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Exit
        </Link>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>
            {currentIndex + 1} / {cards.length}
          </span>
          <span className="text-green-600">{reviewedCount} reviewed</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-8 h-1 w-full rounded-full bg-gray-200">
        <div
          className="h-full rounded-full bg-primary-600 transition-all"
          style={{ width: `${((currentIndex) / cards.length) * 100}%` }}
        />
      </div>

      {/* Card */}
      <div className="flex flex-1 flex-col items-center justify-center">
        <div className="w-full max-w-2xl">
          {/* Front */}
          <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
            <p className="text-center text-xl text-gray-900">{currentCard.front}</p>
          </div>

          {/* Answer section */}
          {showAnswer ? (
            <>
              {/* Divider */}
              <div className="my-6 border-t border-gray-200" />

              {/* Back */}
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-8">
                <p className="text-center text-xl text-gray-900">{currentCard.back}</p>
                {currentCard.notes && (
                  <p className="mt-4 text-center text-sm text-gray-600">
                    {currentCard.notes}
                  </p>
                )}
              </div>

              {/* Rating buttons */}
              <div className="mt-8 grid grid-cols-4 gap-3">
                <RatingButton
                  label="Again"
                  interval={preview?.again.label ?? ''}
                  color="red"
                  onClick={() => handleRating(1)}
                  disabled={isSubmitting}
                  shortcut="1"
                />
                <RatingButton
                  label="Hard"
                  interval={preview?.hard.label ?? ''}
                  color="orange"
                  onClick={() => handleRating(2)}
                  disabled={isSubmitting}
                  shortcut="2"
                />
                <RatingButton
                  label="Good"
                  interval={preview?.good.label ?? ''}
                  color="green"
                  onClick={() => handleRating(3)}
                  disabled={isSubmitting}
                  shortcut="3"
                />
                <RatingButton
                  label="Easy"
                  interval={preview?.easy.label ?? ''}
                  color="blue"
                  onClick={() => handleRating(4)}
                  disabled={isSubmitting}
                  shortcut="4"
                />
              </div>
            </>
          ) : (
            /* Show answer button */
            <button
              onClick={() => setShowAnswer(true)}
              className="mt-8 w-full rounded-xl bg-primary-600 py-4 text-lg font-medium text-white hover:bg-primary-700"
            >
              Show Answer
              <span className="ml-2 text-sm opacity-75">(Space)</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

interface RatingButtonProps {
  label: string;
  interval: string;
  color: 'red' | 'orange' | 'green' | 'blue';
  onClick: () => void;
  disabled: boolean;
  shortcut: string;
}

function RatingButton({ label, interval, color, onClick, disabled, shortcut }: RatingButtonProps) {
  const colorClasses = {
    red: 'bg-red-50 text-red-700 hover:bg-red-100 border-red-200',
    orange: 'bg-orange-50 text-orange-700 hover:bg-orange-100 border-orange-200',
    green: 'bg-green-50 text-green-700 hover:bg-green-100 border-green-200',
    blue: 'bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded-xl border px-4 py-3 text-center transition-colors disabled:opacity-50 ${colorClasses[color]}`}
    >
      <div className="text-sm font-medium">{label}</div>
      <div className="mt-1 text-xs opacity-75">{interval}</div>
      <div className="mt-1 text-xs opacity-50">({shortcut})</div>
    </button>
  );
}
