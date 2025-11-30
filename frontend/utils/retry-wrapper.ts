/**
 * Retry Wrapper Utility
 * 
 * Provides retry logic for database operations and API calls
 * to handle transient failures gracefully.
 */

export interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  retryableErrors?: string[];
  onRetry?: (error: Error, attempt: number) => void;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffMultiplier: 2,
  retryableErrors: [
    'ECONNREFUSED',
    'ETIMEDOUT',
    'ENOTFOUND',
    'Network request failed',
    'fetch failed',
    'Failed to fetch',
  ],
  onRetry: () => {},
};

/**
 * Determines if an error is retryable
 */
function isRetryableError(error: Error, retryableErrors: string[]): boolean {
  const errorMessage = error.message.toLowerCase();
  return retryableErrors.some(retryable => 
    errorMessage.includes(retryable.toLowerCase())
  );
}

/**
 * Calculates the delay for the next retry using exponential backoff
 */
function calculateDelay(
  attempt: number,
  initialDelay: number,
  maxDelay: number,
  backoffMultiplier: number
): number {
  const delay = initialDelay * Math.pow(backoffMultiplier, attempt);
  return Math.min(delay, maxDelay);
}

/**
 * Sleeps for a specified duration
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Wraps an async function with retry logic
 * 
 * @example
 * ```typescript
 * const data = await withRetry(
 *   () => supabase.from('topics').select('*'),
 *   { maxRetries: 3 }
 * );
 * ```
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: Error;

  for (let attempt = 0; attempt < opts.maxRetries; attempt++) {
    try {
      // Attempt the operation
      const result = await fn();
      
      // Log success if this was a retry
      if (attempt > 0) {
        console.log(`✅ Operation succeeded after ${attempt + 1} attempts`);
      }
      
      return result;
    } catch (error) {
      lastError = error as Error;
      
      // Check if we should retry
      const shouldRetry = 
        attempt < opts.maxRetries - 1 && 
        isRetryableError(lastError, opts.retryableErrors);

      if (!shouldRetry) {
        // This is the last attempt or error is not retryable
        if (attempt === opts.maxRetries - 1) {
          console.error(`❌ Operation failed after ${opts.maxRetries} attempts`);
        } else {
          console.error(`❌ Operation failed with non-retryable error: ${lastError.message}`);
        }
        throw lastError;
      }

      // Calculate delay with exponential backoff
      const delay = calculateDelay(
        attempt,
        opts.initialDelay,
        opts.maxDelay,
        opts.backoffMultiplier
      );

      console.warn(
        `⚠️ Attempt ${attempt + 1}/${opts.maxRetries} failed: ${lastError.message}. ` +
        `Retrying in ${delay}ms...`
      );

      // Call the retry callback
      opts.onRetry(lastError, attempt + 1);

      // Wait before retrying
      await sleep(delay);
    }
  }

  // This should never be reached, but TypeScript needs it
  throw lastError!;
}

/**
 * Creates a retry wrapper with preset options
 * 
 * @example
 * ```typescript
 * const retryDB = createRetryWrapper({ maxRetries: 5 });
 * const data = await retryDB(() => supabase.from('topics').select('*'));
 * ```
 */
export function createRetryWrapper(options: RetryOptions = {}) {
  return <T>(fn: () => Promise<T>): Promise<T> => {
    return withRetry(fn, options);
  };
}

/**
 * Retry wrapper specifically for database operations
 * Returns the result directly without wrapping in additional Promise
 */
export async function withDatabaseRetry<T = any>(fn: () => Promise<T> | T): Promise<T> {
  return withRetry(async () => await Promise.resolve(fn()), {
    maxRetries: 3,
    initialDelay: 1000,
    retryableErrors: [
      ...DEFAULT_OPTIONS.retryableErrors,
      'PGRST',
      'connection',
      'timeout',
      'Could not connect',
    ],
    onRetry: (error, attempt) => {
      console.log(`🔄 Database retry attempt ${attempt}: ${error.message}`);
    },
  });
}

/**
 * Retry wrapper specifically for API calls
 */
export const withAPIRetry = createRetryWrapper({
  maxRetries: 2,
  initialDelay: 500,
  retryableErrors: [
    ...DEFAULT_OPTIONS.retryableErrors,
    '500',
    '502',
    '503',
    '504',
    'Internal Server Error',
    'Bad Gateway',
    'Service Unavailable',
  ],
  onRetry: (error, attempt) => {
    console.log(`🔄 API retry attempt ${attempt}: ${error.message}`);
  },
});

/**
 * Circuit breaker pattern for preventing cascading failures
 */
export class CircuitBreaker<T> {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';

  constructor(
    private readonly threshold = 5,
    private readonly timeout = 60000, // 1 minute
    private readonly resetTimeout = 30000 // 30 seconds
  ) {}

  async execute(fn: () => Promise<T>): Promise<T> {
    // Check if circuit is open
    if (this.state === 'OPEN') {
      const timeSinceLastFailure = Date.now() - this.lastFailureTime;
      
      if (timeSinceLastFailure > this.resetTimeout) {
        console.log('🔄 Circuit breaker entering HALF_OPEN state');
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN. Service temporarily unavailable.');
      }
    }

    try {
      const result = await fn();
      
      // Success - reset if we were half-open
      if (this.state === 'HALF_OPEN') {
        console.log('✅ Circuit breaker closing after successful request');
        this.state = 'CLOSED';
        this.failures = 0;
      }
      
      return result;
    } catch (error) {
      this.failures++;
      this.lastFailureTime = Date.now();
      
      if (this.failures >= this.threshold) {
        console.error(`🚨 Circuit breaker OPEN after ${this.failures} failures`);
        this.state = 'OPEN';
      }
      
      throw error;
    }
  }

  reset(): void {
    this.failures = 0;
    this.state = 'CLOSED';
    this.lastFailureTime = 0;
  }

  getState(): string {
    return this.state;
  }
}

