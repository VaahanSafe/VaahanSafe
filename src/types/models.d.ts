/**
 * Cross-Feature Shared Primitive Models
 */

export interface Coordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface Money {
  amount: number;
  currency: 'INR' | 'USD' | 'EUR';
  formatted?: string;
}

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

export interface AuditInfo {
  createdBy?: string;
  createdAt: string;
  updatedBy?: string;
  updatedAt: string;
}

export interface Timestamped {
  createdAt: string;
  updatedAt: string;
}

export type Selectable<T> = T & {
  selected?: boolean;
};
