import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { getMyAccess, loginUser, registerUser } from '../services/authApi';
import { getMyOrders } from '../services/paymentApi';
import { clearSession, getToken, getUser, saveSession } from '../services/session';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getUser());
  const [hasAccess, setHasAccess] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(() => Boolean(getToken()));

  useEffect(() => {
    const token = getToken();

    if (!token) {
      setUser(null);
      setHasAccess(false);
      setTransactions([]);
      setTransactionsLoading(false);
      setCheckingAccess(false);
      return undefined;
    }

    let active = true;
    setCheckingAccess(true);
    setTransactionsLoading(true);

    Promise.allSettled([getMyAccess(), getMyOrders()]).then(([accessResult, ordersResult]) => {
      if (!active) return;

      if (accessResult.status === 'fulfilled') {
        setUser(getUser());
        setHasAccess(Boolean(accessResult.value?.hasAccess));
      } else {
        setHasAccess(false);

        if (accessResult.reason?.status === 401) {
          clearSession();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
      }

      setTransactions(
        ordersResult.status === 'fulfilled' && Array.isArray(ordersResult.value?.data)
          ? ordersResult.value.data
          : []
      );
      setTransactionsLoading(false);
      setCheckingAccess(false);
    });

    return () => {
      active = false;
    };
  }, []);

  const loadUserData = useCallback(async () => {
    const [accessResult, ordersResult] = await Promise.allSettled([getMyAccess(), getMyOrders()]);
    const accessData = accessResult.status === 'fulfilled' ? accessResult.value : null;

    setHasAccess(Boolean(accessData?.hasAccess));
    setTransactions(
      ordersResult.status === 'fulfilled' && Array.isArray(ordersResult.value?.data)
        ? ordersResult.value.data
        : []
    );

    return Boolean(accessData?.hasAccess);
  }, []);

  const login = useCallback(
    async (payload, remember = true) => {
      const result = await loginUser(payload);
      saveSession(result.data, remember);
      const access = await loadUserData();
      setUser(result.data.user);

      return { ...result, hasAccess: access };
    },
    [loadUserData]
  );

  const register = useCallback(
    async (payload) => {
      const result = await registerUser(payload);
      saveSession(result.data, true);
      const access = await loadUserData();
      setUser(result.data.user);

      return { ...result, hasAccess: access };
    },
    [loadUserData]
  );

  const refreshTransactions = useCallback(async () => {
    if (!getToken()) {
      setTransactions([]);
      return [];
    }

    setTransactionsLoading(true);

    try {
      const response = await getMyOrders();
      const rows = Array.isArray(response?.data) ? response.data : [];
      setTransactions(rows);
      return rows;
    } catch {
      setTransactions([]);
      return [];
    } finally {
      setTransactionsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
    setHasAccess(false);
    setTransactions([]);
    setTransactionsLoading(false);
    setCheckingAccess(false);
  }, []);

  const value = {
    user,
    hasAccess,
    checkingAccess,
    transactions,
    transactionsLoading,
    login,
    register,
    refreshTransactions,
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
