import React from 'react';
import { Toaster as SonnerToaster } from '@/components/ui/sonner';
import { toast } from 'sonner';

export const toastSuccess = (message: string, description?: string) => {
  toast.success(message, { description });
};

export const toastError = (message: string, description?: string) => {
  toast.error(message, { description });
};

export const toastWarning = (message: string, description?: string) => {
  toast.warning(message, { description });
};

export const toastInfo = (message: string, description?: string) => {
  toast.info(message, { description });
};

interface ToastProviderProps {
  children: React.ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  return (
    <>
      {children}
      <SonnerToaster 
        position="top-right"
        visibleToasts={3}
        className="font-sans text-xs"
      />
    </>
  );
};

export default ToastProvider;
