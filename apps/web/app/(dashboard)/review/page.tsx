import { BookOpen } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getReviewSessionCards } from '@internalize/api-client';
import { ReviewSession } from './review-session';

interface ReviewPageProps {
  searchParams: Promise<{ deck?: string }>;
}

export default async function ReviewPage({ searchParams }: ReviewPageProps) {
  const { deck: deckId } = await searchParams;
  const supabase = await createClient();

  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser();

  let cards: Awaited<ReturnType<typeof getReviewSessionCards>> = [];

  if (user) {
    try {
      cards = await getReviewSessionCards(
        { deckId, newCardsLimit: 10, reviewLimit: 100 },
        supabase
      );
    } catch (error) {
      console.error('Failed to fetch cards for review:', error);
    }
  }

  if (cards.length === 0) {
    return (
      <div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Review</h1>
          <p className="mt-1 text-gray-600">
            Practice your cards with spaced repetition
          </p>
        </div>

        {/* Empty state */}
        <div className="mt-12 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 py-16">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <BookOpen className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            No cards to review
          </h3>
          <p className="mt-1 text-center text-gray-600">
            {deckId
              ? 'This deck has no cards due for review'
              : 'Create some cards first, then come back to review'}
          </p>
          <Link
            href="/decks"
            className="mt-6 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
          >
            Go to decks
          </Link>
        </div>
      </div>
    );
  }

  return <ReviewSession initialCards={cards} deckId={deckId} />;
}
