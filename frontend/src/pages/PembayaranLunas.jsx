import { useEffect, useRef, useState, useCallback } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import {
  FiAlertCircle,
  FiArrowRight,
  FiCheck,
  FiCheckCircle,
  FiClock,
  FiCopy,
  FiRefreshCw,
} from 'react-icons/fi';
import Skeleton from '../components/Skeleton';
import { Toast, useToast } from '../components/Toast';
import { usePaymentStatus } from '../hooks/usePaymentStatus';
import { usePaymentPolling } from '../hooks/usePaymentPolling';
import { api } from '../lib/api';
import { queryKeys } from '../lib/queryKeys';
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

export function PaymentSkeleton() {
  return (
    <div className="payment-page">
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
    </div>
  );
}

function OrderSummary({ order, statusLabel, statusClass, onCopy, copied, compact = false }) {
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
        {!compact ? (
          <>
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
          </>
        ) : null}
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
  const queryClient = useQueryClient();
  const { toast, showToast } = useToast();
  const { data: order } = usePaymentStatus(orderCode);

  const [copied, setCopied] = useState(false);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState('');
  const [pollingStopped, setPollingStopped] = useState(false);
  const copyTimerRef = useRef(null);
  const payingRef = useRef(false);
  const snapSuccessRef = useRef(false);

  const fetchStatusForPolling = useCallback(
    async (code) => {
      const response = await api(`/api/payments/status/${encodeURIComponent(code)}`, {
        auth: true,
      });
      if (response?.data) {
        queryClient.setQueryData(queryKeys.paymentStatus(code), response);
      }
      return response;
    },
    [queryClient]
  );

  // Sinkronisasi cache setelah pembayaran lunas.
  // invalidateQueries saja TIDAK cukup: query myAccess tidak punya observer aktif di
  // halaman ini, sehingga invalidate hanya menandai basi tanpa memicu request.
  // fetchQuery memaksa request berjalan dan langsung mengisi cache. staleTime: 0
  // dipakai agar data yang baru diterima tidak langsung dianggap segar dari cache lama.
  const syncAccessAfterPaid = useCallback(
    async (status) => {
      queryClient.setQueryData(queryKeys.paymentStatus(orderCode), { data: status });

      if (status?.status !== 'paid') {
        return;
      }

      try {
        await Promise.all([
          queryClient.fetchQuery({
            queryKey: queryKeys.myAccess,
            queryFn: () => api('/api/subscriptions/my-access', { auth: true }),
            staleTime: 0,
          }),
          queryClient.invalidateQueries({ queryKey: queryKeys.myOrders }),
        ]);
      } catch (error) {
        // Jangan gagalkan halaman pembayaran hanya karena sinkronisasi akses error.
        console.error('Gagal menyinkronkan status langganan:', error);
      }
    },
    [queryClient, orderCode]
  );

  const { start, stop } = usePaymentPolling({
    fetchStatus: fetchStatusForPolling,
    onPaid: syncAccessAfterPaid,
    onExpired: () => navigate(`/pembayaran/expired/${orderCode}`, { replace: true }),
    onFailed: () => navigate(`/pembayaran/expired/${orderCode}`, { replace: true }),
  });

  const status = order?.status;

  // Bug B fix: jika order sudah berstatus paid saat halaman dimuat, polling tidak pernah
  // berjalan sehingga onPaid tidak pernah dipanggil. Sinkronkan cache langsung di sini.
  // Bergantung pada status & paid_at (primitif), bukan objek order, agar tidak terjadi loop
  // ketika usePaymentStatus melakukan refetch.
  const paidAt = order?.paid_at;

  useEffect(() => {
    if (status !== 'paid') {
      return;
    }

    syncAccessAfterPaid({ ...order, status: 'paid' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, paidAt, orderCode, syncAccessAfterPaid]);

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
    showToast('Kamu mengklik: Rincian Ringkasan Transaksi');
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
    queryClient.invalidateQueries({ queryKey: queryKeys.paymentStatus(orderCode) });
  }

  // Jaring pengaman terakhir: verifikasi status ke backend sebelum berpindah halaman,
  // sehingga cache myAccess sudah benar saat halaman fitur dibuka.
  async function handleStartTypoku() {
    try {
      const response = await api(`/api/payments/status/${encodeURIComponent(orderCode)}`, {
        auth: true,
      });
      const latest = response?.data ?? response;

      if (latest) {
        await syncAccessAfterPaid(latest);
      }
    } catch (error) {
      console.error('Verifikasi akhir status pembayaran gagal:', error);
    } finally {
      navigate('/cek-typo');
    }
  }

  async function handleResumePayment() {
    if (!order?.snap_token || !order?.client_key || payingRef.current) return;

    payingRef.current = true;
    snapSuccessRef.current = false;
    setPayError('');
    setPaying(true);

    try {
      await loadSnap(order.client_key, order.midtrans_is_production);
      start(orderCode);

      openSnap(order.snap_token, {
        onSuccess: () => {
          snapSuccessRef.current = true;
          // refetchType 'all' agar usePaymentStatus benar-benar memanggil ulang endpoint
          // status; begitu response paid masuk, efek sinkronisasi myAccess di atas berjalan.
          queryClient.invalidateQueries({
            queryKey: queryKeys.paymentStatus(orderCode),
            refetchType: 'all',
          });
          queryClient.invalidateQueries({ queryKey: queryKeys.myOrders });
          queryClient.invalidateQueries({ queryKey: queryKeys.myAccess });
        },
        onPending: () => {},
        onError: () => {
          stop(); // Sesuai pollingpayment (1).md: snap error menghentikan polling
          payingRef.current = false;
          setPaying(false);
          setPayError('Pembayaran gagal diproses. Silakan coba lagi.');
        },
        onClose: () => {
          payingRef.current = false;
          setPaying(false);
          if (!snapSuccessRef.current) {
            showToast('Popup ditutup. Status pembayaran tetap dipantau otomatis.');
          }
        },
      });
    } catch (resumeError) {
      stop();
      payingRef.current = false;
      setPaying(false);
      setPayError(resumeError?.message || 'Gagal membuka jendela pembayaran.');
    }
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
                onClick={() => {
                  showToast('Kamu mengklik: Pembayaran Sedang Diverifikasi');
                  handleCheckStatus();
                }}
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
        <Toast toast={toast} />
      </div>
    );
  }

  return (
    <div className="payment-page payment-page--paid">
      <div className="payment-container payment-container--wide">
        <div className="payment-card payment-card--paid">
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
          </div>

          <OrderSummary
            order={order}
            statusLabel="LUNAS"
            statusClass="payment-badge--success"
            onCopy={handleCopy}
            copied={copied}
            compact
          />

          <div className="payment-actions payment-actions--single">
            <button
              className="payment-button"
              type="button"
              onClick={handleStartTypoku}
            >
              Mulai Typoku
              <FiArrowRight aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
      <Toast toast={toast} />
    </div>
  );
}
