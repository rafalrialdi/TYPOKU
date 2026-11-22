import { clearSession, getToken } from './session';
import { clearPersistedCache } from '../lib/queryClient';

// Diekspor agar halaman bisa menyusun URL unduhan/aset langsung ke backend.
// Backend hanya mengirim path relatif (mis. /api/cek-typo/download/<id>) karena
// alamat publik backend tidak dapat ditebak dari sisi server saat di balik proxy.
export const API_BASE_URL = (
  import.meta.env?.VITE_API_BASE_URL || 'http://localhost:8000'
).replace(/\/$/, '');

// Halaman yang memang mewajibkan login. Dipakai untuk memutuskan apakah 401
// perlu memaksa redirect ke /login.
const PROTECTED_PREFIXES = ['/checkout', '/pembayaran'];

/**
 * Mengarahkan ke /login HANYA jika halaman saat ini memang butuh sesi.
 *
 * Sejak profil direvalidasi lewat /api/auth/me setiap aplikasi dibuka, token
 * kedaluwarsa bisa ketahuan saat pengunjung sedang berada di halaman publik
 * (beranda, /paket, /cek-typo). Tanpa penjagaan ini, pengunjung yang sah-sah
 * saja membuka halaman publik akan terlempar ke /login — padahal halaman itu
 * sengaja dapat diakses tanpa akun. Di halaman publik, sesi cukup dibersihkan
 * dan pengunjung berubah menjadi tamu.
 */
function redirectToLoginIfProtected() {
  if (typeof window === 'undefined') {
    return;
  }

  const { pathname, search } = window.location;

  if (!PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return;
  }

  const redirect = encodeURIComponent(`${pathname}${search}`);
  window.location.href = `/login?redirect=${redirect}`;
}

async function request(path, { method = 'GET', body, auth = false, headers, signal, cache } = {}) {
  const isGet = method === 'GET';
  const token = getToken();
  const finalHeaders = { ...(headers || {}) };

  if (body instanceof FormData) {
    delete finalHeaders['Content-Type'];
  } else if (body !== undefined) {
    finalHeaders['Content-Type'] = 'application/json';
  }

  if (auth && token) {
    finalHeaders.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: finalHeaders,
    signal,
    cache: cache || (isGet ? 'no-cache' : undefined),
    ...(body !== undefined ? { body: body instanceof FormData ? body : JSON.stringify(body) } : {}),
  });

  if (response.status === 204) {
    return null;
  }

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  // 401: token tidak ada, kedaluwarsa, atau tidak valid -> sesi berakhir.
  // Seluruh jejak sesi dibersihkan (termasuk cache React Query) supaya data
  // user lama tidak sempat tampil setelah halaman dimuat ulang.
  if (response.status === 401 && auth) {
    clearSession();
    clearPersistedCache();
    redirectToLoginIfProtected();
    return Promise.reject({ status: 401, redirected: true });
  }

  // 403: token VALID, user hanya belum memiliki paket aktif (checkSubscription).
  // Sesi TIDAK boleh dihapus dan user TIDAK boleh diarahkan ke /login; cukup
  // kembalikan penanda hasAccess=false agar halaman menampilkan ajakan berlangganan.
  if (response.status === 403 && auth) {
    return Promise.reject({
      status: 403,
      hasAccess: false,
      message: data?.message || 'Akses ditolak',
    });
  }

  if (!response.ok) {
    const error = new Error(data?.message || 'Terjadi kesalahan pada server');
    error.status = response.status;
    error.errors = data?.errors;
    throw error;
  }

  return data;
}

// Satu-satunya helper auth yang dipakai di luar request(): Login Google.
// Alur register, login, lupa kata sandi, reset kata sandi, dan profil semuanya
// sudah lewat hook TanStack Query (useAuthMutations) yang memanggil api().
function googleLogin(credential) {
  return request('/api/auth/google', {
    method: 'POST',
    body: { credential },
    auth: false,
  });
}

export { googleLogin, request };
