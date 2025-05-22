import { z } from 'zod';

/**
 * Standard API error response format
 */
export interface ApiErrorResponse {
  error: string;
  status: number;
  details?: unknown;
}

/**
 * Function to handle API errors and return standardized error responses
 * @param error - Error object to handle
 * @returns Standardized API error response
 */
export function handleApiError(error: unknown): ApiErrorResponse {
  // Default error response
  const defaultError: ApiErrorResponse = {
    error: 'Internal Server Error',
    status: 500
  };

  // Handle different error types
  if (error instanceof Error) {
    // Generic Error instance
    if (error.message.includes('Validation error')) {
      return {
        error: 'Validation Error',
        status: 400,
        details: error.message
      };
    }
    
    return {
      error: error.message || 'Unknown Error',
      status: 400
    };
  }
  
  if (error instanceof z.ZodError) {
    // Zod validation errors
    return {
      error: 'Validation Error',
      status: 400,
      details: error.errors
    };
  }

  // Unknown error type, return default error
  console.error('Unhandled error type:', error);
  return defaultError;
} 