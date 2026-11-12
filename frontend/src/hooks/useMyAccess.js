import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { queryKeys } from '../lib/queryKeys';
import { useAuth } from '../context/AuthContext';

/**
 * Mengambil status langganan pengguna yang sedang login.
 *
 * Memakai useQuery (BUKAN useSuspenseQuery) karena useSuspenseQuery memaksa
 * `enabled: true` secara internal, sehingga opsi `enabled` dari pemanggil
 * diabaikan. Akibatnya tamu tetap memanggil /api/subscriptions/my-access
 * tanpa Bearer token, menerima 401, dan terlempar ke /login padahal halaman
 * fitur sengaja dibuka untuk umum.
 *
 * Dengan useQuery, `enabled` benar-benar dihormati:
 * - Tamu (user null): query tidak pernah berjalan, data undefined,
 *   fetchStatus 'idle', dan TIDAK ada request ke backend.
 * - Login: query berjalan sekali, lalu memakai cache (staleTime 5 menit).
 */
export function useMyAccess() {
  const { user } = useAuth();

  return useQuery({
    queryKey: queryKeys.myAccess,
    queryFn: () => api('/api/subscriptions/my-access', { auth: true }),
    select: (res) => res?.data ?? res,
    enabled: Boolean(user),
  });
}
