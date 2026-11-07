import { useEffect, useRef, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import {
  FiAlertTriangle,
  FiCheck,
  FiCopy,
  FiHome,
  FiMail,
  FiRefreshCw,
} from 'react-icons/fi';
import Skeleton from '../components/Skeleton';
import { useApiGet } from '../hooks/useApiGet';
import { getPaymentStatus } from '../services/paymentApi';
import './payment.css';

const rupiahFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat('id-ID', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'Asia/Jakarta',
});

function formatRupiah(value) {
  const amount = Number(value);
  return Number.isFinite(amount) ? rupiahFormatter.format(amount) : 'Rp 0';
}

function formatDateTime(value) {
  if (!value) return '-';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';

  return `${dateFormatter.format(date)} WIB`;
}

function ExpiredSkeleton() {
  return (
    <div className="payment-container" role="status" aria-label="Memuat status pembayaran">
      <div className="payment-card">
        <Skeleton className="payment-skel-badge" />
        <Skeleton className="payment-skel-title" />
        <Skeleton className="payment-skel-text" />
        <Skeleton className="payment-skel-block" />
        <Skeleton className="payment-skel-button" />
      </div>
    </div>
  );
}

export default function PembayaranExpired() {
  const { orderCode } = useParams();
  const { data: order, error, loading, showSkeleton, reload } = useApiGet(
    () => getPaymentStatus(orderCode),
    [orderCode]
  );

  const [copied, setCopied] = useState(false);
  const copyTimerRef = useRef(null);

  useEffect(
    () => () => {
      if (copyTimerRef.current) {
        clearTimeout(copyTimerRef.current);
      }
    },
    []
  );

  async function handleCopy(value) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);

      if (copyTimerRef.current) {
        clearTimeout(copyTimerRef.current);
      }

      copyTimerRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  if (loading || showSkeleton) {
    return (
      <div className="payment-page">
        <ExpiredSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="payment-page">
        <div className="payment-container">
          <div className="payment-card payment-card--state" role="alert">
            <span className="payment-state-icon payment-state-icon--danger" aria-hidden="true">
              <FiAlertTriangle />
            </span>
            <h1 className="payment-title">
              {error?.status === 404 ? 'Pesanan tidak ditemukan.' : 'Gagal memuat status pembayaran.'}
            </h1>
            <p className="payment-text">
              {error?.status === 404
                ? 'Pastikan tautan pembayaran yang Anda buka sudah benar.'
                : error?.message || 'Periksa koneksi Anda lalu coba lagi.'}
            </p>
            <div className="payment-actions">
              <button className="payment-button" type="button" onClick={reload}>
                <FiRefreshCw aria-hidden="true" />
                Coba Lagi
              </button>
              <Link className="payment-button payment-button--ghost" to="/paket">
                Lihat Paket
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return <Navigate to="/paket" replace />;
  }

  if (order.status === 'paid') {
    return <Navigate to={`/pembayaran/lunas/${orderCode}`} replace />;
  }

  if (order.status === 'pending') {
    return <Navigate to={`/pembayaran/lunas/${orderCode}`} replace />;
  }

  if (!['expired', 'failed', 'cancelled'].includes(order.status)) {
    return <Navigate to="/paket" replace />;
  }

  return (
    <div className="payment-page">
      <div className="payment-container">
        <div className="payment-card">
          <span className="payment-badge payment-badge--expired payment-badge--inline">
            <FiAlertTriangle aria-hidden="true" />
            Waktu Pembayaran Habis
          </span>
          <h1 className="payment-title">Pesanan Ini Telah Kedaluwarsa</h1>
          <p className="payment-text payment-text--center">
            Batas waktu pembayaran telah berakhir. Nomor tagihan ini dinonaktifkan dan tidak lagi
            menerima pembayaran otomatis. Silakan buat pesanan baru untuk mengaktifkan langganan
            TypoKu Anda.
          </p>

          <div className="payment-summary">
            <div className="payment-summary-head">
              <h2>Rincian Pesanan Kedaluwarsa</h2>
              <span className="payment-badge payment-badge--expired">
                {order.status === 'cancelled' ? 'DIBATALKAN' : order.status === 'failed' ? 'GAGAL' : 'KEDALUWARSA'}
              </span>
            </div>

            <dl className="payment-summary-list">
              <div>
                <dt>Paket</dt>
                <dd>{order.package_name}</dd>
              </div>
              <div>
                <dt>Metode Pembayaran</dt>
                <dd>{(order.payment_method || 'qris').toUpperCase()}</dd>
              </div>
              <div>
                <dt>Total Tagihan</dt>
                <dd className="payment-summary-amount">{formatRupiah(order.total_amount)}</dd>
              </div>
              <div>
                <dt>ID Pesanan</dt>
                <dd className="payment-summary-id">
                  <code>{order.order_code}</code>
                  <button
                    className="payment-copy"
                    type="button"
                    onClick={() => handleCopy(order.order_code)}
                    title="Salin ID Pesanan"
                    aria-label="Salin ID Pesanan"
                  >
                    {copied ? <FiCheck aria-hidden="true" /> : <FiCopy aria-hidden="true" />}
                  </button>
                </dd>
              </div>
              <div>
                <dt>Dibuat Pada</dt>
                <dd>{formatDateTime(order.created_at)}</dd>
              </div>
              <div>
                <dt>Kedaluwarsa Pada</dt>
                <dd>{formatDateTime(order.expired_at)}</dd>
              </div>
            </dl>

            <p className="payment-copy-hint" aria-live="polite">
              {copied ? 'ID pesanan tersalin.' : ''}
            </p>
          </div>

          <div className="payment-actions">
            <Link className="payment-button" to="/paket">
              <FiRefreshCw aria-hidden="true" />
              Lihat Paket Lagi
            </Link>
            <Link className="payment-button payment-button--ghost" to="/">
              <FiHome aria-hidden="true" />
              Kembali ke Beranda
            </Link>
          </div>

          <p className="payment-help">
            <FiMail aria-hidden="true" />
            Jika saldo Anda sempat terpotong, hubungi{' '}
            <a href="mailto:Rafalrialdi71@gmail.com">Rafalrialdi71@gmail.com</a> dengan
            menyertakan ID pesanan di atas.
          </p>
        </div>
      </div>
    </div>
  );
}
