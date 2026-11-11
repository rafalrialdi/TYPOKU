const API_BASE_URL = (import.meta.env?.VITE_API_BASE_URL || 'http://localhost:8000').replace(
  /\/$/,
  ''
);

import { clearSession, getToken } from './session';
import { clearPersistedCache } from '../lib/queryClient';

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
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
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

function registerUser(payload) {
  return request('/api/auth/register', {
    method: 'POST',
    body: payload,
    auth: false,
  });
}

function loginUser(payload) {
  return request('/api/auth/login', {
    method: 'POST',
    body: payload,
    auth: false,
  });
}

function googleLogin(credential) {
  return request('/api/auth/google', {
    method: 'POST',
    body: { credential },
    auth: false,
  });
}

function getCurrentUser() {
  return request('/api/auth/me', {
    auth: true,
  });
}

function requestPasswordReset(email) {
  return request('/api/auth/forgot-password', {
    method: 'POST',
    body: { email },
    auth: false,
  });
}

function verifyResetToken(token) {
  return request(`/api/auth/reset-password/verify?token=${encodeURIComponent(token)}`, {
    auth: false,
  });
}

function resetPassword(payload) {
  return request('/api/auth/reset-password', {
    method: 'POST',
    body: payload,
    auth: false,
  });
}

function getMyAccess() {
  return request('/api/subscriptions/my-access', {
    auth: true,
  });
}

export {
  getCurrentUser,
  getMyAccess,
  googleLogin,
  loginUser,
  registerUser,
  request,
  requestPasswordReset,
  resetPassword,
  verifyResetToken,
};