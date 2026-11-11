import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { clearSession, getUser, saveSession } from '../services/session';
import { clearPersistedCache } from '../lib/queryClient';
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
