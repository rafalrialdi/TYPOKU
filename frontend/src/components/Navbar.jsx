import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FiChevronDown,
  FiChevronUp,
  FiCreditCard,
  FiLogOut,
  FiUser,
} from 'react-icons/fi';
import { clearSession, getUser, isAuthenticated } from '../services/session';
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
  const [user, setUser] = useState(() => getUser());
  const [menuOpen, setMenuOpen] = useState(false);
  const currentPath = location.pathname;
  const authenticated = Boolean(user) && isAuthenticated();

  useEffect(() => {
    function syncAuth() {
      setUser(getUser());
      setMenuOpen(false);
    }

    window.addEventListener('typoku:auth-changed', syncAuth);
    window.addEventListener('storage', syncAuth);

    return () => {
      window.removeEventListener('typoku:auth-changed', syncAuth);
      window.removeEventListener('storage', syncAuth);
    };
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [currentPath]);

  useEffect(() => {
    if (!menuOpen) {
      return undefined;
    }

    function handlePointerDown(event) {
      if (
        menuRef.current?.contains(event.target) ||
        buttonRef.current?.contains(event.target)
      ) {
        return;
      }
      setMenuOpen(false);
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        buttonRef.current?.focus();
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [menuOpen]);

  function handleLogout() {
    clearSession();
    setMenuOpen(false);
    navigate('/login', { replace: true });
  }

  return (
    <nav className="navbar">
      <div className="nav-inner">
        <Link to="/" className="nav-brand">
          <span className="nav-brand-badge" aria-hidden="true">T</span>
          <span>TypoKu</span>
        </Link>

        <div className="nav-center">
          <Link to="/" className={currentPath === '/' ? 'nav-link active' : 'nav-link'}>
            Beranda
          </Link>
          <Link to="/cek-typo" className="nav-link">Cek Typo</Link>
          <Link to="/parafrase" className="nav-link">Parafrase</Link>
          <Link to="/terjemah" className="nav-link">Terjemah</Link>
          <a href="#paket" className="nav-link">Paket</a>
        </div>

        <div className="nav-right">
          {authenticated ? (
            <div className="nav-user-wrap" ref={menuRef}>
              <button
                ref={buttonRef}
                className="nav-user"
                type="button"
                onClick={() => setMenuOpen((current) => !current)}
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

                  <Link
                    className="nav-user-menu-item"
                    to="/#paket"
                    role="menuitem"
                    onClick={() => setMenuOpen(false)}
                  >
                    <FiCreditCard aria-hidden="true" />
                    <span>Paket &amp; Langganan</span>
                  </Link>

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
        </div>
      </div>
    </nav>
  );
}
