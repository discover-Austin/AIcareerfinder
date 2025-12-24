/**
 * UI Configuration Constants
 *
 * Centralized configuration for UI behavior, timings, and display settings.
 */

/**
 * Loading and animation timings
 */
export const UI_TIMINGS = {
  /** Interval for rotating loading messages (ms) */
  LOADING_MESSAGES_INTERVAL: 2000,

  /** Default toast/notification duration (ms) */
  NOTIFICATION_DURATION: 5000,

  /** Mock API call delay for development (ms) */
  MOCK_API_DELAY: 1000,
} as const;

/**
 * Comparison and selection limits
 */
export const UI_LIMITS = {
  /** Maximum number of careers that can be compared simultaneously */
  MAX_CAREERS_TO_COMPARE: 3,
} as const;
