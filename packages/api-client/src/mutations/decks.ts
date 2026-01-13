import { getSupabaseClient, CompatibleSupabaseClient } from '../client';
import type { CreateDeck, UpdateDeck, Deck } from '@internalize/shared';

/**
 * Create a new deck
 */
export async function createDeck(
  deck: CreateDeck,
  client?: CompatibleSupabaseClient
): Promise<Deck> {
  const supabase = client ?? getSupabaseClient();

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('decks')
    .insert({
      user_id: user.id,
      name: deck.name,
      description: deck.description,
      color: deck.color,
    })
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error('Failed to create deck');

  return {
    id: data.id,
    userId: data.user_id,
    name: data.name,
    description: data.description,
    color: data.color,
    isArchived: data.is_archived,
    cardCount: data.card_count,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

/**
 * Update a deck
 */
export async function updateDeck(
  deckId: string,
  updates: UpdateDeck,
  client?: CompatibleSupabaseClient
): Promise<Deck> {
  const supabase = client ?? getSupabaseClient();

  const { data, error } = await supabase
    .from('decks')
    .update({
      name: updates.name,
      description: updates.description,
      color: updates.color,
      is_archived: updates.isArchived,
      updated_at: new Date().toISOString(),
    })
    .eq('id', deckId)
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error('Deck not found');

  return {
    id: data.id,
    userId: data.user_id,
    name: data.name,
    description: data.description,
    color: data.color,
    isArchived: data.is_archived,
    cardCount: data.card_count,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

/**
 * Delete a deck (and all its cards)
 */
export async function deleteDeck(
  deckId: string,
  client?: CompatibleSupabaseClient
): Promise<void> {
  const supabase = client ?? getSupabaseClient();

  const { error } = await supabase
    .from('decks')
    .delete()
    .eq('id', deckId);

  if (error) throw error;
}

/**
 * Archive/unarchive a deck
 */
export async function toggleDeckArchive(
  deckId: string,
  isArchived: boolean,
  client?: CompatibleSupabaseClient
): Promise<Deck> {
  return updateDeck(deckId, { isArchived }, client);
}
