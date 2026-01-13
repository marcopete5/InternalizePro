import { z } from 'zod';

// Card types supported by the app
export const CardTypeSchema = z.enum([
  'basic',      // Simple Q&A
  'cloze',      // Fill in the blank
  'concept',    // Explain in your own words
  'application' // Apply to a scenario
]);
export type CardType = z.infer<typeof CardTypeSchema>;

// FSRS card states
export const CardStateSchema = z.enum([
  'new',        // Never reviewed
  'learning',   // In initial learning phase
  'review',     // In regular review cycle
  'relearning'  // Lapsed, relearning
]);
export type CardState = z.infer<typeof CardStateSchema>;

// Rating labels (string representation)
export const RatingLabelSchema = z.enum(['again', 'hard', 'good', 'easy']);
export type RatingLabel = z.infer<typeof RatingLabelSchema>;

// Numeric rating for database storage
export const RatingValueSchema = z.union([
  z.literal(1), // Again
  z.literal(2), // Hard
  z.literal(3), // Good
  z.literal(4), // Easy
]);
export type RatingValue = z.infer<typeof RatingValueSchema>;

// FSRS scheduling parameters for a card
export const FSRSStateSchema = z.object({
  stability: z.number().min(0).default(0),
  difficulty: z.number().min(0).max(10).default(0),
  elapsedDays: z.number().int().min(0).default(0),
  scheduledDays: z.number().int().min(0).default(0),
  reps: z.number().int().min(0).default(0),
  lapses: z.number().int().min(0).default(0),
  state: CardStateSchema.default('new'),
  lastReview: z.string().datetime().nullable().default(null),
  due: z.string().datetime(),
});
export type FSRSState = z.infer<typeof FSRSStateSchema>;

// Card content
export const CardContentSchema = z.object({
  front: z.string().min(1, 'Front content is required'),
  back: z.string().min(1, 'Back content is required'),
  notes: z.string().optional(),
  frontImageUrl: z.string().url().optional(),
  backImageUrl: z.string().url().optional(),
});
export type CardContent = z.infer<typeof CardContentSchema>;

// Quality assessment from AI
export const QualityAssessmentSchema = z.object({
  score: z.number().min(0).max(1),
  feedback: z.string().optional(),
  suggestions: z.array(z.string()).optional(),
});
export type QualityAssessment = z.infer<typeof QualityAssessmentSchema>;

// Full card schema
export const CardSchema = z.object({
  id: z.string().uuid(),
  deckId: z.string().uuid(),
  userId: z.string().uuid(),

  cardType: CardTypeSchema.default('basic'),

  // Content
  front: z.string().min(1),
  back: z.string().min(1),
  notes: z.string().nullable().optional(),
  frontImageUrl: z.string().url().nullable().optional(),
  backImageUrl: z.string().url().nullable().optional(),

  // FSRS state
  stability: z.number().default(0),
  difficulty: z.number().default(0),
  elapsedDays: z.number().int().default(0),
  scheduledDays: z.number().int().default(0),
  reps: z.number().int().default(0),
  lapses: z.number().int().default(0),
  state: CardStateSchema.default('new'),
  lastReview: z.string().datetime().nullable(),
  due: z.string().datetime(),

  // Quality
  qualityScore: z.number().min(0).max(1).nullable().optional(),
  qualityFeedback: z.string().nullable().optional(),

  // Metadata
  isSuspended: z.boolean().default(false),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Card = z.infer<typeof CardSchema>;

// Schema for creating a new card
export const CreateCardSchema = z.object({
  deckId: z.string().uuid(),
  cardType: CardTypeSchema.default('basic'),
  front: z.string().min(1, 'Front content is required'),
  back: z.string().min(1, 'Back content is required'),
  notes: z.string().optional(),
  frontImageUrl: z.string().url().optional(),
  backImageUrl: z.string().url().optional(),
});
export type CreateCard = z.infer<typeof CreateCardSchema>;

// Schema for updating a card
export const UpdateCardSchema = z.object({
  cardType: CardTypeSchema.optional(),
  front: z.string().min(1).optional(),
  back: z.string().min(1).optional(),
  notes: z.string().nullable().optional(),
  frontImageUrl: z.string().url().nullable().optional(),
  backImageUrl: z.string().url().nullable().optional(),
  isSuspended: z.boolean().optional(),
});
export type UpdateCard = z.infer<typeof UpdateCardSchema>;

// Card with computed properties for display
export const CardWithStatsSchema = CardSchema.extend({
  reviewCount: z.number().int().min(0),
  correctRate: z.number().min(0).max(1),
  averageResponseTime: z.number().min(0).optional(),
});
export type CardWithStats = z.infer<typeof CardWithStatsSchema>;
