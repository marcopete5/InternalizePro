import { z } from 'zod';

// Deck schema
export const DeckSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  name: z.string().min(1, 'Deck name is required').max(100),
  description: z.string().max(500).nullable().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#6366f1'),
  isArchived: z.boolean().default(false),
  cardCount: z.number().int().min(0).default(0),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Deck = z.infer<typeof DeckSchema>;

// Schema for creating a new deck
export const CreateDeckSchema = z.object({
  name: z.string().min(1, 'Deck name is required').max(100),
  description: z.string().max(500).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#6366f1'),
});
export type CreateDeck = z.infer<typeof CreateDeckSchema>;

// Schema for updating a deck
export const UpdateDeckSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).nullable().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  isArchived: z.boolean().optional(),
});
export type UpdateDeck = z.infer<typeof UpdateDeckSchema>;

// Deck with additional stats for dashboard
export const DeckWithStatsSchema = DeckSchema.extend({
  newCount: z.number().int().min(0),
  learningCount: z.number().int().min(0),
  reviewCount: z.number().int().min(0),
  dueCount: z.number().int().min(0),
  masteredCount: z.number().int().min(0),
});
export type DeckWithStats = z.infer<typeof DeckWithStatsSchema>;
