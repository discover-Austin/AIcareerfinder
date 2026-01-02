/**
 * Retry Utility with Exponential Backoff
 *
 * Provides robust retry logic for handling transient failures
 * in API calls and network requests.
 */

export interface RetryOptions {
  /**
   * Maximum number of retry attempts
   * @default 3
   */
  maxRetries?: number;

  /**
   * Initial delay in milliseconds before first retry
   * @default 1000
   */
  initialDelay?: number;

  /**
   * Maximum delay between retries in milliseconds
   * @default 30000 (30 seconds)
   */
  maxDelay?: number;

  /**
   * Backoff multiplier for exponential backoff
   * @default 2 (doubles each time)
   */
  backoffMultiplier?: number;

  /**
   * Optional function to determine if error should trigger retry
   * @param error The error that occurred
   * @returns true if should retry, false otherwise
   */
  shouldRetry?: (error: unknown) => boolean;

  /**
   * Optional callback called before each retry attempt
   * @param attempt Current attempt number (1-based)
   * @param delay Delay before this retry in ms
   */
  onRetry?: (attempt: number, delay: number) => void;
}

/**
 * Default retry options
 */
const DEFAULT_OPTIONS: Required<Omit<RetryOptions, 'shouldRetry' | 'onRetry'>> = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 30000,
  backoffMultiplier: 2,
};

/**
 * Default function to determine if error is retryable
 */
function defaultShouldRetry(error: unknown): boolean {
  // Retry on network errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return true;
  }

  // Retry on timeout errors
  if (error instanceof Error && error.message.includes('timeout')) {
    return true;
  }

  // Retry on 5xx server errors (if error has status code)
  if (typeof error === 'object' && error !== null && 'status' in error) {
    const status = (error as { status: number }).status;
    return status >= 500 && status < 600;
  }

  // Retry on 429 (Too Many Requests)
  if (typeof error === 'object' && error !== null && 'status' in error) {
    return (error as { status: number }).status === 429;
  }

  return false;
}

/**
 * Retry a function with exponential backoff
 *
 * @param fn The async function to retry
 * @param options Retry configuration options
 * @returns Promise that resolves with the function result
 * @throws The last error if all retries are exhausted
 *
 * @example
 * ```typescript
 * const result = await retryWithBackoff(
 *   async () => await apiCall(),
 *   {
 *     maxRetries: 3,
 *     initialDelay: 1000,
 *     onRetry: (attempt, delay) => {
 *       console.log(`Retry attempt ${attempt} after ${delay}ms`);
 *     }
 *   }
 * );
 * ```
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries,
    initialDelay,
    maxDelay,
    backoffMultiplier,
  } = { ...DEFAULT_OPTIONS, ...options };

  const shouldRetry = options.shouldRetry || defaultShouldRetry;
  const onRetry = options.onRetry;

  let lastError: unknown;
  let delay = initialDelay;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Try to execute the function
      return await fn();
    } catch (error) {
      lastError = error;

      // If this was the last attempt, throw the error
      if (attempt === maxRetries) {
        throw error;
      }

      // Check if we should retry this error
      if (!shouldRetry(error)) {
        throw error;
      }

      // Call onRetry callback if provided
      if (onRetry) {
        onRetry(attempt + 1, delay);
      }

      // Wait before retrying
      await sleep(delay);

      // Calculate next delay with exponential backoff
      delay = Math.min(delay * backoffMultiplier, maxDelay);
    }
  }

  // This should never be reached, but TypeScript doesn't know that
  throw lastError;
}

/**
 * Sleep for a specified number of milliseconds
 *
 * @param ms Milliseconds to sleep
 * @returns Promise that resolves after the delay
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry a function with jittered exponential backoff
 * Adds randomization to prevent thundering herd problem
 *
 * @param fn The async function to retry
 * @param options Retry configuration options
 * @returns Promise that resolves with the function result
 *
 * @example
 * ```typescript
 * const result = await retryWithJitter(
 *   async () => await apiCall(),
 *   { maxRetries: 5 }
 * );
 * ```
 */
export async function retryWithJitter<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries,
    initialDelay,
    maxDelay,
    backoffMultiplier,
  } = { ...DEFAULT_OPTIONS, ...options };

  const shouldRetry = options.shouldRetry || defaultShouldRetry;
  const onRetry = options.onRetry;

  let lastError: unknown;
  let baseDelay = initialDelay;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt === maxRetries) {
        throw error;
      }

      if (!shouldRetry(error)) {
        throw error;
      }

      // Add jitter: randomize delay between 0 and baseDelay
      const jitteredDelay = Math.min(
        Math.random() * baseDelay,
        maxDelay
      );

      if (onRetry) {
        onRetry(attempt + 1, jitteredDelay);
      }

      await sleep(jitteredDelay);

      // Calculate next base delay
      baseDelay = Math.min(baseDelay * backoffMultiplier, maxDelay);
    }
  }

  throw lastError;
}

/**
 * Wrap an async function to automatically retry on failure
 *
 * @param fn The async function to wrap
 * @param options Retry configuration options
 * @returns A new function that retries on failure
 *
 * @example
 * ```typescript
 * const reliableApiCall = withRetry(
 *   async (id: string) => await api.getData(id),
 *   { maxRetries: 3 }
 * );
 *
 * const data = await reliableApiCall('123');
 * ```
 */
export function withRetry<TArgs extends unknown[], TReturn>(
  fn: (...args: TArgs) => Promise<TReturn>,
  options: RetryOptions = {}
): (...args: TArgs) => Promise<TReturn> {
  return async (...args: TArgs) => {
    return retryWithBackoff(() => fn(...args), options);
  };
}
