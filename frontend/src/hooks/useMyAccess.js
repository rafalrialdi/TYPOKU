import { useSuspenseQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { queryKeys } from '../lib/queryKeys';
import { useAuth } from '../context/AuthContext';

/**
 * Mengambil status langganan pengguna yang sedang login.
 *
 * Tamu (belum login) tidak memanggil API sama sekali: endpoint
 * /api/subscriptions/my-access memerlukan Bearer token dan akan membalas 401,
 * sedangkan apiClient menganggap 401 sebagai sesi berakhir sehingga tamu
 * terlempar ke /login. Dengan enabled: false, query tidak berjalan, data
 * undefined, dan halaman menampilkan kartu "fitur terkunci" seperti biasa.
 */
export function useMyAccess() {
  const { user } = useAuth();
  const isLoggedIn = Boolean(user);

  return useSuspenseQuery({
    queryKey: queryKeys.myAccess,
    queryFn: () => api('/api/subscriptions/my-access', { auth: true }),
    select: (res) => res?.data ?? res,
    enabled: isLoggedIn,
  });
}
