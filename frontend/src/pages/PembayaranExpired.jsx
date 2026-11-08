import { Link, Navigate, useParams } from 'react-router-dom';
import { FiMail, FiRefreshCw } from 'react-icons/fi';
import Skeleton from '../components/Skeleton';
import { usePaymentStatus } from '../hooks/usePaymentStatus';
import './payment.css';

export function ExpiredSkeleton() {
  return (
    <div className="payment-page">
      <div className="payment-container" role="status" aria-label="Memuat status pembayaran">
        <div className="payment-card">
          <Skeleton className="payment-skel-badge" />
          <Skeleton className="payment-skel-title" />
          <Skeleton className="payment-skel-text" />
          <Skeleton className="payment-skel-block" />
          <Skeleton className="payment-skel-button" />
        </div>
      </div>
    </div>
  );
}

export default function PembayaranExpired() {
  const { orderCode } = useParams();
  const { data: order } = usePaymentStatus(orderCode);

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
    <div className="payment-page payment-page--expired">
      <div className="payment-container payment-container--expired">
        <div className="payment-card payment-card--expired">
          <div className="payment-expired-copy">
            <h1 className="payment-title">Waktu Pembayaran Berakhir</h1>
            <p className="payment-text">
              Nomor tagihan ini telah kedaluwarsa dan dinonaktifkan secara otomatis. Transaksi tidak
              dapat diproses lagi melalui kode pembayaran sebelumnya.
            </p>
          </div>

          <dl className="payment-expired-summary">
            <div>
              <dt>Paket Layanan</dt>
              <dd>
                {order.package_name}
                {order.duration_days ? ` (${order.duration_days} Hari)` : ''}
              </dd>
            </div>
            <div>
              <dt>Metode Pembayaran</dt>
              <dd>Gateway Otomatis ({(order.payment_method || 'qris').toUpperCase()})</dd>
            </div>
            <div>
              <dt>Status Transaksi</dt>
              <dd className="payment-expired-status">{order.status}</dd>
            </div>
          </dl>

          <Link className="payment-button" to="/paket">
            <FiRefreshCw aria-hidden="true" />
            Lihat &amp; Pilih Paket Baru
          </Link>

          <Link className="payment-expired-home" to="/">
            Kembali ke Beranda
          </Link>

          <p className="payment-help payment-help--box">
            <FiMail aria-hidden="true" />
            Jika saldo Anda sempat terpotong saat masa berlaku berakhir, silakan hubungi tim bantuan
            TypoKu untuk proses verifikasi dan aktivasi manual.
          </p>
        </div>
      </div>
    </div>
  );
}
