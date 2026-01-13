import { getSupabaseClient, CompatibleSupabaseClient } from '../client';
import type { Card } from '@internalize/shared';

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

/**
 * Get all cards in a deck
 */
export async function getCardsByDeck(
  deckId: string,
  client?: CompatibleSupabaseClient
): Promise<Card[]> {
  const supabase = client ?? getSupabaseClient();

  const { data, error } = await supabase
    .from('cards')
    .select('*')
    .eq('deck_id', deckId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []).map(transformCard);
}

/**
 * Get a single card by ID
 */
export async function getCard(
  cardId: string,
  client?: CompatibleSupabaseClient
): Promise<Card | null> {
  const supabase = client ?? getSupabaseClient();

  const { data, error } = await supabase
    .from('cards')
    .select('*')
    .eq('id', cardId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data ? transformCard(data) : null;
}

/**
 * Get due cards for review (across all decks or a specific deck)
 */
export async function getDueCards(
  deckId?: string,
  limit: number = 100,
  client?: CompatibleSupabaseClient
): Promise<Card[]> {
  const supabase = client ?? getSupabaseClient();
  const now = new Date().toISOString();

  let query = supabase
    .from('cards')
    .select('*')
    .eq('is_suspended', false)
    .lte('due', now)
    .order('due', { ascending: true })
    .limit(limit);

  if (deckId) {
    query = query.eq('deck_id', deckId);
  }

  const { data, error } = await query;

  if (error) throw error;
  return (data ?? []).map(transformCard);
}

/**
 * Get new cards (never reviewed)
 */
export async function getNewCards(
  deckId?: string,
  limit: number = 10,
  client?: CompatibleSupabaseClient
): Promise<Card[]> {
  const supabase = client ?? getSupabaseClient();

  let query = supabase
    .from('cards')
    .select('*')
    .eq('state', 'new')
    .eq('is_suspended', false)
    .order('created_at', { ascending: true })
    .limit(limit);

  if (deckId) {
    query = query.eq('deck_id', deckId);
  }

  const { data, error } = await query;

  if (error) throw error;
  return (data ?? []).map(transformCard);
}

/**
 * Get cards in learning/relearning state
 */
export async function getLearningCards(
  deckId?: string,
  client?: CompatibleSupabaseClient
): Promise<Card[]> {
  const supabase = client ?? getSupabaseClient();

  let query = supabase
    .from('cards')
    .select('*')
    .in('state', ['learning', 'relearning'])
    .eq('is_suspended', false)
    .order('due', { ascending: true });

  if (deckId) {
    query = query.eq('deck_id', deckId);
  }

  const { data, error } = await query;

  if (error) throw error;
  return (data ?? []).map(transformCard);
}

/**
 * Get cards for a review session
 * Combines due cards, learning cards, and optionally new cards
 */
export async function getReviewSessionCards(
  options: {
    deckId?: string;
    newCardsLimit?: number;
    reviewLimit?: number;
  } = {},
  client?: CompatibleSupabaseClient
): Promise<Card[]> {
  const { deckId, newCardsLimit = 10, reviewLimit = 100 } = options;

  // Get learning cards first (highest priority)
  const learningCards = await getLearningCards(deckId, client);

  // Get due review cards
  const dueCards = await getDueCards(deckId, reviewLimit, client);

  // Get new cards if we have capacity
  const totalDueAndLearning = learningCards.length + dueCards.length;
  const newCardsToFetch = Math.max(0, newCardsLimit - Math.floor(totalDueAndLearning / 10));
  const newCards = newCardsToFetch > 0
    ? await getNewCards(deckId, newCardsToFetch, client)
    : [];

  // Combine and interleave
  // Priority: learning > due > new
  const allCards = [...learningCards, ...dueCards, ...newCards];

  // Remove duplicates (a card could appear in multiple queries)
  const uniqueCards = Array.from(
    new Map(allCards.map((card) => [card.id, card])).values()
  );

  return uniqueCards;
}

/**
 * Search cards by content
 */
export async function searchCards(
  query: string,
  deckId?: string,
  client?: CompatibleSupabaseClient
): Promise<Card[]> {
  const supabase = client ?? getSupabaseClient();

  const searchTerm = `%${query}%`;

  let dbQuery = supabase
    .from('cards')
    .select('*')
    .or(`front.ilike.${searchTerm},back.ilike.${searchTerm},notes.ilike.${searchTerm}`)
    .limit(50);

  if (deckId) {
    dbQuery = dbQuery.eq('deck_id', deckId);
  }

  const { data, error } = await dbQuery;

  if (error) throw error;
  return (data ?? []).map(transformCard);
}
