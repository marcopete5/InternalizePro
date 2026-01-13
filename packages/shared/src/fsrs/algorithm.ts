/**
 * FSRS-4.5 Algorithm Implementation
 *
 * Free Spaced Repetition Scheduler - a modern, research-backed algorithm
 * for optimizing review intervals based on memory models.
 *
 * Key concepts:
 * - Stability (S): How long a memory will last (in days)
 * - Difficulty (D): How hard the card is for this user (1-10)
 * - Retrievability (R): Probability of recall at any given time
 *
 * Reference: https://github.com/open-spaced-repetition/fsrs4anki
 */

import {
  FSRSParameters,
  DEFAULT_PARAMETERS,
  Rating,
  State,
  stateToString,
} from './parameters';

/**
 * Represents the scheduling state of a card
 */
export interface CardSchedulingState {
  stability: number;
  difficulty: number;
  elapsedDays: number;
  scheduledDays: number;
  reps: number;
  lapses: number;
  state: State;
  lastReview: Date | null;
  due: Date;
}

/**
 * Result of scheduling a review
 */
export interface SchedulingResult {
  card: CardSchedulingState;
  reviewLog: {
    rating: Rating;
    scheduledDays: number;
    elapsedDays: number;
    state: State;
    stability: number;
    difficulty: number;
    reviewedAt: Date;
  };
}

/**
 * Preview of all possible ratings
 */
export interface SchedulingPreview {
  again: SchedulingResult;
  hard: SchedulingResult;
  good: SchedulingResult;
  easy: SchedulingResult;
}

/**
 * FSRS Algorithm class
 */
export class FSRS {
  private params: FSRSParameters;

  constructor(params: Partial<FSRSParameters> = {}) {
    this.params = { ...DEFAULT_PARAMETERS, ...params };
  }

  /**
   * Calculate the retrievability (probability of recall) for a card
   */
  calculateRetrievability(stability: number, elapsedDays: number): number {
    if (stability <= 0) return 0;
    return Math.pow(1 + elapsedDays / (9 * stability), -1);
  }

  /**
   * Calculate initial difficulty based on first rating
   */
  private initDifficulty(rating: Rating): number {
    const w = this.params.w;
    return Math.min(
      Math.max(
        w[4] - Math.exp(w[5] * (rating - 1)) + 1,
        1
      ),
      10
    );
  }

  /**
   * Calculate initial stability based on rating
   */
  private initStability(rating: Rating): number {
    return Math.max(this.params.w[rating - 1] ?? 0.1, 0.1);
  }

  /**
   * Calculate next difficulty after a review
   */
  private nextDifficulty(d: number, rating: Rating): number {
    const w = this.params.w;
    const nextD = d - w[6] * (rating - 3);
    return Math.min(Math.max(this.meanReversion(nextD), 1), 10);
  }

  /**
   * Mean reversion for difficulty
   */
  private meanReversion(d: number): number {
    const w = this.params.w;
    const initialD = w[4];
    return w[7] * initialD + (1 - w[7]) * d;
  }

  /**
   * Calculate next stability after a successful review (rating >= 2)
   */
  private nextRecallStability(
    d: number,
    s: number,
    r: number,
    rating: Rating
  ): number {
    const w = this.params.w;

    const hardPenalty = rating === Rating.Hard ? w[15] : 1;
    const easyBonus = rating === Rating.Easy ? w[16] : 1;

    return (
      s *
      (1 +
        Math.exp(w[8]) *
          (11 - d) *
          Math.pow(s, -w[9]) *
          (Math.exp((1 - r) * w[10]) - 1) *
          hardPenalty *
          easyBonus)
    );
  }

  /**
   * Calculate next stability after a lapse (rating = 1)
   */
  private nextForgetStability(d: number, s: number, r: number): number {
    const w = this.params.w;
    return (
      w[11] *
      Math.pow(d, -w[12]) *
      (Math.pow(s + 1, w[13]) - 1) *
      Math.exp((1 - r) * w[14])
    );
  }

  /**
   * Calculate the interval for a given stability and retention target
   */
  private nextInterval(stability: number): number {
    const interval = Math.round(
      (stability / 9) *
        (Math.pow(this.params.requestRetention, -1) - 1)
    );
    return Math.min(Math.max(interval, 1), this.params.maximumInterval);
  }

  /**
   * Create a new card state (for cards being reviewed for the first time)
   */
  createNewCard(): CardSchedulingState {
    return {
      stability: 0,
      difficulty: 0,
      elapsedDays: 0,
      scheduledDays: 0,
      reps: 0,
      lapses: 0,
      state: State.New,
      lastReview: null,
      due: new Date(),
    };
  }

