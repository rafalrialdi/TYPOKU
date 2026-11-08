import { QueryClient, MutationCache } from '@tanstack/react-query';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';

export const FIVE_MINUTES = 1000 * 60 * 5;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
      gcTime: FIVE_MINUTES,
    },
  },
  mutationCache: new MutationCache({
    onSuccess: (_data, _variables, _context, mutation) => {
      const keys = mutation.meta?.invalidates;
      if (keys?.length) {
        return Promise.all(
          keys.map((queryKey) => queryClient.invalidateQueries({ queryKey }))
        );
      }
      return queryClient.invalidateQueries();
    },
  }),
});

export const persister = createSyncStoragePersister({
  storage: typeof window !== 'undefined' ? window.localStorage : undefined,
});

export function clearPersistedCache() {
  queryClient.clear();
  try {
    persister.removeClient();
  } catch {
    // Abaikan jika storage tidak tersedia
  }
}
