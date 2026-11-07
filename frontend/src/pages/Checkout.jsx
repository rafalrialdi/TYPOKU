import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  FiAlertCircle,
  FiArrowLeft,
  FiArrowRight,
  FiCamera,
  FiCheck,
  FiRefreshCw,
  FiShield,
} from 'react-icons/fi';
import Skeleton from '../components/Skeleton';
import { useApiGet } from '../hooks/useApiGet';
import { usePaymentPolling } from '../hooks/usePaymentPolling';
import { useSubmit } from '../hooks/useSubmit';
import {
  createOrder,
  getOrderByCode,
  getPackages,
  getPaymentConfig,
  getPaymentStatus,
} from '../services/paymentApi';
import { hideSnap, loadSnap, openSnap } from '../utils/snap';
import './checkout.css';

const rupiahFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

function formatRupiah(value) {
  const amount = Number(value);
  return Number.isFinite(amount) ? rupiahFormatter.format(amount) : 'Rp 0';
}

function CheckoutSkeleton() {
  return (
    <div className="checkout-container" role="status" aria-label="Memuat detail pembayaran">
      <Skeleton className="checkout-skel-back" />
      <Skeleton className="checkout-skel-title" />
      <div className="checkout-grid">
        <div className="checkout-left">
          <div className="checkout-card">
            <Skeleton className="checkout-skel-line" style={{ width: '40%' }} />
            <Skeleton className="checkout-skel-method" />
          </div>
          <div className="checkout-card">
            <Skeleton className="checkout-skel-line" style={{ width: '55%' }} />
            <Skeleton className="checkout-skel-line" style={{ width: '92%' }} />
            <Skeleton className="checkout-skel-line" style={{ width: '80%' }} />
          </div>
        </div>
        <aside className="checkout-aside">
          <div className="checkout-summary">
            <Skeleton className="checkout-skel-line" style={{ width: '50%' }} />
            <Skeleton className="checkout-skel-line" style={{ width: '75%' }} />
            <Skeleton className="checkout-skel-block" />
            <Skeleton className="checkout-skel-line" style={{ width: '90%' }} />
            <Skeleton className="checkout-skel-line" style={{ width: '70%' }} />
            <Skeleton className="checkout-skel-button" />
          </div>
        </aside>
      </div>
    </div>
  );
}