  /**
   * Schedule a card based on the rating
   */
  schedule(
    card: CardSchedulingState,
    rating: Rating,
    now: Date = new Date()
  ): SchedulingResult {
    const { state, stability, difficulty, lastReview, reps, lapses } = card;

    // Calculate elapsed days since last review
    let elapsedDays = 0;
    if (lastReview) {
      elapsedDays = Math.max(
        0,
        Math.floor(
          (now.getTime() - lastReview.getTime()) / (1000 * 60 * 60 * 24)
        )
      );
    }

    // Calculate new state based on rating and current state
    let newState: State;
    let newStability: number;
    let newDifficulty: number;
    let newLapses = lapses;

    if (state === State.New) {
      // First review
      newDifficulty = this.initDifficulty(rating);
      newStability = this.initStability(rating);

      if (rating === Rating.Again) {
        newState = State.Learning;
        newLapses = 1;
      } else if (rating === Rating.Hard) {
        newState = State.Learning;
      } else {
        newState = State.Review;
      }
    } else if (state === State.Learning || state === State.Relearning) {
      // In learning phase
      if (rating === Rating.Again) {
        newDifficulty = this.nextDifficulty(difficulty, rating);
        newStability = this.initStability(Rating.Again);
        newState = state === State.Learning ? State.Learning : State.Relearning;
        if (state === State.Relearning) {
          newLapses = lapses + 1;
        }
      } else if (rating === Rating.Hard) {
        newDifficulty = this.nextDifficulty(difficulty, rating);
        newStability = this.initStability(Rating.Hard);
        newState = state;
      } else {
        newDifficulty = this.nextDifficulty(difficulty, rating);
        newStability =
          rating === Rating.Good
            ? this.initStability(Rating.Good)
            : this.initStability(Rating.Easy);
        newState = State.Review;
      }
    } else {
      // Review state
      const retrievability = this.calculateRetrievability(stability, elapsedDays);

      if (rating === Rating.Again) {
        newDifficulty = this.nextDifficulty(difficulty, rating);
        newStability = this.nextForgetStability(
          difficulty,
          stability,
          retrievability
        );
        newState = State.Relearning;
        newLapses = lapses + 1;
      } else {
        newDifficulty = this.nextDifficulty(difficulty, rating);
        newStability = this.nextRecallStability(
          difficulty,
          stability,
          retrievability,
          rating
        );
        newState = State.Review;
      }
    }

    // Calculate next interval
    let scheduledDays: number;
    if (newState === State.Learning || newState === State.Relearning) {
      // Short intervals for learning cards
      if (rating === Rating.Again) {
        scheduledDays = 0; // Same day (minutes in practice)
      } else if (rating === Rating.Hard) {
        scheduledDays = 0; // Same day
      } else if (rating === Rating.Good) {
        scheduledDays = 1;
      } else {
        scheduledDays = Math.max(1, Math.round(newStability));
      }
    } else {
      scheduledDays = this.nextInterval(newStability);
    }

    // Calculate due date
    const due = new Date(now);
    due.setDate(due.getDate() + scheduledDays);

    const newCard: CardSchedulingState = {
      stability: newStability,
      difficulty: newDifficulty,
      elapsedDays,
      scheduledDays,
      reps: reps + 1,
      lapses: newLapses,
      state: newState,
      lastReview: now,
      due,
    };

    return {
      card: newCard,
      reviewLog: {
        rating,
        scheduledDays,
        elapsedDays,
        state: state,
        stability: newStability,
        difficulty: newDifficulty,
        reviewedAt: now,
      },
    };
  }

  /**
   * Get a preview of scheduling for all possible ratings
   */
  preview(
    card: CardSchedulingState,
    now: Date = new Date()
  ): SchedulingPreview {
    return {
      again: this.schedule(card, Rating.Again, now),
      hard: this.schedule(card, Rating.Hard, now),
      good: this.schedule(card, Rating.Good, now),
      easy: this.schedule(card, Rating.Easy, now),
    };
  }

  /**
   * Get the parameters
   */
  getParameters(): FSRSParameters {
    return { ...this.params };
  }

  /**
   * Update parameters
   */
  setParameters(params: Partial<FSRSParameters>): void {
    this.params = { ...this.params, ...params };
  }
}

/**
 * Helper to format interval for display
 */
export function formatInterval(days: number): string {
  if (days === 0) return 'Now';
  if (days === 1) return '1 day';
  if (days < 7) return `${days} days`;
  if (days < 30) {
    const weeks = Math.round(days / 7);
    return weeks === 1 ? '1 week' : `${weeks} weeks`;
  }
  if (days < 365) {
    const months = Math.round(days / 30);
    return months === 1 ? '1 month' : `${months} months`;
  }
  const years = Math.round(days / 365);
  return years === 1 ? '1 year' : `${years} years`;
}

/**
 * Get rating label
 */
export function getRatingLabel(rating: Rating): string {
  switch (rating) {
    case Rating.Again:
      return 'Again';
    case Rating.Hard:
      return 'Hard';
    case Rating.Good:
      return 'Good';
    case Rating.Easy:
      return 'Easy';
  }
}

/**
 * Get state label
 */
export function getStateLabel(state: State): string {
  return stateToString(state);
}
