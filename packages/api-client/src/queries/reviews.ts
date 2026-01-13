import { getSupabaseClient, CompatibleSupabaseClient } from '../client';
import type { ReviewLog, ReviewStats } from '@internalize/shared';

/**
 * Transform database row to ReviewLog type
 */
function transformReviewLog(row: Record<string, unknown>): ReviewLog {
  return {
    id: row.id as string,
    cardId: row.card_id as string,
    userId: row.user_id as string,
    rating: row.rating as ReviewLog['rating'],
    confidence: row.confidence as number | null,
    responseTimeMs: row.response_time_ms as number | null,
    stabilityBefore: row.stability_before as number | null,
    difficultyBefore: row.difficulty_before as number | null,
    stateBefore: row.state_before as ReviewLog['stateBefore'],
    scheduledDays: row.scheduled_days as number,
    elapsedDays: row.elapsed_days as number,
    reviewedAt: row.reviewed_at as string,
  };
}

/**
 * Get review logs for a card
 */
export async function getReviewLogsByCard(
  cardId: string,
  client?: CompatibleSupabaseClient
): Promise<ReviewLog[]> {
  const supabase = client ?? getSupabaseClient();

  const { data, error } = await supabase
    .from('review_logs')
    .select('*')
    .eq('card_id', cardId)
    .order('reviewed_at', { ascending: false });

  if (error) throw error;
  return (data ?? []).map(transformReviewLog);
}

/**
 * Get recent review logs for the user
 */
export async function getRecentReviews(
  limit: number = 100,
  client?: CompatibleSupabaseClient
): Promise<ReviewLog[]> {
  const supabase = client ?? getSupabaseClient();

  const { data, error } = await supabase
    .from('review_logs')
    .select('*')
    .order('reviewed_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []).map(transformReviewLog);
}

/**
 * Get review stats for a time period
 */
export async function getReviewStats(
  days: number = 30,
  client?: CompatibleSupabaseClient
): Promise<ReviewStats> {
  const supabase = client ?? getSupabaseClient();

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await supabase
    .from('review_logs')
    .select('rating, response_time_ms')
    .gte('reviewed_at', startDate.toISOString());

  if (error) throw error;

  const reviews = data ?? [];
  const totalReviews = reviews.length;
  const correctReviews = reviews.filter((r: { rating: number }) => r.rating >= 3).length;
  const incorrectReviews = totalReviews - correctReviews;

  const responseTimes = reviews
    .map((r: { response_time_ms: number | null }) => r.response_time_ms)
    .filter((t: number | null): t is number => t !== null);
  const averageResponseTime =
    responseTimes.length > 0
      ? responseTimes.reduce((a: number, b: number) => a + b, 0) / responseTimes.length
      : undefined;

  const retentionRate = totalReviews > 0 ? correctReviews / totalReviews : 1;

  // Calculate streak (simplified - just count consecutive days with reviews)
  const streakDays = await calculateStreak(client);

  return {
    totalReviews,
    correctReviews,
    incorrectReviews,
    averageResponseTime,
    retentionRate,
    streakDays,
  };
}

/**
 * Calculate the current review streak
 */
async function calculateStreak(
  client?: CompatibleSupabaseClient
): Promise<number> {
  const supabase = client ?? getSupabaseClient();

  // Get distinct review dates for the last 365 days
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 365);

  const { data, error } = await supabase
    .from('review_logs')
    .select('reviewed_at')
    .gte('reviewed_at', startDate.toISOString())
    .order('reviewed_at', { ascending: false });

  if (error) throw error;

  const reviews = data ?? [];
  if (reviews.length === 0) return 0;

  // Get unique dates
  const uniqueDates = new Set(
    reviews.map((r: { reviewed_at: string }) => new Date(r.reviewed_at).toDateString())
  );

  // Count consecutive days from today
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check if user has reviewed today
  if (!uniqueDates.has(today.toDateString())) {
    // Check yesterday - if no review yesterday, streak is 0
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (!uniqueDates.has(yesterday.toDateString())) {
      return 0;
    }
  }

  // Count back from today or yesterday
  const currentDate = new Date(today);
  while (true) {
    if (uniqueDates.has(currentDate.toDateString())) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else if (streak === 0) {
      // First day might be yesterday
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }

    // Safety limit
    if (streak > 365) break;
  }

  return streak;
}

/**
 * Get review count by date for heatmap
 */
export async function getReviewHeatmap(
  days: number = 365,
  client?: CompatibleSupabaseClient
): Promise<Map<string, number>> {
  const supabase = client ?? getSupabaseClient();

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await supabase
    .from('review_logs')
    .select('reviewed_at')
    .gte('reviewed_at', startDate.toISOString());

  if (error) throw error;

  const heatmap = new Map<string, number>();
  for (const review of data ?? []) {
    const date = new Date(review.reviewed_at).toISOString().split('T')[0]!;
    heatmap.set(date, (heatmap.get(date) ?? 0) + 1);
  }

  return heatmap;
}
