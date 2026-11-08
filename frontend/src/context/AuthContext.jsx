import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { clearSession, getUser, saveSession } from '../services/session';
import { clearPersistedCache } from '../lib/queryClient';
import { useLoginMutation, useRegisterMutation } from '../hooks/useAuthMutations';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getUser());
  const loginMutation = useLoginMutation();
  const registerMutation = useRegisterMutation();

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

  const logout = useCallback(() => {
    clearSession();
    clearPersistedCache();
    setUser(null);
  }, []);

  const value = {
    user,
    login,
    register,
    logout,
    isLoggingIn: loginMutation.isPending,
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
