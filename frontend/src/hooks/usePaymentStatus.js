import { useSuspenseQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { queryKeys } from '../lib/queryKeys';

export function usePaymentStatus(orderCode) {
  return useSuspenseQuery({
    queryKey: queryKeys.paymentStatus(orderCode),
    queryFn: () =>
      api(`/api/payments/status/${encodeURIComponent(orderCode)}`, {
        auth: true,
      }),
    select: (res) => res?.data ?? res,
  });
}
