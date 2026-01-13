import { z } from 'zod';

// User profile (extends Supabase auth.users)
export const ProfileSchema = z.object({
  id: z.string().uuid(),
  displayName: z.string().max(100).nullable().optional(),
  avatarUrl: z.string().url().nullable().optional(),
  timezone: z.string().default('UTC'),
  dailyReviewGoal: z.number().int().min(1).max(500).default(20),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Profile = z.infer<typeof ProfileSchema>;

// Schema for updating profile
export const UpdateProfileSchema = z.object({
  displayName: z.string().max(100).nullable().optional(),
  avatarUrl: z.string().url().nullable().optional(),
  timezone: z.string().optional(),
  dailyReviewGoal: z.number().int().min(1).max(500).optional(),
});
export type UpdateProfile = z.infer<typeof UpdateProfileSchema>;

// User settings (preferences)
export const UserSettingsSchema = z.object({
  // Review settings
  newCardsPerDay: z.number().int().min(0).max(100).default(10),
  maxReviewsPerDay: z.number().int().min(0).max(500).default(100),
  reviewOrder: z.enum(['due', 'random', 'added']).default('due'),

  // UI preferences
  showAnswerTimer: z.boolean().default(true),
  autoPlayAudio: z.boolean().default(false),
  confirmDelete: z.boolean().default(true),

  // Notifications
  dailyReminder: z.boolean().default(true),
  reminderTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).default('09:00'),
});
export type UserSettings = z.infer<typeof UserSettingsSchema>;

// User with all associated data
export const UserWithStatsSchema = ProfileSchema.extend({
  totalCards: z.number().int().min(0),
  totalDecks: z.number().int().min(0),
  cardsLearned: z.number().int().min(0),
  currentStreak: z.number().int().min(0),
  longestStreak: z.number().int().min(0),
});
export type UserWithStats = z.infer<typeof UserWithStatsSchema>;
