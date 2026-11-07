import { useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthLayout from './layouts/AuthLayout';
import MainLayout from './layouts/MainLayout';
import CheckEmail from './pages/CheckEmail';
import Checkout from './pages/Checkout';
import ForgotPassword from './pages/ForgotPassword';
import Home from './pages/Home';
import Login from './pages/Login';
import Paket from './pages/Paket';
import PembayaranExpired from './pages/PembayaranExpired';
import PembayaranLunas from './pages/PembayaranLunas';
import Register from './pages/Register';
import ResetPassword from './pages/ResetPassword';

function RequireAuth({ children }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    const redirect = encodeURIComponent(`${location.pathname}${location.search}`);
    return <Navigate to={`/login?redirect=${redirect}`} replace />;
  }

  return children;
}

function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, [pathname, search]);

  useEffect(() => {
    function handleClick(event) {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const anchor =
        event.target instanceof Element ? event.target.closest('a[href]') : null;

      if (!anchor) return;

      const target = anchor.getAttribute('target');
      if ((target && target !== '_self') || anchor.hasAttribute('download')) return;

      const url = new URL(anchor.href, window.location.href);
      const current = window.location;

      if (url.origin !== current.origin) return;
      if (url.pathname !== current.pathname || url.search !== current.search) return;

      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }

    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, []);

  return null;
}

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <AuthProvider>
        <Routes>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/lupa-kata-sandi" element={<ForgotPassword />} />
            <Route path="/cek-email" element={<CheckEmail />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Route>

          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/paket" element={<Paket />} />
            <Route
              path="/checkout/:packageId"
              element={
                <RequireAuth>
                  <Checkout />
                </RequireAuth>
              }
            />
            <Route
              path="/pembayaran/lunas/:orderCode"
              element={
                <RequireAuth>
                  <PembayaranLunas />
                </RequireAuth>
              }
            />
            <Route
              path="/pembayaran/expired/:orderCode"
              element={
                <RequireAuth>
                  <PembayaranExpired />
                </RequireAuth>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}
