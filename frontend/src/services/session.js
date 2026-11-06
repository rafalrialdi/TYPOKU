const SESSION_KEYS = [
  'token',
  'user',
  'id',
  'nama',
  'email',
  'phone',
  'role',
  'identifier',
  'remember',
];

function getStores() {
  if (typeof window === 'undefined') {
    return [];
  }
  return [window.localStorage, window.sessionStorage];
}

function removeNotificationKeys(store) {
  Object.keys(store).forEach((key) => {
    if (key.startsWith('notif_')) {
      store.removeItem(key);
    }
  });
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
  store.setItem('id', String(user.id ?? ''));
  store.setItem('nama', user.name || '');
  store.setItem('email', user.email || '');
  store.setItem('phone', user.phone || '');
  store.setItem('role', user.role || 'user');
  store.setItem('identifier', user.email || '');
  store.setItem('remember', remember ? '1' : '0');

  window.dispatchEvent(new CustomEvent('typoku:auth-changed'));
}

export function clearSession() {
  getStores().forEach((store) => {
    SESSION_KEYS.forEach((key) => store.removeItem(key));
    removeNotificationKeys(store);
  });

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('typoku:auth-changed'));
  }
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
