import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FiChevronDown,
  FiChevronUp,
  FiFileText,
  FiLogOut,
  FiUser,
} from 'react-icons/fi';
import Skeleton from './Skeleton';
import { useAuth } from '../context/AuthContext';
import { isAuthenticated } from '../services/session';
import './components.css';

const STATUS_LABELS = {
  pending: 'Menunggu',
  paid: 'Lunas',
  expired: 'Waktu Habis',
  failed: 'Gagal',
  cancelled: 'Dibatalkan',
};

const STATUS_CLASS = {
  pending: 'pending',
  paid: 'paid',
  expired: 'expired',
  failed: 'failed',
  cancelled: 'failed',
};

const dateFormatter = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

const rupiahFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

function formatDate(value) {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : dateFormatter.format(date);
}

function formatRupiah(value) {
  const amount = Number(value);
  return Number.isFinite(amount) ? rupiahFormatter.format(amount) : 'Rp 0';
}

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
  const { user, logout, transactions, transactionsLoading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const currentPath = location.pathname;
  const authenticated = Boolean(user) && isAuthenticated();
  const recentTransactions = transactions.slice(0, 3);

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
    logout();
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

                  <div className="nav-user-menu-history">
                    <p className="nav-user-menu-history-title">
                      <FiFileText aria-hidden="true" />
                      Riwayat Transaksi
                    </p>

                    {transactionsLoading ? (
                      <div className="nav-user-menu-history-list" aria-label="Memuat riwayat transaksi">
                        {[0, 1].map((item) => (
                          <div className="nav-user-menu-history-item" key={item}>
                            <div className="nav-user-menu-history-info">
                              <Skeleton className="nav-user-menu-history-skeleton-title" />
                              <Skeleton className="nav-user-menu-history-skeleton-meta" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : recentTransactions.length === 0 ? (
                      <p className="nav-user-menu-history-empty">Belum ada transaksi.</p>
                    ) : (
                      <div className="nav-user-menu-history-list">
                        {recentTransactions.map((transaction) => {
                          const status = transaction.status || 'expired';

                          return (
                            <div
                              className="nav-user-menu-history-item"
                              key={transaction.id || transaction.order_code}
                            >
                              <div className="nav-user-menu-history-info">
                                <span className="nav-user-menu-history-name">
                                  {transaction.package_name}
                                </span>
                                <span className="nav-user-menu-history-meta">
                                  {formatDate(transaction.paid_at || transaction.created_at)}
                                  {' · '}
                                  {STATUS_LABELS[status] || status}
                                </span>
                              </div>
                              <div className="nav-user-menu-history-amount">
                                <span>{formatRupiah(transaction.total_amount)}</span>
                                <span
                                  className={`nav-user-menu-history-badge nav-user-menu-history-badge--${
                                    STATUS_CLASS[status] || 'expired'
                                  }`}
                                >
                                  {STATUS_LABELS[status] || status}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
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
        </div>
      </div>
    </nav>
  );
}