export default function Checkout() {
  const { packageId } = useParams();
  const navigate = useNavigate();
  const storageKey = `typoku_pending_order_${packageId}`;
  const redirectedRef = useRef(false);
  const payingRef = useRef(false);
  const [pendingOrder, setPendingOrder] = useState(null);
  const [paymentError, setPaymentError] = useState('');
  const [paying, setPaying] = useState(false);

  const { data, error, loading, showSkeleton, reload } = useApiGet(async ({ signal }) => {
    const [packagesResponse, configResponse] = await Promise.all([
      getPackages({ signal }),
      getPaymentConfig({ signal }),
    ]);

    return {
      packages: Array.isArray(packagesResponse?.data) ? packagesResponse.data : [],
      config: configResponse?.data || {},
    };
  }, [packageId]);

  const { run: submitOrder, loading: creatingOrder } = useSubmit(createOrder);

  const { start: startPolling, stop: stopPolling } = usePaymentPolling({
    fetchStatus: getPaymentStatus,
    onPaid: (status) => redirectOnce(`/pembayaran/lunas/${status.order_code}`),
    onExpired: (status) => redirectOnce(`/pembayaran/expired/${status.order_code}`),
    onFailed: (status) => redirectOnce(`/pembayaran/expired/${status.order_code}`),
  });

  function redirectOnce(path) {
    if (redirectedRef.current) return;

    redirectedRef.current = true;
    stopPolling();
    hideSnap();
    navigate(path, { replace: true });
  }

  useEffect(() => {
    let active = true;
    const raw = sessionStorage.getItem(storageKey);

    if (!raw) {
      return undefined;
    }

    let stored;
    try {
      stored = JSON.parse(raw);
    } catch {
      sessionStorage.removeItem(storageKey);
      return undefined;
    }

    if (!stored?.orderCode) {
      sessionStorage.removeItem(storageKey);
      return undefined;
    }

    getOrderByCode(stored.orderCode)
      .then((response) => {
        if (!active) return;
        const result = response?.data;

        if (result?.can_reopen && result?.order?.status === 'pending') {
          setPendingOrder({
            order_code: result.order.order_code,
            snap_token: result.snap_token,
            client_key: result.client_key,
          });
        } else {
          sessionStorage.removeItem(storageKey);
        }
      })
      .catch(() => {
        if (active) {
          sessionStorage.removeItem(storageKey);
        }
      });

    return () => {
      active = false;
    };
  }, [storageKey]);

  const pkg = data?.packages?.find((item) => String(item.id) === String(packageId));
  const adminFee = Number(data?.config?.admin_fee);
  const resolvedAdminFee = Number.isFinite(adminFee) ? adminFee : 700;
  const packagePrice = Number(pkg?.price) || 0;
  const totalAmount = packagePrice + resolvedAdminFee;
  const features = Array.isArray(pkg?.features) ? pkg.features : [];
  const midtransIsProduction = Boolean(data?.config?.midtrans_is_production);
  const busy = creatingOrder || paying;

  async function handlePay() {
    if (!pkg || busy || payingRef.current) return;

    payingRef.current = true;
    setPaymentError('');
    redirectedRef.current = false;

    try {
      let order = pendingOrder;

      if (!order) {
        const response = await submitOrder({ packageId: pkg.id, paymentMethod: 'qris' });
        const result = response?.data;

        if (!result?.snap_token || !result?.client_key) {
          throw new Error('Token pembayaran tidak tersedia. Silakan coba lagi.');
        }

        order = {
          order_code: result.order.order_code,
          snap_token: result.snap_token,
          client_key: result.client_key,
        };

        setPendingOrder(order);
        sessionStorage.setItem(storageKey, JSON.stringify({ orderCode: order.order_code }));
      }

      await loadSnap(order.client_key, midtransIsProduction);
      setPaying(true);
      startPolling(order.order_code);

      openSnap(order.snap_token, {
        onSuccess: () => redirectOnce(`/pembayaran/lunas/${order.order_code}`),
        onPending: () => {},
        onError: () => {
          stopPolling();
          payingRef.current = false;
          setPaying(false);
          setPaymentError('Pembayaran gagal diproses. Silakan coba lagi.');
        },
        onClose: () => {
          stopPolling();
          payingRef.current = false;
          setPaying(false);
        },
      });
    } catch (payError) {
      stopPolling();
      payingRef.current = false;
      setPaying(false);
      setPaymentError(payError?.message || 'Gagal memulai pembayaran.');
    }
  }

  if (loading || showSkeleton) {
    return (
      <div className="checkout-page">
        <CheckoutSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="checkout-page">
        <div className="checkout-container">
          <div className="checkout-state" role="alert">
            <p className="checkout-state-title">Gagal memuat detail pembayaran.</p>
            <p className="checkout-state-text">
              {error?.message || 'Periksa koneksi Anda lalu coba lagi.'}
            </p>
            <button
              className="checkout-pay-button checkout-state-button"
              type="button"
              onClick={reload}
            >
              <FiRefreshCw aria-hidden="true" />
              Coba Lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!pkg) {
    return (
      <div className="checkout-page">
        <div className="checkout-container">
          <div className="checkout-state">
            <p className="checkout-state-title">Paket tidak ditemukan.</p>
            <p className="checkout-state-text">
              Paket mungkin sudah tidak aktif. Silakan pilih paket lain.
            </p>
            <Link className="checkout-pay-button checkout-state-button" to="/paket">
              Lihat Paket
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <div className="checkout-topbar">
          <div>
            <Link className="checkout-back" to="/paket">
              <FiArrowLeft aria-hidden="true" />
              Kembali ke Pilihan Paket
            </Link>
            <h1 className="checkout-title">Detail Pembayaran &amp; Aktivasi</h1>
          </div>
        </div>

        <div className="checkout-grid">
          <section className="checkout-left">
            {paymentError ? (
              <div className="checkout-alert" role="alert">
                <FiAlertCircle aria-hidden="true" />
                <span>{paymentError}</span>
              </div>
            ) : null}

            <div className="checkout-card">
              <div className="checkout-card-head">
                <h2>Metode Pembayaran</h2>
                <p>Semua kanal pembayaran diproses aman dan terverifikasi seketika.</p>
              </div>

              <div className="checkout-method checkout-method--active">
                <span className="checkout-radio" aria-hidden="true">
                  <span />
                </span>
                <span className="checkout-method-logo">QRIS</span>
                <div className="checkout-method-info">
                  <span className="checkout-method-name">QRIS (Standar Pembayaran Nasional)</span>
                  <p>
                    Pindai kode QR melalui aplikasi perbankan atau e-wallet (GoPay, OVO, DANA,
                    BCA, dll.)
                  </p>
                </div>
              </div>

              <div className="checkout-method-note">
                <span className="checkout-method-note-icon" aria-hidden="true">
                  <FiCamera />
                </span>
                <div>
                  <strong>Kode QR</strong>
                  <p>
                    Kode QRIS akan langsung ditampilkan setelah Anda menekan tombol{' '}
                    <strong>Bayar Sekarang</strong>.
                  </p>
                </div>
              </div>

              <p className="checkout-method-verify">
                <FiShield aria-hidden="true" />
                verifikasi otomatis 24 jam.
              </p>
            </div>

            <div className="checkout-card checkout-card--refund">
              <h3>
                <FiShield aria-hidden="true" />
                Kebijakan Pengembalian Dana (Refund)
              </h3>
              <p>
                Pengembalian dana dapat diajukan maksimal 7 hari setelah pesanan diterima apabila
                produk rusak atau tidak sesuai pesanan. Kirim email ke rafalrialdi71@gmail.com
                dengan nomor pesanan dan foto bukti. Setelah disetujui, dana dikembalikan ke
                metode pembayaran awal dalam 7 sampai 14 hari kerja. Produk digital yang sudah
                diunduh tidak dapat dikembalikan.
              </p>
            </div>
          </section>

          <aside className="checkout-aside">
            <div className="checkout-summary">
              <div className="checkout-summary-head">
                <h2>Ringkasan Langganan</h2>
                <span className="checkout-summary-badge">{pkg.name}</span>
              </div>

              <div className="checkout-summary-plan">
                <div>
                  <h3>TypoKu ({pkg.duration_days} Hari)</h3>
                  <p>Akses Penuh Akademisi &amp; Peneliti</p>
                </div>
                <span className="checkout-summary-plan-price">{formatRupiah(packagePrice)}</span>
              </div>

              <div className="checkout-summary-benefits">
                {features.map((feature) => (
                  <div className="checkout-summary-benefit" key={feature}>
                    <FiCheck aria-hidden="true" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <div className="checkout-summary-rows">
                <div>
                  <span>Harga Paket ({pkg.duration_days} Hari)</span>
                  <span>{formatRupiah(packagePrice)}</span>
                </div>
                <div>
                  <span>Biaya Transaksi / fee Admin</span>
                  <span>{formatRupiah(resolvedAdminFee)}</span>
                </div>
              </div>

              <div className="checkout-summary-total">
                <span>Total Pembayaran</span>
                <strong>{formatRupiah(totalAmount)}</strong>
              </div>

              <button
                className="checkout-pay-button"
                type="button"
                onClick={handlePay}
                disabled={busy}
                aria-busy={busy}
              >
                {creatingOrder
                  ? 'Membuat pesanan...'
                  : paying
                    ? 'Menunggu pembayaran...'
                    : pendingOrder
                      ? 'Lanjutkan Pembayaran'
                      : 'Bayar Sekarang'}
                {busy ? null : <FiArrowRight aria-hidden="true" />}
              </button>

              <p className="checkout-pay-note">
                Aktivasi langsung otomatis dalam 10 detik setelah pembayaran berhasil
              </p>

              {pendingOrder ? (
                <p className="checkout-order-code">
                  Kode pesanan: <strong>{pendingOrder.order_code}</strong>
                </p>
              ) : null}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
