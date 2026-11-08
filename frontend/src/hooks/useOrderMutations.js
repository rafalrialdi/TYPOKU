import { useMutation } from '@tanstack/react-query';
import { api } from '../lib/api';
import { queryKeys } from '../lib/queryKeys';

export function useCreateOrder() {
  return useMutation({
    mutationFn: (payload) =>
      api('/api/orders', {
        method: 'POST',
        body: payload,
        auth: true,
      }),
    meta: {
      invalidates: [queryKeys.myOrders],
    },
  });
}
