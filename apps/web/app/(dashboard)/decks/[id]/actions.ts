'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createCard, deleteCard } from '@internalize/api-client';

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
