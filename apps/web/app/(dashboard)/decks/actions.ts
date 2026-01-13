'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createDeck, updateDeck, deleteDeck } from '@internalize/api-client';
import { CreateDeckSchema } from '@internalize/shared';

export async function createDeckAction(formData: FormData) {
  const supabase = await createClient();

  const rawData = {
    name: formData.get('name') as string,
    description: formData.get('description') as string || undefined,
    color: formData.get('color') as string || '#6366f1',
  };

  // Validate
  const result = CreateDeckSchema.safeParse(rawData);
  if (!result.success) {
    return { error: result.error.errors[0]?.message ?? 'Invalid input' };
  }

  try {
    const deck = await createDeck(result.data, supabase);
    revalidatePath('/decks');
    redirect(`/decks/${deck.id}`);
  } catch (error) {
    console.error('Failed to create deck:', error);
    return { error: 'Failed to create deck. Please try again.' };
  }
}

export async function updateDeckAction(deckId: string, formData: FormData) {
  const supabase = await createClient();

  const rawData = {
    name: formData.get('name') as string,
    description: formData.get('description') as string || undefined,
    color: formData.get('color') as string,
  };

  try {
    await updateDeck(deckId, rawData, supabase);
    revalidatePath('/decks');
    revalidatePath(`/decks/${deckId}`);
    return { success: true };
  } catch (error) {
    console.error('Failed to update deck:', error);
    return { error: 'Failed to update deck. Please try again.' };
  }
}

export async function deleteDeckAction(deckId: string) {
  const supabase = await createClient();

  try {
    await deleteDeck(deckId, supabase);
    revalidatePath('/decks');
    redirect('/decks');
  } catch (error) {
    console.error('Failed to delete deck:', error);
    return { error: 'Failed to delete deck. Please try again.' };
  }
}
