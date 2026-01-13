import { getSupabaseClient, CompatibleSupabaseClient } from '../client';
import type { Deck, DeckWithStats } from '@internalize/shared';

/**
 * Transform database row to Deck type
 */
function transformDeck(row: Record<string, unknown>): Deck {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    name: row.name as string,
    description: row.description as string | null,
    color: row.color as string,
    isArchived: row.is_archived as boolean,
    cardCount: row.card_count as number,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

/**
 * Get all decks for the current user
 */
export async function getDecks(
  client?: CompatibleSupabaseClient
): Promise<Deck[]> {
  const supabase = client ?? getSupabaseClient();

  const { data, error } = await supabase
    .from('decks')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return (data ?? []).map(transformDeck);
}

/**
 * Get a single deck by ID
 */
export async function getDeck(
  deckId: string,
  client?: CompatibleSupabaseClient
): Promise<Deck | null> {
  const supabase = client ?? getSupabaseClient();

  const { data, error } = await supabase
    .from('decks')
    .select('*')
    .eq('id', deckId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }
  return data ? transformDeck(data) : null;
}

/**
 * Get decks with stats (card counts by state)
 */
export async function getDecksWithStats(
  client?: CompatibleSupabaseClient
): Promise<DeckWithStats[]> {
  const supabase = client ?? getSupabaseClient();

  // Get decks
  const { data: decks, error: decksError } = await supabase
    .from('decks')
    .select('*')
    .order('updated_at', { ascending: false });

  if (decksError) throw decksError;

  // Get card counts for each deck
  const now = new Date().toISOString();
  const deckIds = (decks ?? []).map((d: Record<string, unknown>) => d.id as string);

  if (deckIds.length === 0) return [];

  const { data: cards, error: cardsError } = await supabase
    .from('cards')
    .select('deck_id, state, due, is_suspended')
    .in('deck_id', deckIds);

  if (cardsError) throw cardsError;

  // Calculate stats for each deck
  const deckStats = new Map<
    string,
    {
      newCount: number;
      learningCount: number;
      reviewCount: number;
      dueCount: number;
      masteredCount: number;
    }
  >();

  for (const deckId of deckIds) {
    deckStats.set(deckId, {
      newCount: 0,
      learningCount: 0,
      reviewCount: 0,
      dueCount: 0,
      masteredCount: 0,
    });
  }

  for (const card of cards ?? []) {
    const stats = deckStats.get(card.deck_id);
    if (!stats) continue;

    if (card.state === 'new') stats.newCount++;
    else if (card.state === 'learning' || card.state === 'relearning')
      stats.learningCount++;
    else if (card.state === 'review') stats.reviewCount++;

    if (!card.is_suspended && card.due <= now) stats.dueCount++;

    // Consider cards with high stability as "mastered"
    // (This is a simplification - could be more sophisticated)
  }

  return (decks ?? []).map((deck: Record<string, unknown>) => ({
    ...transformDeck(deck),
    ...(deckStats.get(deck.id as string) ?? {
      newCount: 0,
      learningCount: 0,
      reviewCount: 0,
      dueCount: 0,
      masteredCount: 0,
    }),
  }));
}
