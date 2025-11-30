/**
 * Timeout Constants
 * 
 * Centralized timeout and interval values
 * to avoid magic numbers throughout the codebase.
 */

/**
 * API request timeouts (milliseconds)
 */
export const API_TIMEOUTS = {
  SHORT: 5000,        // 5 seconds - for quick lookups
  MEDIUM: 15000,      // 15 seconds - for normal requests
  LONG: 30000,        // 30 seconds - for complex operations
  VERY_LONG: 60000,   // 60 seconds - for AI/ML operations
} as const;

/**
 * Cache durations (milliseconds)
 */
export const CACHE_DURATIONS = {
  IMMEDIATE: 0,           // No cache
  SHORT: 10 * 1000,       // 10 seconds
  MEDIUM: 30 * 1000,      // 30 seconds
  LONG: 5 * 60 * 1000,    // 5 minutes
  VERY_LONG: 30 * 60 * 1000, // 30 minutes
  DAY: 24 * 60 * 60 * 1000,  // 24 hours
} as const;

/**
 * Sync intervals (milliseconds)
 */
export const SYNC_INTERVALS = {
  REAL_TIME: 5 * 1000,    // 5 seconds
  FREQUENT: 30 * 1000,    // 30 seconds
  NORMAL: 60 * 1000,      // 1 minute
  LAZY: 5 * 60 * 1000,    // 5 minutes
  HOURLY: 60 * 60 * 1000, // 1 hour
} as const;

/**
 * Debounce delays (milliseconds)
 */
export const DEBOUNCE_DELAYS = {
  INSTANT: 0,           // No debounce
  FAST: 150,           // 150ms - for autocomplete
  NORMAL: 300,         // 300ms - for search
  SLOW: 500,           // 500ms - for expensive operations
  VERY_SLOW: 1000,     // 1s - for analytics
} as const;

/**
 * Time tracking intervals (milliseconds)
 */
export const TRACKING_INTERVALS = {
  INCREMENT: 1000,         // 1 second - time increment
  PERIODIC_SAVE: 30 * 1000, // 30 seconds - periodic save
  FORCE_SYNC: 5 * 60 * 1000, // 5 minutes - force sync
} as const;

/**
 * Animation durations (milliseconds)
 */
export const ANIMATION_DURATIONS = {
  INSTANT: 0,
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  VERY_SLOW: 1000,
} as const;

/**
 * Toast/notification durations (milliseconds)
 */
export const NOTIFICATION_DURATIONS = {
  SHORT: 2000,      // 2 seconds
  NORMAL: 4000,     // 4 seconds
  LONG: 6000,       // 6 seconds
  VERY_LONG: 10000, // 10 seconds
  PERSISTENT: 0,    // Never auto-dismiss
} as const;

/**
 * Session/idle timeouts (milliseconds)
 */
export const SESSION_TIMEOUTS = {
  WARNING: 25 * 60 * 1000,  // 25 minutes - warn user
  LOGOUT: 30 * 60 * 1000,   // 30 minutes - auto logout
  REFRESH: 55 * 60 * 1000,  // 55 minutes - refresh token
} as const;

/**
 * Retry configuration
 */
export const RETRY_CONFIG = {
  MAX_ATTEMPTS: 3,
  INITIAL_DELAY: 1000,    // 1 second
  MAX_DELAY: 10000,       // 10 seconds
  BACKOFF_MULTIPLIER: 2,
} as const;

/**
 * Practice/exam durations (seconds)
 */
export const EXAM_DURATIONS = {
  SHORT_QUESTION: 5 * 60,      // 5 minutes
  MEDIUM_QUESTION: 7.5 * 60,   // 7.5 minutes
  LONG_QUESTION: 10 * 60,      // 10 minutes
  MOCK_EXAM_P1: 60 * 60,       // 1 hour
  MOCK_EXAM_P2: 90 * 60,       // 1.5 hours
} as const;

/**
 * Auto-save intervals (milliseconds)
 */
export const AUTO_SAVE_INTERVALS = {
  FREQUENT: 10 * 1000,   // 10 seconds
  NORMAL: 30 * 1000,     // 30 seconds
  LAZY: 60 * 1000,       // 1 minute
} as const;

/**
 * Polling intervals (milliseconds)
 */
export const POLLING_INTERVALS = {
  REAL_TIME: 3 * 1000,    // 3 seconds
  FREQUENT: 10 * 1000,    // 10 seconds
  NORMAL: 30 * 1000,      // 30 seconds
  LAZY: 60 * 1000,        // 1 minute
} as const;

/**
 * Convert seconds to milliseconds
 */
export function secondsToMs(seconds: number): number {
  return seconds * 1000;
}

/**
 * Convert milliseconds to seconds
 */
export function msToSeconds(ms: number): number {
  return Math.floor(ms / 1000);
}

/**
 * Convert minutes to milliseconds
 */
export function minutesToMs(minutes: number): number {
  return minutes * 60 * 1000;
}

/**
 * Convert milliseconds to minutes
 */
export function msToMinutes(ms: number): number {
  return Math.floor(ms / (60 * 1000));
}

/**
 * Format milliseconds to human-readable string
 */
export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
}

