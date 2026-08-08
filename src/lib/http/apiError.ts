import axios from 'axios';

/**
 * Standardized API Error representation
 */
export class ApiError extends Error {
  public readonly status?: number;
  public readonly code?: string;
  public readonly details?: unknown;

  constructor(message: string, status?: number, code?: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;

    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

/**
 * Normalizes any caught error into an ApiError.
 */
export function normalizeApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const responseData = error.response?.data as any;
    let message = 'An unexpected server or network error occurred.';

    if (typeof responseData?.detail === 'string') {
      message = responseData.detail;
    } else if (Array.isArray(responseData?.detail) && responseData.detail[0]?.msg) {
      message = responseData.detail[0].msg;
    } else if (responseData?.message) {
      message = responseData.message;
    } else if (error.message) {
      message = error.message;
    }

    return new ApiError(
      message,
      status,
      responseData?.code || (status ? `HTTP_${status}` : 'NETWORK_ERROR'),
      responseData
    );
  }

  if (error instanceof Error) {
    return new ApiError(error.message);
  }

  return new ApiError('An unknown error occurred during the request.');
}
