import { Injectable, signal } from '@angular/core';

/**
 * Centralized Error Handling Service
 *
 * Provides consistent error handling, user-friendly messages,
 * and error state management across the application.
 */

export interface ErrorDetails {
  message: string;
  type: 'api' | 'network' | 'validation' | 'auth' | 'payment' | 'general';
  code?: string;
  retryable?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ErrorHandlerService {
  /**
   * Current error state - null when no error
   */
  errorDetails = signal<ErrorDetails | null>(null);

  /**
   * Whether an error is currently displayed
   */
  hasError = signal<boolean>(false);

  /**
   * Handle API errors with user-friendly messages
   */
  handleApiError(error: unknown, context?: string): ErrorDetails {
    console.error(`API Error${context ? ` in ${context}` : ''}:`, error);

    let errorDetails: ErrorDetails;

    if (error instanceof Error) {
      // Check for specific error types
      if (error.message.includes('API_KEY') || error.message.includes('apiKey')) {
        errorDetails = {
          message: 'Service configuration error. Please contact support.',
          type: 'api',
          code: 'API_KEY_ERROR',
          retryable: false,
        };
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        errorDetails = {
          message: 'Network error. Please check your connection and try again.',
          type: 'network',
          code: 'NETWORK_ERROR',
          retryable: true,
        };
      } else if (error.message.includes('timeout')) {
        errorDetails = {
          message: 'Request timed out. Please try again.',
          type: 'network',
          code: 'TIMEOUT_ERROR',
          retryable: true,
        };
      } else if (error.message.includes('rate limit') || error.message.includes('429')) {
        errorDetails = {
          message: 'Too many requests. Please wait a moment and try again.',
          type: 'api',
          code: 'RATE_LIMIT_ERROR',
          retryable: true,
        };
      } else {
        errorDetails = {
          message: error.message || 'An unexpected error occurred. Please try again.',
          type: 'api',
          retryable: true,
        };
      }
    } else if (typeof error === 'string') {
      errorDetails = {
        message: error,
        type: 'general',
        retryable: false,
      };
    } else {
      errorDetails = {
        message: 'An unexpected error occurred. Please try again.',
        type: 'general',
        retryable: false,
      };
    }

    this.setError(errorDetails);
    return errorDetails;
  }

  /**
   * Handle network errors specifically
   */
  handleNetworkError(error: unknown, context?: string): ErrorDetails {
    console.error(`Network Error${context ? ` in ${context}` : ''}:`, error);

    const errorDetails: ErrorDetails = {
      message: 'Unable to connect to the server. Please check your internet connection.',
      type: 'network',
      code: 'NETWORK_ERROR',
      retryable: true,
    };

    this.setError(errorDetails);
    return errorDetails;
  }

  /**
   * Handle validation errors
   */
  handleValidationError(message: string, field?: string): ErrorDetails {
    const errorDetails: ErrorDetails = {
      message: field ? `${field}: ${message}` : message,
      type: 'validation',
      code: 'VALIDATION_ERROR',
      retryable: false,
    };

    this.setError(errorDetails);
    return errorDetails;
  }

  /**
   * Handle authentication errors
   */
  handleAuthError(message: string = 'Authentication failed. Please log in again.'): ErrorDetails {
    const errorDetails: ErrorDetails = {
      message,
      type: 'auth',
      code: 'AUTH_ERROR',
      retryable: false,
    };

    this.setError(errorDetails);
    return errorDetails;
  }

  /**
   * Handle payment errors
   */
  handlePaymentError(error: unknown): ErrorDetails {
    console.error('Payment Error:', error);

    let message = 'Payment failed. Please try again or use a different payment method.';

    if (error instanceof Error) {
      if (error.message.includes('card_declined')) {
        message = 'Your card was declined. Please try a different payment method.';
      } else if (error.message.includes('insufficient_funds')) {
        message = 'Insufficient funds. Please use a different payment method.';
      } else if (error.message.includes('expired_card')) {
        message = 'Your card has expired. Please use a different payment method.';
      }
    }

    const errorDetails: ErrorDetails = {
      message,
      type: 'payment',
      code: 'PAYMENT_ERROR',
      retryable: true,
    };

    this.setError(errorDetails);
    return errorDetails;
  }

  /**
   * Set error state
   */
  private setError(details: ErrorDetails): void {
    this.errorDetails.set(details);
    this.hasError.set(true);
  }

  /**
   * Clear current error
   */
  clearError(): void {
    this.errorDetails.set(null);
    this.hasError.set(false);
  }

  /**
   * Get user-friendly error message
   */
  getUserMessage(error: unknown, fallback: string = 'Something went wrong'): string {
    if (error instanceof Error) {
      return error.message || fallback;
    }
    if (typeof error === 'string') {
      return error;
    }
    return fallback;
  }

  /**
   * Check if error is retryable
   */
  isRetryable(error: ErrorDetails | null): boolean {
    return error?.retryable ?? false;
  }

  /**
   * Log error for debugging (can be extended to send to error tracking service)
   */
  logError(error: unknown, context?: string, additionalData?: Record<string, unknown>): void {
    const timestamp = new Date().toISOString();
    const errorLog = {
      timestamp,
      context,
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : error,
      additionalData,
    };

    console.error('[ErrorHandler]', errorLog);

    // TODO: In production, send to error tracking service (Sentry, LogRocket, etc.)
    // Example: Sentry.captureException(error, { contexts: { custom: errorLog } });
  }
}
