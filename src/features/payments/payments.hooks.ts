import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/queryKeys';
import {
  createOrder,
  getHistory,
  requestRefund,
  getPayment
} from './payments.api';
import type {
  PaymentOut,
  PaymentOrderIn
} from './payments.types';

export function useCreateOrder() {
  return useMutation<Record<string, unknown>, Error, PaymentOrderIn>({
    mutationFn: (payload) => createOrder(payload),
  });
}

export function usePaymentHistory(params?: Record<string, unknown>) {
  return useQuery<PaymentOut[], Error>({
    queryKey: queryKeys.payments.history(params),
    queryFn: () => getHistory(params),
    staleTime: 1000 * 60 * 5,
  });
}

export function useRequestRefund() {
  const queryClient = useQueryClient();

  return useMutation<PaymentOut, Error, string>({
    mutationFn: (paymentId) => requestRefund(paymentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payments.all });
    },
  });
}

export function usePaymentDetail(id: string) {
  return useQuery<PaymentOut, Error>({
    queryKey: queryKeys.payments.detail(id),
    queryFn: () => getPayment(id),
    enabled: Boolean(id),
  });
}
