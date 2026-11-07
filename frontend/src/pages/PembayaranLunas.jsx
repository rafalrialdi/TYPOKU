import { useEffect, useRef, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import {
  FiAlertCircle,
  FiArrowRight,
  FiCheck,
  FiCheckCircle,
  FiClock,
  FiCopy,
  FiHome,
  FiRefreshCw,
} from 'react-icons/fi';
import Skeleton from '../components/Skeleton';
import { useApiGet } from '../hooks/useApiGet';
import { usePaymentPolling } from '../hooks/usePaymentPolling';
import { getPaymentStatus } from '../services/paymentApi';
import { loadSnap, openSnap } from '../utils/snap';
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

function PaymentSkeleton() {
  return (
    <div className="payment-container" role="status" aria-label="Memuat status pembayaran">
      <div className="payment-card">
        <Skeleton className="payment-skel-badge" />
        <Skeleton className="payment-skel-title" />
        <Skeleton className="payment-skel-text" />
        <Skeleton className="payment-skel-block" />
        <Skeleton className="payment-skel-block" />
        <Skeleton className="payment-skel-button" />
      </div>
    </div>
  );
}

function OrderSummary({ order, statusLabel, statusClass, onCopy, copied }) {
  return (
    <div className="payment-summary">
      <div className="payment-summary-head">
        <h2>Rincian Ringkasan Transaksi</h2>
        <span className={`payment-badge ${statusClass}`}>{statusLabel}</span>
      </div>

      <dl className="payment-summary-list">
        <div>
          <dt>Metode Pembayaran</dt>
          <dd>{(order.payment_method || 'qris').toUpperCase()}</dd>
        </div>
        <div>
          <dt>Nominal Transaksi</dt>
          <dd className="payment-summary-amount">{formatRupiah(order.total_amount)}</dd>
        </div>
        <div>
          <dt>ID Pesanan</dt>
          <dd className="payment-summary-id">
            <code>{order.order_code}</code>
            <button
              className="payment-copy"
              type="button"
              onClick={() => onCopy(order.order_code)}
              title="Salin ID Pesanan"
              aria-label="Salin ID Pesanan"
            >
              {copied ? <FiCheck aria-hidden="true" /> : <FiCopy aria-hidden="true" />}
            </button>
          </dd>
        </div>
        <div>
          <dt>Paket</dt>
          <dd>
            {order.package_name} ({formatRupiah(order.package_price)})
          </dd>
        </div>
        <div>
          <dt>Biaya Admin</dt>
          <dd>{formatRupiah(order.admin_fee)}</dd>
        </div>
        {order.paid_at ? (
          <div>
            <dt>Waktu Pembayaran</dt>
            <dd>{formatDateTime(order.paid_at)}</dd>
          </div>
        ) : (
          <div>
            <dt>Dibuat Pada</dt>
            <dd>{formatDateTime(order.created_at)}</dd>
          </div>
        )}
        {order.expired_at && !order.paid_at ? (
          <div>
            <dt>Batas Pembayaran</dt>
            <dd>{formatDateTime(order.expired_at)}</dd>
          </div>
        ) : null}
      </dl>

      <p className="payment-copy-hint" aria-live="polite">
        {copied ? 'ID pesanan tersalin.' : ''}
      </p>
    </div>
  );
}

export default function PembayaranLunas() {
  const { orderCode } = useParams();
  const navigate = useNavigate();
  const { data: order, error, loading, showSkeleton, reload } = useApiGet(
    () => getPaymentStatus(orderCode),
    [orderCode]
  );

  const [copied, setCopied] = useState(false);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState('');
  const [pollingStopped, setPollingStopped] = useState(false);
  const copyTimerRef = useRef(null);
  const payingRef = useRef(false);

  const { start, stop } = usePaymentPolling({
    fetchStatus: getPaymentStatus,
    onPaid: () => reload(),
    onExpired: () => navigate(`/pembayaran/expired/${orderCode}`, { replace: true }),
    onFailed: () => navigate(`/pembayaran/expired/${orderCode}`, { replace: true }),
  });

  const status = order?.status;

  useEffect(() => {
    if (status !== 'pending') {
      setPollingStopped(false);
      return undefined;
    }

    setPollingStopped(false);
    start(orderCode);

    const timer = setTimeout(() => {
      stop();
      setPollingStopped(true);
    }, 180000);

    return () => {
      clearTimeout(timer);
      stop();
    };
  }, [status, orderCode, start, stop]);

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

  function handleCheckStatus() {
    setPollingStopped(false);
    start(orderCode);
    reload();
  }

  async function handleResumePayment() {
    if (!order?.snap_token || !order?.client_key || payingRef.current) return;

    payingRef.current = true;
    setPayError('');
    setPaying(true);

    try {
      await loadSnap(order.client_key, order.midtrans_is_production);
      start(orderCode);

      openSnap(order.snap_token, {
        onSuccess: () => {
          reload();
        },
        onPending: () => {},
        onError: () => {
          payingRef.current = false;
          setPaying(false);
          setPayError('Pembayaran gagal diproses. Silakan coba lagi.');
        },
        onClose: () => {
          payingRef.current = false;
          setPaying(false);
        },
      });
    } catch (resumeError) {
      payingRef.current = false;
      setPaying(false);
      setPayError(resumeError?.message || 'Gagal membuka jendela pembayaran.');
    }
  }

  if (loading || showSkeleton) {
    return (
      <div className="payment-page">
        <PaymentSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="payment-page">
        <div className="payment-container">
          <div className="payment-card payment-card--state" role="alert">
            <span className="payment-state-icon payment-state-icon--danger" aria-hidden="true">
              <FiAlertCircle />
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

  if (status === 'expired' || status === 'failed' || status === 'cancelled') {
    return <Navigate to={`/pembayaran/expired/${orderCode}`} replace />;
  }

  if (!order) {
    return <Navigate to="/paket" replace />;
  }

  if (status !== 'paid' && status !== 'pending') {
    return <Navigate to="/paket" replace />;
  }

  if (status === 'pending') {
    return (
      <div className="payment-page">
        <div className="payment-container">
          <div className="payment-card payment-card--state">
            <span className="payment-badge payment-badge--pending payment-badge--inline">
              <FiClock aria-hidden="true" />
              Menunggu Verifikasi Pembayaran
            </span>
            <h1 className="payment-title">Pembayaran Sedang Diverifikasi</h1>
            <p className="payment-text">
              Kami sedang menunggu konfirmasi pembayaran dari Midtrans. Halaman ini akan
              diperbarui otomatis setelah dana diterima. Jangan tutup halaman ini.
            </p>

            {pollingStopped ? (
              <p className="payment-note">
                Pembaruan otomatis dihentikan sementara. Tekan tombol cek status untuk memeriksa
                ulang.
              </p>
            ) : (
              <p className="payment-note payment-note--pending">
                <span className="payment-spinner" aria-hidden="true" />
                Memeriksa status setiap 5 detik...
              </p>
            )}

            {payError ? (
              <div className="payment-alert" role="alert">
                <FiAlertCircle aria-hidden="true" />
                <span>{payError}</span>
              </div>
            ) : null}

            <OrderSummary
              order={order}
              statusLabel="MENUNGGU"
              statusClass="payment-badge--pending"
              onCopy={handleCopy}
              copied={copied}
            />

            <div className="payment-actions">
              <button
                className="payment-button"
                type="button"
                onClick={handleCheckStatus}
                disabled={showSkeleton}
              >
                <FiRefreshCw aria-hidden="true" />
                Cek Status Sekarang
              </button>

              {order.can_reopen && order.snap_token ? (
                <button
                  className="payment-button payment-button--ghost"
                  type="button"
                  onClick={handleResumePayment}
                  disabled={paying}
                  aria-busy={paying}
                >
                  {paying ? 'Menunggu pembayaran...' : 'Lanjutkan Pembayaran'}
                </button>
              ) : (
                <Link className="payment-button payment-button--ghost" to="/paket">
                  Lihat Paket
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-page">
      <div className="payment-container">
        <div className="payment-card">
          <span className="payment-badge payment-badge--success payment-badge--inline">
            <FiCheckCircle aria-hidden="true" />
            Status: Pembayaran Berhasil Masuk
          </span>
          <h1 className="payment-title">Dana Pembayaran Telah Diterima!</h1>
          <p className="payment-text payment-text--center">
            Sistem verifikasi otomatis TypoKu telah mendeteksi dana masuk. Transaksi tervalidasi
            dan lisensi paket <strong>{order.package_name}</strong> langsung aktif.
          </p>

          <div className="payment-steps">
            <span className="payment-steps-label">Proses Verifikasi Real-Time</span>

            <div className="payment-step">
              <span className="payment-step-icon" aria-hidden="true">
                <FiCheck />
              </span>
              <div>
                <p className="payment-step-title">Otorisasi Payment Gateway</p>
                <p className="payment-step-text">Validasi token transaksi gateway</p>
              </div>
              <span className="payment-step-state">Terkonfirmasi</span>
            </div>

            <div className="payment-step">
              <span className="payment-step-icon" aria-hidden="true">
                <FiCheck />
              </span>
              <div>
                <p className="payment-step-title">Penerimaan Mutasi Rekening</p>
                <p className="payment-step-text">
                  Dana masuk {formatRupiah(order.total_amount)}
                </p>
              </div>
              <span className="payment-step-state">{formatDateTime(order.paid_at)}</span>
            </div>

            <div className="payment-step">
              <span className="payment-step-icon" aria-hidden="true">
                <FiCheck />
              </span>
              <div>
                <p className="payment-step-title">Aktivasi Paket</p>
                <p className="payment-step-text">Lisensi {order.package_name} aktif</p>
              </div>
              <span className="payment-step-state">Aktif</span>
            </div>
          </div>

          <OrderSummary
            order={order}
            statusLabel="LUNAS"
            statusClass="payment-badge--success"
            onCopy={handleCopy}
            copied={copied}
          />

          <div className="payment-actions">
            <Link className="payment-button" to="/">
              Mulai TypoKu
              <FiArrowRight aria-hidden="true" />
            </Link>
            <Link className="payment-button payment-button--ghost" to="/paket">
              <FiHome aria-hidden="true" />
              Kembali ke Paket
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
