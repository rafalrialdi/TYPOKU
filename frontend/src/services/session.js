// Kunci sesi yang ditulis aplikasi.
const AUTH_KEYS = ['token', 'user'];

// Kunci lama yang masih perlu dibersihkan saat logout/401 agar sisa data user
// sebelumnya tidak tertinggal di browser yang pernah memakai versi aplikasi
// terdahulu (yang juga menyimpan nama, telepon, role, dan identifier terpisah).
const LEGACY_AUTH_KEYS = ['id', 'nama', 'email', 'phone', 'role', 'identifier', 'remember'];

const SESSION_KEYS = [...AUTH_KEYS, ...LEGACY_AUTH_KEYS];

function getStores() {
  if (typeof window === 'undefined') {
    return [];
  }
  return [window.localStorage, window.sessionStorage];
}

// Prefix kunci non-auth yang tetap harus dibersihkan saat sesi berakhir.
// 'typoku_pending_order_' dipakai Checkout untuk menyimpan kode order yang belum
// dibayar per paket (typoku_pending_order_<packageId>), sehingga jumlah kuncinya
// bisa lebih dari satu. 'typoku_reset_email' menyimpan email pada alur lupa
// kata sandi. Keduanya milik user sebelumnya, jadi tidak boleh tertinggal ketika
// user lain login pada tab yang sama.
const SESSION_PREFIXES = ['notif_', 'typoku_pending_order_', 'typoku_reset_email'];

function removeKeysByPrefix(store, prefixes) {
  Object.keys(store).forEach((key) => {
    if (prefixes.some((prefix) => key.startsWith(prefix))) {
      store.removeItem(key);
    }
  });
}

function dispatchAuthChanged() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('typoku:auth-changed'));
  }
}

export function saveSession(payload, remember = true) {
  const { token, user } = payload || {};
  if (!token || !user) {
    return;
  }

  clearSession();
  const store = remember ? window.localStorage : window.sessionStorage;

  store.setItem('token', token);
  store.setItem('user', JSON.stringify(user));

  dispatchAuthChanged();
}

/**
 * Menimpa data `user` yang tersimpan tanpa menyentuh token maupun kunci lain.
 * Dipakai saat revalidasi profil ke GET /api/auth/me ketika aplikasi dibuka.
 *
 * JANGAN memakai saveSession() untuk keperluan ini: saveSession() memanggil
 * clearSession(), yang ikut menghapus prefix 'typoku_pending_order_*'. Bila
 * dipakai saat boot, setiap refresh halaman akan membuang kode order yang sedang
 * menunggu pembayaran sehingga tombol "Lanjutkan Pembayaran" di Checkout hilang.
 */
export function updateStoredUser(user) {
  if (typeof window === 'undefined' || !user) {
    return;
  }

  // Tulis ke store yang memang menyimpan sesi aktif (localStorage bila "ingat
  // saya" dicentang, sessionStorage bila tidak).
  const store = window.localStorage.getItem('token')
    ? window.localStorage
    : window.sessionStorage;

  if (!store.getItem('token')) {
    return;
  }

  store.setItem('user', JSON.stringify(user));
  dispatchAuthChanged();
}

/**
 * Membersihkan seluruh jejak sesi user: data autentikasi, notifikasi, order
 * pending di Checkout, dan email pada alur lupa kata sandi. Berlaku untuk
 * localStorage maupun sessionStorage karena preferensi "remember" bisa
 * menempatkan data di salah satunya.
 *
 * Dipanggil saat logout manual dan saat server membalas 401 (token tidak valid
 * atau kedaluwarsa). TIDAK dipanggil saat 403, karena 403 berarti token masih
 * valid namun user belum memiliki paket aktif.
 */
export function clearSession() {
  getStores().forEach((store) => {
    SESSION_KEYS.forEach((key) => store.removeItem(key));
    removeKeysByPrefix(store, SESSION_PREFIXES);
  });

  dispatchAuthChanged();
}

export function getToken() {
  if (typeof window === 'undefined') {
    return null;
  }
  return window.localStorage.getItem('token') || window.sessionStorage.getItem('token');
}

export function getUser() {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = window.localStorage.getItem('user') || window.sessionStorage.getItem('user');
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function isAuthenticated() {
  return Boolean(getToken());
}
