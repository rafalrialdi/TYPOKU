import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FiChevronDown,
  FiChevronUp,
  FiFileText,
  FiLogOut,
  FiMenu,
  FiUser,
  FiX,
} from 'react-icons/fi';
import QueryBoundary from './QueryBoundary';
import TransactionHistory, { TransactionHistorySkeleton } from './TransactionHistory';
import { useAuth } from '../context/AuthContext';
import { isAuthenticated } from '../services/session';
import './components.css';

function getInitials(user) {
  const source = user?.name?.trim() || user?.email?.trim() || '?';
  const parts = source.split(/\s+/).filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  return source.slice(0, 2).toUpperCase();
}

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const collapseBtnRef = useRef(null);
  const mobileNavRef = useRef(null);
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const currentPath = location.pathname;
  const authenticated = Boolean(user) && isAuthenticated();

  useEffect(() => {
    setMenuOpen(false);
    setNavOpen(false);
  }, [currentPath]);

  useEffect(() => {
    if (!menuOpen && !navOpen) {
      return undefined;
    }

    function handlePointerDown(event) {
      if (
        menuRef.current?.contains(event.target) ||
        buttonRef.current?.contains(event.target) ||
        collapseBtnRef.current?.contains(event.target) ||
        mobileNavRef.current?.contains(event.target)
      ) {
        return;
      }
      setMenuOpen(false);
      setNavOpen(false);
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        setNavOpen(false);
        buttonRef.current?.focus();
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [menuOpen, navOpen]);

  function handleLogout() {
    logout();
    setMenuOpen(false);
    setNavOpen(false);
    navigate('/login', { replace: true });
  }

  return (
    <nav className="navbar">
      <div className="nav-inner">
        <Link to="/" className="nav-brand">
          <span className="nav-brand-badge" aria-hidden="true">T</span>
          <span className="nav-brand-name">TypoKu</span>
        </Link>

        <div className="nav-center">
          <Link to="/" className={currentPath === '/' ? 'nav-link active' : 'nav-link'}>
            Beranda
          </Link>
          <Link to="/cek-typo" className={currentPath === '/cek-typo' ? 'nav-link active' : 'nav-link'}>
            Cek Typo
          </Link>
          <Link to="/parafrase" className={currentPath === '/parafrase' ? 'nav-link active' : 'nav-link'}>
            Parafrase
          </Link>
          <Link to="/terjemah" className={currentPath === '/terjemah' ? 'nav-link active' : 'nav-link'}>
            Terjemah
          </Link>
          <Link to="/paket" className={currentPath === '/paket' ? 'nav-link active' : 'nav-link'}>
            Paket
          </Link>
        </div>

        <div className="nav-right">
          {authenticated ? (
            <div className="nav-user-wrap" ref={menuRef}>
              <button
                ref={buttonRef}
                className="nav-user"
                type="button"
                onClick={() => {
                  setMenuOpen((current) => !current);
                  setNavOpen(false);
                }}
                aria-expanded={menuOpen}
                aria-haspopup="menu"
                aria-label={`Menu profil ${user.name || user.email}`}
              >
                <span className="nav-user-name">{user.name || user.email}</span>
                <span className="nav-user-avatar" aria-hidden="true">
                  {getInitials(user)}
                </span>
                {menuOpen ? <FiChevronUp /> : <FiChevronDown />}
              </button>

              {menuOpen ? (
                <div className="nav-user-menu" role="menu" aria-label="Menu profil">
                  <div className="nav-user-menu-header">
                    <p className="nav-user-menu-name">{user.name || 'Pengguna TypoKu'}</p>
                    <p className="nav-user-menu-email">{user.email}</p>
                  </div>

                  <div className="nav-user-menu-divider" />

                  <div className="nav-user-menu-history">
                    <p className="nav-user-menu-history-title">
                      <FiFileText aria-hidden="true" />
                      Riwayat Transaksi
                    </p>

                    <QueryBoundary
                      fallback={<TransactionHistorySkeleton />}
                      errorFallback={
                        <p className="nav-user-menu-history-empty">
                          Gagal memuat riwayat.
                        </p>
                      }
                    >
                      <TransactionHistory />
                    </QueryBoundary>
                  </div>

                  <div className="nav-user-menu-divider" />

                  <button
                    className="nav-user-menu-item nav-user-menu-item--danger"
                    type="button"
                    role="menuitem"
                    onClick={handleLogout}
                  >
                    <FiLogOut aria-hidden="true" />
                    <span>Keluar</span>
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <>
              <Link to="/login" className="nav-login">Masuk</Link>
              <Link to="/register" className="nav-register">Daftar</Link>
              <Link to="/login" className="nav-profile" aria-label="Akun">
                <FiUser />
              </Link>
            </>
          )}

          {/* Tombol navigasi collapse di pojok kanan navbar untuk tampilan mobile */}
          <button
            ref={collapseBtnRef}
            className="nav-collapse-btn"
            type="button"
            onClick={() => {
              setNavOpen((curr) => !curr);
              setMenuOpen(false);
            }}
            aria-expanded={navOpen}
            aria-label={navOpen ? 'Tutup navigasi' : 'Buka navigasi'}
          >
            {navOpen ? <FiX aria-hidden="true" /> : <FiMenu aria-hidden="true" />}
          </button>
        </div>
      </div>

      {/* Dropdown menu navigasi collapse saat di HP */}
      {navOpen ? (
        <div className="nav-mobile-menu" ref={mobileNavRef} role="menu" aria-label="Menu navigasi mobile">
          <Link
            to="/"
            className={currentPath === '/' ? 'nav-mobile-link active' : 'nav-mobile-link'}
            onClick={() => setNavOpen(false)}
          >
            Beranda
          </Link>
          <Link
            to="/cek-typo"
            className={currentPath === '/cek-typo' ? 'nav-mobile-link active' : 'nav-mobile-link'}
            onClick={() => setNavOpen(false)}
          >
            Cek Typo
          </Link>
          <Link
            to="/parafrase"
            className={currentPath === '/parafrase' ? 'nav-mobile-link active' : 'nav-mobile-link'}
            onClick={() => setNavOpen(false)}
          >
            Parafrase
          </Link>
          <Link
            to="/terjemah"
            className={currentPath === '/terjemah' ? 'nav-mobile-link active' : 'nav-mobile-link'}
            onClick={() => setNavOpen(false)}
          >
            Terjemah
          </Link>
          <Link
            to="/paket"
            className={currentPath === '/paket' ? 'nav-mobile-link active' : 'nav-mobile-link'}
            onClick={() => setNavOpen(false)}
          >
            Paket
          </Link>
          {!authenticated ? (
            <div className="nav-mobile-auth">
              <Link to="/login" className="nav-mobile-login" onClick={() => setNavOpen(false)}>
                Masuk
              </Link>
              <Link to="/register" className="nav-mobile-register" onClick={() => setNavOpen(false)}>
                Daftar
              </Link>
            </div>
          ) : null}
        </div>
      ) : null}
    </nav>
  );
}
