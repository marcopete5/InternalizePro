/**
 * FSRS-4.5 Parameters
 *
 * These parameters control the behavior of the spaced repetition algorithm.
 * The default values are optimized for general use, but can be personalized
 * based on individual learning patterns.
 *
 * Reference: https://github.com/open-spaced-repetition/fsrs4anki
 */

export interface FSRSParameters {
  // Request retention (target probability of recall)
  requestRetention: number;

  // Maximum interval in days
  maximumInterval: number;

  // Weights (w0-w18)
  w: readonly [
    number, number, number, number, number,
    number, number, number, number, number,
    number, number, number, number, number,
    number, number, number, number
  ];
}

/**
 * Default FSRS-4.5 parameters
 * These are the optimized defaults from the FSRS research
 */
export const DEFAULT_PARAMETERS: FSRSParameters = {
  requestRetention: 0.9,
  maximumInterval: 36500, // 100 years

  // Default weights optimized from large-scale data
  w: [
    0.4072, // w0: Initial stability for Again
    1.1829, // w1: Initial stability for Hard
    3.1262, // w2: Initial stability for Good
    15.4722, // w3: Initial stability for Easy
    7.2102, // w4: Stability increase factor
    0.5316, // w5: Stability decay factor
    1.0651, // w6: Stability increase modifier
    0.0046, // w7: Relearning stability modifier
    1.5418, // w8: First rating modifier
    0.1618, // w9: Hard modifier
    1.0, // w10: Good modifier (reference)
    2.1232, // w11: Easy modifier
    0.0062, // w12: Hard penalty
    0.3378, // w13: Easy bonus
    0.4175, // w14: Lapse stability modifier
    0.0, // w15: Reserved
    2.0, // w16: Reserved
    0.4, // w17: Reserved
    0.9, // w18: Reserved
  ] as const,
};

/**
 * FSRS Rating enum matching the algorithm's expected values
 */
export enum Rating {
  Again = 1,
  Hard = 2,
  Good = 3,
  Easy = 4,
}

/**
 * Card state enum
 */
export enum State {
  New = 0,
  Learning = 1,
  Review = 2,
  Relearning = 3,
}

/**
 * Convert state string to enum
 */
export function stateFromString(state: string): State {
  switch (state.toLowerCase()) {
    case 'new':
      return State.New;
    case 'learning':
      return State.Learning;
    case 'review':
      return State.Review;
    case 'relearning':
      return State.Relearning;
    default:
      return State.New;
  }
}

/**
 * Convert state enum to string
 */
export function stateToString(state: State): 'new' | 'learning' | 'review' | 'relearning' {
  switch (state) {
    case State.New:
      return 'new';
    case State.Learning:
      return 'learning';
    case State.Review:
      return 'review';
    case State.Relearning:
      return 'relearning';
  }
}

/**
 * Rating to numeric value
 */
export function ratingValue(rating: Rating): 1 | 2 | 3 | 4 {
  return rating as 1 | 2 | 3 | 4;
}
