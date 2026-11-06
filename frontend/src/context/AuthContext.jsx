import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { getMyAccess, loginUser, registerUser } from '../services/authApi';
import { clearSession, getToken, getUser, saveSession } from '../services/session';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getUser());
  const [hasAccess, setHasAccess] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(() => Boolean(getToken()));

  useEffect(() => {
    const token = getToken();

    if (!token) {
      setUser(null);
      setHasAccess(false);
      setCheckingAccess(false);
      return undefined;
    }

    let active = true;
    setCheckingAccess(true);

    getMyAccess()
      .then((data) => {
        if (!active) return;
        setUser(getUser());
        setHasAccess(Boolean(data?.hasAccess));
        setCheckingAccess(false);
      })
      .catch((error) => {
        if (!active) return;
        setHasAccess(false);
        setCheckingAccess(false);

        if (error?.status === 401) {
          clearSession();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (payload, remember = true) => {
    const result = await loginUser(payload);
    saveSession(result.data, remember);
    const accessData = await getMyAccess();
    setUser(result.data.user);
    setHasAccess(Boolean(accessData?.hasAccess));

    return { ...result, hasAccess: Boolean(accessData?.hasAccess) };
  }, []);

  const register = useCallback(async (payload) => {
    const result = await registerUser(payload);
    saveSession(result.data, true);
    const accessData = await getMyAccess();
    setUser(result.data.user);
    setHasAccess(Boolean(accessData?.hasAccess));

    return { ...result, hasAccess: Boolean(accessData?.hasAccess) };
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
    setHasAccess(false);
    setCheckingAccess(false);
  }, []);

  const value = {
    user,
    hasAccess,
    checkingAccess,
    login,
    register,
    logout,
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
