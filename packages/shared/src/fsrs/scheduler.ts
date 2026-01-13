/**
 * Scheduler - High-level interface for scheduling cards
 *
 * This module provides convenience functions for working with
 * the FSRS algorithm and our Card types.
 */

import { FSRS, CardSchedulingState, SchedulingResult, formatInterval } from './algorithm';
import { Rating, State, stateFromString, stateToString } from './parameters';
import type { Card, RatingValue } from '../types/card';

/**
 * Convert a Card (from database) to CardSchedulingState (for algorithm)
 */
export function cardToSchedulingState(card: Card): CardSchedulingState {
  return {
    stability: card.stability,
    difficulty: card.difficulty,
    elapsedDays: card.elapsedDays,
    scheduledDays: card.scheduledDays,
    reps: card.reps,
    lapses: card.lapses,
    state: stateFromString(card.state),
    lastReview: card.lastReview ? new Date(card.lastReview) : null,
    due: new Date(card.due),
  };
}

/**
 * Convert CardSchedulingState back to Card partial (for database update)
 */
export function schedulingStateToCardUpdate(state: CardSchedulingState): Partial<Card> {
  return {
    stability: state.stability,
    difficulty: state.difficulty,
    elapsedDays: state.elapsedDays,
    scheduledDays: state.scheduledDays,
    reps: state.reps,
    lapses: state.lapses,
    state: stateToString(state.state),
    lastReview: state.lastReview?.toISOString() ?? null,
    due: state.due.toISOString(),
  };
}

/**
 * Convert RatingValue (1-4) to Rating enum
 */
export function ratingFromValue(value: RatingValue): Rating {
  return value as Rating;
}

/**
 * Review result with next intervals for display
 */
export interface ReviewResult {
  cardUpdate: Partial<Card>;
  reviewLog: {
    rating: RatingValue;
    scheduledDays: number;
    elapsedDays: number;
    stabilityBefore: number;
    difficultyBefore: number;
    stateBefore: string;
  };
}

/**
 * Preview of what happens for each rating
 */
export interface ReviewPreview {
  again: { interval: number; label: string };
  hard: { interval: number; label: string };
  good: { interval: number; label: string };
  easy: { interval: number; label: string };
}

/**
 * Scheduler class - main interface for the app
 */
export class Scheduler {
  private fsrs: FSRS;

  constructor() {
    this.fsrs = new FSRS();
  }

  /**
   * Schedule a card review
   */
  review(card: Card, rating: RatingValue, now: Date = new Date()): ReviewResult {
    const state = cardToSchedulingState(card);
    const result = this.fsrs.schedule(state, ratingFromValue(rating), now);

    return {
      cardUpdate: schedulingStateToCardUpdate(result.card),
      reviewLog: {
        rating,
        scheduledDays: result.reviewLog.scheduledDays,
        elapsedDays: result.reviewLog.elapsedDays,
        stabilityBefore: card.stability,
        difficultyBefore: card.difficulty,
        stateBefore: card.state,
      },
    };
  }

  /**
   * Get a preview of intervals for all ratings
   */
  getPreview(card: Card, now: Date = new Date()): ReviewPreview {
    const state = cardToSchedulingState(card);
    const preview = this.fsrs.preview(state, now);

    return {
      again: {
        interval: preview.again.reviewLog.scheduledDays,
        label: formatInterval(preview.again.reviewLog.scheduledDays),
      },
      hard: {
        interval: preview.hard.reviewLog.scheduledDays,
        label: formatInterval(preview.hard.reviewLog.scheduledDays),
      },
      good: {
        interval: preview.good.reviewLog.scheduledDays,
        label: formatInterval(preview.good.reviewLog.scheduledDays),
      },
      easy: {
        interval: preview.easy.reviewLog.scheduledDays,
        label: formatInterval(preview.easy.reviewLog.scheduledDays),
      },
    };
  }

  /**
   * Calculate current retrievability for a card
   */
  getRetrievability(card: Card, now: Date = new Date()): number {
    if (card.state === 'new') return 1;

    const lastReview = card.lastReview ? new Date(card.lastReview) : null;
    if (!lastReview) return 1;

    const elapsedDays = Math.max(
      0,
      Math.floor(
        (now.getTime() - lastReview.getTime()) / (1000 * 60 * 60 * 24)
      )
    );

    return this.fsrs.calculateRetrievability(card.stability, elapsedDays);
  }

  /**
   * Check if a card is due for review
   */
  isDue(card: Card, now: Date = new Date()): boolean {
    if (card.isSuspended) return false;
    return new Date(card.due) <= now;
  }

  /**
   * Get cards sorted by priority for review
   * Priority: overdue > due today > learning > new
   */
  sortByPriority(cards: Card[], now: Date = new Date()): Card[] {
    return [...cards].sort((a, b) => {
      // Suspended cards go last
      if (a.isSuspended !== b.isSuspended) {
        return a.isSuspended ? 1 : -1;
      }

      const aDue = new Date(a.due);
      const bDue = new Date(b.due);
      const aOverdue = aDue < now;
      const bOverdue = bDue < now;

      // Overdue cards first
      if (aOverdue !== bOverdue) {
        return aOverdue ? -1 : 1;
      }

      // Then by state priority
      const statePriority: Record<string, number> = {
        relearning: 0,
        learning: 1,
        review: 2,
        new: 3,
      };

      const aPriority = statePriority[a.state] ?? 4;
      const bPriority = statePriority[b.state] ?? 4;

      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }

      // Finally by due date
      return aDue.getTime() - bDue.getTime();
    });
  }
}

/**
 * Singleton scheduler instance
 */
let schedulerInstance: Scheduler | null = null;

export function getScheduler(): Scheduler {
  if (!schedulerInstance) {
    schedulerInstance = new Scheduler();
  }
  return schedulerInstance;
}
