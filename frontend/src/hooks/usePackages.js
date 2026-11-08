import { useSuspenseQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { queryKeys } from '../lib/queryKeys';

export function usePackages() {
  return useSuspenseQuery({
    queryKey: queryKeys.packages,
    queryFn: () => api('/api/packages'),
    select: (res) => res?.data ?? res,
  });
}
