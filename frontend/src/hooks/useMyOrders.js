import { useSuspenseQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { queryKeys } from '../lib/queryKeys';

export function useMyOrders() {
  return useSuspenseQuery({
    queryKey: queryKeys.myOrders,
    queryFn: () => api('/api/orders/my', { auth: true }),
    select: (res) => (Array.isArray(res?.data) ? res.data : []),
  });
}
