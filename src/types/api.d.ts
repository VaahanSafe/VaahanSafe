/**
 * RFC 7807 Compliant API Envelope & Error Declarations
 */

export interface ProblemDetail {
  type?: string;
  title?: string;
  status: number;
  detail: string;
  instance?: string;
  invalid_params?: Array<{
    name: string;
    reason: string;
  }>;
  [key: string]: unknown;
}

export interface ApiErrorResponse {
  message: string;
  status: number;
  code?: string;
  errors?: Record<string, string[]>;
  timestamp?: string;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNext?: boolean;
  hasPrev?: boolean;
}

export interface Page<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  meta?: PaginationMeta;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
  success: boolean;
}
