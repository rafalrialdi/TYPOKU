const API_BASE_URL = (import.meta.env?.VITE_API_BASE_URL || 'http://localhost:8000').replace(
  /\/$/,
  ''
);

import { clearSession, getToken } from './session';

async function request(path, { method = 'GET', body, auth = false, headers, signal } = {}) {
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
    ...(body !== undefined ? { body: body instanceof FormData ? body : JSON.stringify(body) } : {}),
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (response.status === 401 && auth) {
    clearSession();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    return Promise.reject({ status: 401, redirected: true });
  }

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
  loginUser,
  registerUser,
  request,
  requestPasswordReset,
  resetPassword,
  verifyResetToken,
};