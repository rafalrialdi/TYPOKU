import Skeleton from './Skeleton';
import { useMyOrders } from '../hooks/useMyOrders';

const STATUS_LABELS = {
  pending: 'Menunggu',
  paid: 'Lunas',
  expired: 'Expired',
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

function addDays(value, days) {
  const date = new Date(value);
  const duration = Number(days);

  if (Number.isNaN(date.getTime()) || !Number.isFinite(duration) || duration <= 0) {
    return null;
  }

  date.setDate(date.getDate() + duration);
  return date;
}

function formatTransactionPeriod(transaction) {
  const startedAt = formatDate(transaction.created_at);
  const paidExpiry =
    transaction.subscription_expired_at ||
    transaction.display_expired_at ||
    (transaction.status === 'paid'
      ? addDays(transaction.paid_at || transaction.created_at, transaction.duration_days)
      : null);
  const expiredAt = formatDate(paidExpiry || transaction.expired_at);

  if (startedAt && expiredAt) return `${startedAt} - ${expiredAt}`;
  return startedAt || expiredAt;
}

export function TransactionHistorySkeleton() {
  return (
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
  );
}

export default function TransactionHistory() {
  const { data: transactions } = useMyOrders();
  const recentTransactions = transactions.slice(0, 3);

  if (recentTransactions.length === 0) {
    return <p className="nav-user-menu-history-empty">Belum ada transaksi.</p>;
  }

  return (
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
                {formatTransactionPeriod(transaction)}
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
  );
}
