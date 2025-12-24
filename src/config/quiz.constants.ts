/**
 * Quiz Configuration Constants
 *
 * Centralized configuration for quiz scoring, animations, and behavior.
 * These constants ensure consistent behavior across the application.
 */

/**
 * Scoring values for personality trait assessment
 */
export const QUIZ_SCORING = {
  /** Strong effect on personality trait (-20 to +20) */
  STRONG_EFFECT: 20,

  /** Moderate effect on personality trait (-15 to +15) */
  MODERATE_EFFECT: 15,

  /** Mild effect on personality trait (-5 to +5) */
  MILD_EFFECT: 5,

  /** Maximum effect for slider-type questions */
  SLIDER_MAX_EFFECT: 20,

  /** Range for score normalization (-100 to +100) */
  NORMALIZATION_RANGE: 100,

  /** Slider neutral position (0-100 scale) */
  SLIDER_NEUTRAL: 50,
} as const;

/**
 * Animation timings for quiz interactions
 */
export const QUIZ_ANIMATIONS = {
  /** Duration for question transition animation (ms) */
  TRANSITION_DURATION: 300,

  /** Duration to show pillar completion message (ms) */
  COMPLETION_MESSAGE_DURATION: 3500,
} as const;

/**
 * Quiz state management
 */
export const QUIZ_STATE = {
  /** LocalStorage key for quiz progress */
  STORAGE_KEY: 'personalityQuizState_v2',
} as const;
