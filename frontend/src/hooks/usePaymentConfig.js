import { useSuspenseQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { queryKeys } from '../lib/queryKeys';

export function usePaymentConfig() {
  return useSuspenseQuery({
    queryKey: queryKeys.paymentConfig,
    queryFn: () => api('/api/payments/config'),
    select: (res) => res?.data ?? res,
  });
}
