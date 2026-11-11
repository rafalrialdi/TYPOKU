import { QueryClient, MutationCache } from '@tanstack/react-query';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { queryKeys } from './queryKeys';

export const FIVE_MINUTES = 1000 * 60 * 5;
export const THIRTY_MINUTES = 1000 * 60 * 30;

/**
 * Pengaturan cache global yang berlaku untuk SEMUA query.
 *
 * staleTime: data dianggap basi setelah 5 menit. Setelah itu, pemicu seperti
 *            refetchOnMount / refetchOnWindowFocus / refetchOnReconnect akan
 *            benar-benar memanggil ulang API. Sebelum 5 menit, data diambil
 *            dari cache agar perpindahan halaman tidak memicu request berulang.
 *
 * gcTime:    cache dihapus dari memori 30 menit setelah query tidak dipakai
 *            komponen mana pun. gcTime selalu LEBIH BESAR dari staleTime agar
 *            tidak ada jendela waktu di mana data dianggap masih segar tetapi
 *            cache-nya sudah dibuang (yang menyebabkan fetch sia-sia).
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: FIVE_MINUTES,
      gcTime: THIRTY_MINUTES,
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

      // Mutation tanpa meta.invalidates tidak lagi menandai SELURUH cache basi.
      // Query yang bergantung pada identitas user saja yang diinvalidasi, agar
      // 'packages' dan 'payment-config' tidak ikut di-fetch ulang tanpa alasan.
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.myAccess }),
        queryClient.invalidateQueries({ queryKey: queryKeys.myOrders }),
      ]);
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
