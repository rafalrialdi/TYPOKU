import { useSuspenseQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { queryKeys } from '../lib/queryKeys';

export function useMyAccess() {
  return useSuspenseQuery({
    queryKey: queryKeys.myAccess,
    queryFn: () => api('/api/subscriptions/my-access', { auth: true }),
    select: (res) => res?.data ?? res,
  });
}
