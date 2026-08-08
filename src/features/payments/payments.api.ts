import { apiClient } from '@/lib/http/apiClient';
import { ENDPOINTS } from '@/lib/http/endpoints';
import { paymentOrderSchema } from './payments.schema';
import type {
  PaymentOut,
  PaymentOrderIn
} from './payments.types';

export async function createOrder(payload: PaymentOrderIn): Promise<Record<string, unknown>> {
  const validated = paymentOrderSchema.parse(payload);
  const response = await apiClient.post<Record<string, unknown>>(ENDPOINTS.PAYMENTS.CREATE_ORDER, validated);
  return response.data;
}

export async function getHistory(params?: Record<string, unknown>): Promise<PaymentOut[]> {
  const response = await apiClient.get<PaymentOut[]>(ENDPOINTS.PAYMENTS.HISTORY, { params });
  return response.data;
}

export async function requestRefund(paymentId: string): Promise<PaymentOut> {
  const response = await apiClient.post<PaymentOut>(ENDPOINTS.PAYMENTS.REFUND(paymentId));
  return response.data;
}

export async function getPayment(id: string): Promise<PaymentOut> {
  const response = await apiClient.get<PaymentOut>(ENDPOINTS.PAYMENTS.DETAIL(id));
  return response.data;
}

export async function downloadInvoice(id: string, invoiceNumber: string = 'invoice', download: boolean = true): Promise<void> {
  const response = await apiClient.get(ENDPOINTS.PAYMENTS.INVOICE(id), {
    params: { download },
    responseType: 'blob',
  });
  
  const blob = new Blob([response.data], { type: 'application/pdf' });
  const url = window.URL.createObjectURL(blob);
  
  if (!download) {
    window.open(url, '_blank');
    return;
  }

  const link = document.createElement('a');
  link.href = url;
  link.download = `VaahanSafe_Invoice_${invoiceNumber}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
