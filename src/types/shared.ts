import React from 'react';

export interface Breadcrumb {
  label: string;
  href?: string;
}

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  fullscreen?: boolean;
  label?: string;
}

export interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  breadcrumbs?: Breadcrumb[];
}

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  scope?: string;
}

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmationPhrase?: string; // Optional typed validation phrase
  loading?: boolean;
  variant?: 'default' | 'danger';
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

export interface CopyToClipboardButtonProps {
  text: string;
  label?: string;
}

export interface AnimatedCounterProps {
  value: number;
  duration?: number; // In seconds
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

export interface SkeletonBlockProps {
  variant?: 'card' | 'table' | 'avatar' | 'list' | 'chart' | 'form' | 'page';
  count?: number;
}
