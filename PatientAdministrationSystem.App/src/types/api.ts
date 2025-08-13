// Specific types for API errors and HTTP responses

export interface ApiErrorResponse {
  error?: string;
  message?: string;
  details?: string;
}

export interface HttpError extends Error {
  response?: {
    data?: ApiErrorResponse;
    status?: number;
    statusText?: string;
  };
}

// Helper function to check if an error is an HttpError
export function isHttpError(error: unknown): error is HttpError {
  return error instanceof Error && 'response' in error && typeof error.response === 'object' && error.response !== null;
}
