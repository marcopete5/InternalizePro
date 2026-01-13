'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createCard, createCards, deleteCard } from '@internalize/api-client';
import type { CreateCard } from '@internalize/shared';

export async function createCardAction(deckId: string, formData: FormData) {
  const supabase = await createClient();

  const front = formData.get('front') as string;
  const back = formData.get('back') as string;
  const notes = formData.get('notes') as string || undefined;

  if (!front?.trim() || !back?.trim()) {
    return { error: 'Front and back are required' };
  }

  try {
    await createCard(
      {
        deckId,
        cardType: 'basic',
        front: front.trim(),
        back: back.trim(),
        notes: notes?.trim() || undefined,
      },
      supabase
    );

    revalidatePath(`/decks/${deckId}`);
    revalidatePath('/decks');
    return { success: true };
  } catch (error) {
    console.error('Failed to create card:', error);
    return { error: 'Failed to create card. Please try again.' };
  }
}

export async function deleteCardAction(cardId: string, deckId: string) {
  const supabase = await createClient();

  try {
    await deleteCard(cardId, supabase);
    revalidatePath(`/decks/${deckId}`);
    revalidatePath('/decks');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete card:', error);
    return { error: 'Failed to delete card. Please try again.' };
  }
}

const MAX_IMPORT_SIZE = 500;

export async function importCardsAction(
  deckId: string,
  cards: Array<{ front: string; back: string; notes?: string }>
) {
  const supabase = await createClient();

  // Validate all cards have required fields
  for (const card of cards) {
    if (!card.front?.trim() || !card.back?.trim()) {
      return { error: 'All cards must have front and back content' };
    }
  }

  // Limit import size to prevent abuse
  if (cards.length > MAX_IMPORT_SIZE) {
    return { error: `Cannot import more than ${MAX_IMPORT_SIZE} cards at once` };
  }

  if (cards.length === 0) {
    return { error: 'No cards to import' };
  }

  try {
    const createCardData: CreateCard[] = cards.map((card) => ({
      deckId,
      cardType: 'basic' as const,
      front: card.front.trim(),
      back: card.back.trim(),
      notes: card.notes?.trim() || undefined,
    }));

    await createCards(createCardData, supabase);

    revalidatePath(`/decks/${deckId}`);
    revalidatePath('/decks');

    return { success: true, count: cards.length };
  } catch (error) {
    console.error('Failed to import cards:', error);
    return { error: 'Failed to import cards. Please try again.' };
  }
}
