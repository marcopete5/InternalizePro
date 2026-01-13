import { getSupabaseClient, CompatibleSupabaseClient } from '../client';
import type { CreateCard, UpdateCard, Card, RatingValue } from '@internalize/shared';
import { getScheduler } from '@internalize/shared/fsrs';

/**
 * Create a new card
 */
export async function createCard(
  card: CreateCard,
  client?: CompatibleSupabaseClient
): Promise<Card> {
  const supabase = client ?? getSupabaseClient();

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!user) throw new Error('Not authenticated');

  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('cards')
    .insert({
      deck_id: card.deckId,
      user_id: user.id,
      card_type: card.cardType ?? 'basic',
      front: card.front,
      back: card.back,
      notes: card.notes,
      front_image_url: card.frontImageUrl,
      back_image_url: card.backImageUrl,
      state: 'new',
      due: now,
    })
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error('Failed to create card');

  // Update deck card count
  await supabase.rpc('increment_deck_card_count', { deck_id: card.deckId });

  return transformCard(data);
}

/**
 * Create multiple cards at once
 */
export async function createCards(
  cards: CreateCard[],
  client?: CompatibleSupabaseClient
): Promise<Card[]> {
  const supabase = client ?? getSupabaseClient();

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!user) throw new Error('Not authenticated');

  const now = new Date().toISOString();

  const cardsToInsert = cards.map((card) => ({
    deck_id: card.deckId,
    user_id: user.id,
    card_type: card.cardType ?? 'basic',
    front: card.front,
    back: card.back,
    notes: card.notes,
    front_image_url: card.frontImageUrl,
    back_image_url: card.backImageUrl,
    state: 'new',
    due: now,
  }));

  const { data, error } = await supabase
    .from('cards')
    .insert(cardsToInsert)
    .select();

  if (error) throw error;
  if (!data) throw new Error('Failed to create cards');

  // Update deck card counts
  const deckCounts = new Map<string, number>();
  for (const card of cards) {
    deckCounts.set(card.deckId, (deckCounts.get(card.deckId) ?? 0) + 1);
  }
  // Note: This should ideally be a transaction or batch update

  return data.map(transformCard);
}

/**
 * Update a card
 */
export async function updateCard(
  cardId: string,
  updates: UpdateCard,
  client?: CompatibleSupabaseClient
): Promise<Card> {
  const supabase = client ?? getSupabaseClient();

  const { data, error } = await supabase
    .from('cards')
    .update({
      card_type: updates.cardType,
      front: updates.front,
      back: updates.back,
      notes: updates.notes,
      front_image_url: updates.frontImageUrl,
      back_image_url: updates.backImageUrl,
      is_suspended: updates.isSuspended,
      updated_at: new Date().toISOString(),
    })
    .eq('id', cardId)
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error('Card not found');

  return transformCard(data);
}

/**
 * Delete a card
 */
export async function deleteCard(
  cardId: string,
  client?: CompatibleSupabaseClient
): Promise<void> {
  const supabase = client ?? getSupabaseClient();

  // Get the card first to know which deck to update
  const { data: card, error: fetchError } = await supabase
    .from('cards')
    .select('deck_id')
    .eq('id', cardId)
    .single();

  if (fetchError) throw fetchError;

  const { error } = await supabase
    .from('cards')
    .delete()
    .eq('id', cardId);

  if (error) throw error;

  // Update deck card count
  if (card) {
    await supabase.rpc('decrement_deck_card_count', { deck_id: card.deck_id });
  }
}

/**
 * Record a review for a card
 */
export async function reviewCard(
  cardId: string,
  rating: RatingValue,
  options: {
    confidence?: number;
    responseTimeMs?: number;
  } = {},
  client?: CompatibleSupabaseClient
): Promise<Card> {
  const supabase = client ?? getSupabaseClient();

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!user) throw new Error('Not authenticated');

  // Get current card state
  const { data: cardData, error: cardError } = await supabase
    .from('cards')
    .select('*')
    .eq('id', cardId)
    .single();

  if (cardError) throw cardError;
  if (!cardData) throw new Error('Card not found');

  const card = transformCard(cardData);

  // Calculate new scheduling
  const scheduler = getScheduler();
  const result = scheduler.review(card, rating);

  // Update card with new scheduling
  const { data: updatedCard, error: updateError } = await supabase
    .from('cards')
    .update({
      stability: result.cardUpdate.stability,
      difficulty: result.cardUpdate.difficulty,
      elapsed_days: result.cardUpdate.elapsedDays,
      scheduled_days: result.cardUpdate.scheduledDays,
      reps: result.cardUpdate.reps,
      lapses: result.cardUpdate.lapses,
      state: result.cardUpdate.state,
      last_review: result.cardUpdate.lastReview,
      due: result.cardUpdate.due,
      updated_at: new Date().toISOString(),
    })
    .eq('id', cardId)
    .select()
    .single();

  if (updateError) throw updateError;

  // Record the review log
  const { error: logError } = await supabase
    .from('review_logs')
    .insert({
      card_id: cardId,
      user_id: user.id,
      rating,
      confidence: options.confidence,
      response_time_ms: options.responseTimeMs,
      stability_before: result.reviewLog.stabilityBefore,
      difficulty_before: result.reviewLog.difficultyBefore,
      state_before: result.reviewLog.stateBefore,
      scheduled_days: result.reviewLog.scheduledDays,
      elapsed_days: result.reviewLog.elapsedDays,
    });

  if (logError) throw logError;

  return transformCard(updatedCard!);
}

/**
 * Suspend/unsuspend a card
 */
export async function toggleCardSuspend(
  cardId: string,
  isSuspended: boolean,
  client?: CompatibleSupabaseClient
): Promise<Card> {
  return updateCard(cardId, { isSuspended }, client);
}

/**
 * Reset a card's progress (back to new state)
 */
export async function resetCard(
  cardId: string,
  client?: CompatibleSupabaseClient
): Promise<Card> {
  const supabase = client ?? getSupabaseClient();

  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('cards')
    .update({
      stability: 0,
      difficulty: 0,
      elapsed_days: 0,
      scheduled_days: 0,
      reps: 0,
      lapses: 0,
      state: 'new',
      last_review: null,
      due: now,
      updated_at: now,
    })
    .eq('id', cardId)
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error('Card not found');

  return transformCard(data);
}

/**
 * Transform database row to Card type
 */
function transformCard(row: Record<string, unknown>): Card {
  return {
    id: row.id as string,
    deckId: row.deck_id as string,
    userId: row.user_id as string,
    cardType: row.card_type as Card['cardType'],
    front: row.front as string,
    back: row.back as string,
    notes: row.notes as string | null,
    frontImageUrl: row.front_image_url as string | null,
    backImageUrl: row.back_image_url as string | null,
    stability: row.stability as number,
    difficulty: row.difficulty as number,
    elapsedDays: row.elapsed_days as number,
    scheduledDays: row.scheduled_days as number,
    reps: row.reps as number,
    lapses: row.lapses as number,
    state: row.state as Card['state'],
    lastReview: row.last_review as string | null,
    due: row.due as string,
    qualityScore: row.quality_score as number | null,
    qualityFeedback: row.quality_feedback as string | null,
    isSuspended: row.is_suspended as boolean,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}
