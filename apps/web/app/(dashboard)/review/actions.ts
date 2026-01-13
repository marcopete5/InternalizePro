'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { reviewCard } from '@internalize/api-client';
import type { RatingValue } from '@internalize/shared';

export async function reviewCardAction(
  cardId: string,
  rating: RatingValue,
  options?: {
    confidence?: number;
    responseTimeMs?: number;
  }
) {
  const supabase = await createClient();

  try {
    await reviewCard(cardId, rating, options ?? {}, supabase);

    // Revalidate pages that show card data
    revalidatePath('/decks');
    revalidatePath('/review');

    return { success: true };
  } catch (error) {
    console.error('Failed to review card:', error);
    return { error: 'Failed to submit review. Please try again.' };
  }
}
