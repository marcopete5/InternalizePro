import { z } from 'zod';
import { RatingValueSchema, CardStateSchema } from './card';

// Review log entry
export const ReviewLogSchema = z.object({
  id: z.string().uuid(),
  cardId: z.string().uuid(),
  userId: z.string().uuid(),

  // Review data
  rating: RatingValueSchema,
  confidence: z.number().int().min(1).max(5).nullable().optional(),
  responseTimeMs: z.number().int().min(0).nullable().optional(),

  // FSRS state before this review
  stabilityBefore: z.number().nullable().optional(),
  difficultyBefore: z.number().nullable().optional(),
  stateBefore: CardStateSchema.nullable().optional(),

  // Scheduling result
  scheduledDays: z.number().int().min(0),
  elapsedDays: z.number().int().min(0),

  reviewedAt: z.string().datetime(),
});
export type ReviewLog = z.infer<typeof ReviewLogSchema>;

// Input for recording a review
export const RecordReviewSchema = z.object({
  cardId: z.string().uuid(),
  rating: RatingValueSchema,
  confidence: z.number().int().min(1).max(5).optional(),
  responseTimeMs: z.number().int().min(0).optional(),
});
export type RecordReview = z.infer<typeof RecordReviewSchema>;

// Study session
export const StudySessionSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  deckId: z.string().uuid().nullable().optional(),

  cardsReviewed: z.number().int().min(0).default(0),
  cardsNew: z.number().int().min(0).default(0),
  cardsRelearning: z.number().int().min(0).default(0),

  durationSeconds: z.number().int().min(0).nullable().optional(),

  startedAt: z.string().datetime(),
  endedAt: z.string().datetime().nullable().optional(),
});
export type StudySession = z.infer<typeof StudySessionSchema>;

// Review statistics for a time period
export const ReviewStatsSchema = z.object({
  totalReviews: z.number().int().min(0),
  correctReviews: z.number().int().min(0),
  incorrectReviews: z.number().int().min(0),
  averageResponseTime: z.number().min(0).optional(),
  retentionRate: z.number().min(0).max(1),
  streakDays: z.number().int().min(0),
});
export type ReviewStats = z.infer<typeof ReviewStatsSchema>;
