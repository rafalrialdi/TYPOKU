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
import { ErrorBoundary } from './components/ErrorBoundary';
import QueryBoundary from './components/QueryBoundary';
import CekTypo, { CekTypoSkeleton } from './pages/CekTypo';
import CheckEmail from './pages/CheckEmail';
import Checkout, { CheckoutSkeleton } from './pages/Checkout';
import ForgotPassword from './pages/ForgotPassword';
import Home from './pages/Home';
import KebijakanPrivasi from './pages/KebijakanPrivasi';
import Login from './pages/Login';
import Paket, { PaketSkeleton } from './pages/Paket';
import Parafrase, { ParafraseSkeleton } from './pages/Parafrase';
import SyaratKetentuan from './pages/SyaratKetentuan';
import Terjemah, { TerjemahSkeleton } from './pages/Terjemah';
import PembayaranExpired, { ExpiredSkeleton } from './pages/PembayaranExpired';
import PembayaranLunas, { PaymentSkeleton } from './pages/PembayaranLunas';
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

function RootErrorBoundary({ children }) {
  const { pathname } = useLocation();

  return <ErrorBoundary resetKeys={[pathname]}>{children}</ErrorBoundary>;
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

function RouteWithQueryBoundary({ children, fallback }) {
  const { pathname } = useLocation();
  return (
    <QueryBoundary fallback={fallback} resetKeys={[pathname]}>
      {children}
    </QueryBoundary>
  );
}

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <RootErrorBoundary>
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
              <Route path="/syarat-ketentuan" element={<SyaratKetentuan />} />
              <Route path="/kebijakan-privasi" element={<KebijakanPrivasi />} />
              {/* Halaman fitur AI dapat dibuka tanpa login. Tamu melihat
                  pratinjau "fitur terkunci" dan ajakan berlangganan, bukan
                  dialihkan paksa ke /login. */}
              <Route
                path="/cek-typo"
                element={
                  <RouteWithQueryBoundary fallback={<CekTypoSkeleton />}>
                    <CekTypo />
                  </RouteWithQueryBoundary>
                }
              />
              <Route
                path="/parafrase"
                element={
                  <RouteWithQueryBoundary fallback={<ParafraseSkeleton />}>
                    <Parafrase />
                  </RouteWithQueryBoundary>
                }
              />
              <Route
                path="/terjemah"
                element={
                  <RouteWithQueryBoundary fallback={<TerjemahSkeleton />}>
                    <Terjemah />
                  </RouteWithQueryBoundary>
                }
              />
              <Route
                path="/paket"
                element={
                  <RouteWithQueryBoundary fallback={<PaketSkeleton />}>
                    <Paket />
                  </RouteWithQueryBoundary>
                }
              />
              <Route
                path="/checkout/:packageId"
                element={
                  <RequireAuth>
                    <RouteWithQueryBoundary fallback={<CheckoutSkeleton />}>
                      <Checkout />
                    </RouteWithQueryBoundary>
                  </RequireAuth>
                }
              />
              <Route
                path="/pembayaran/lunas/:orderCode"
                element={
                  <RequireAuth>
                    <RouteWithQueryBoundary fallback={<PaymentSkeleton />}>
                      <PembayaranLunas />
                    </RouteWithQueryBoundary>
                  </RequireAuth>
                }
              />
              <Route
                path="/pembayaran/expired/:orderCode"
                element={
                  <RequireAuth>
                    <RouteWithQueryBoundary fallback={<ExpiredSkeleton />}>
                      <PembayaranExpired />
                    </RouteWithQueryBoundary>
                  </RequireAuth>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </AuthProvider>
      </RootErrorBoundary>
    </Router>
  );
}
