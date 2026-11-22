import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { clearSession, getToken, getUser, saveSession, updateStoredUser } from '../services/session';
import { clearPersistedCache } from '../lib/queryClient';
import { api } from '../lib/api';
import { useLoginMutation, useRegisterMutation, useGoogleLoginMutation } from '../hooks/useAuthMutations';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getUser());
  const loginMutation = useLoginMutation();
  const registerMutation = useRegisterMutation();
  const googleMutation = useGoogleLoginMutation();

  useEffect(() => {
    function handleAuthChanged() {
      setUser(getUser());
    }

    window.addEventListener('typoku:auth-changed', handleAuthChanged);
    return () => {
      window.removeEventListener('typoku:auth-changed', handleAuthChanged);
    };
  }, []);

  // Revalidasi profil sekali saat aplikasi dibuka. Data di localStorage bisa
  // sudah basi (nama berubah, google_id baru ditautkan, atau akun sudah dihapus
  // di server), dan tanpa ini user melihat profil lama sampai logout manual.
  // Data cache tetap dipakai untuk paint pertama; hasil server menimpanya lewat
  // event 'typoku:auth-changed' yang sudah ditangani listener di atas.
  useEffect(() => {
    if (!getToken()) {
      return undefined;
    }

    let cancelled = false;

    api('/api/auth/me', { auth: true })
      .then((response) => {
        const freshUser = response?.data?.user;
        if (!cancelled && freshUser) {
          updateStoredUser(freshUser);
        }
      })
      .catch(() => {
        // 401 sudah ditangani apiClient: sesi dibersihkan, dan redirect ke
        // /login hanya dilakukan bila halaman saat ini memang butuh sesi.
        // Kegagalan jaringan TIDAK boleh mengeluarkan user yang tokennya masih
        // sah, jadi error lain sengaja diabaikan.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(
    async (payload, remember = true) => {
      const result = await loginMutation.mutateAsync(payload);
      saveSession(result.data, remember);
      setUser(result.data.user);
      return result;
    },
    [loginMutation]
  );

  const register = useCallback(
    async (payload) => {
      const result = await registerMutation.mutateAsync(payload);
      saveSession(result.data, true);
      setUser(result.data.user);
      return result;
    },
    [registerMutation]
  );

  /**
   * Login lewat Google. Bentuk data dari backend identik dengan login biasa
   * ({ token, user }), sehingga penyimpanan sesi memakai fungsi yang sama.
   */
  const loginWithGoogle = useCallback(
    async (credential, remember = true) => {
      const result = await googleMutation.mutateAsync(credential);
      saveSession(result.data, remember);
      setUser(result.data.user);
      return result;
    },
    [googleMutation]
  );

  const logout = useCallback(() => {
    // clearSession() menghapus kunci auth, notif_*, typoku_pending_order_*,
    // dan typoku_reset_email di localStorage maupun sessionStorage.
    clearSession();
    clearPersistedCache();
    setUser(null);
  }, []);

  const value = {
    user,
    login,
    loginWithGoogle,
    register,
    logout,
    isLoggingIn: loginMutation.isPending,
    isGoogleLoggingIn: googleMutation.isPending,
    isRegistering: registerMutation.isPending,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
