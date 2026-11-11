import { useNavigate } from 'react-router-dom';
import { FiCheckCircle } from 'react-icons/fi';
import Skeleton from '../components/Skeleton';
import { usePackages } from '../hooks/usePackages';
import './paket.css';

const EYEBROW_BY_CODE = {
  CEPAT: 'Mahasiswa Baru',
  PRO: 'Skripsi & Peneliti',
  PRO_PLUS: 'Institusi & Kelompok Riset',
};

const ACTION_BY_CODE = {
  CEPAT: 'Pilih Paket Standar',
  PRO: 'Pilih Paket Pro',
  PRO_PLUS: 'Pilih Paket Plus Pro',
};

const rupiahFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

function formatRupiah(value) {
  const amount = Number(value);
  return Number.isFinite(amount) ? rupiahFormatter.format(amount) : 'Rp 0';
}

function SectionGlow() {
  return (
    <>
      <div className="paket-glow paket-glow--left" aria-hidden="true" />
      <div className="paket-glow paket-glow--right" aria-hidden="true" />
    </>
  );
}

export function PaketSkeleton() {
  return (
    <div className="paket-page paket-page--compact">
      <SectionGlow />
      <div className="paket-container">
        <h1 className="paket-heading">
          Pilihan Paket yang Fleksibel untuk Setiap Tahap Akademik Anda
        </h1>
        <div className="paket-grid" role="status" aria-label="Memuat daftar paket">
          {[0, 1, 2].map((item) => (
            <div className="paket-card paket-card--skeleton" key={item}>
              <div>
                <Skeleton className="paket-skel-eyebrow" />
                <Skeleton className="paket-skel-title" />
                <Skeleton className="paket-skel-desc" />
                <Skeleton className="paket-skel-price" />
                <div className="paket-skel-divider" />
                <Skeleton className="paket-skel-subtitle" />
                <div className="paket-skel-list">
                  <Skeleton className="paket-skel-feature" />
                  <Skeleton className="paket-skel-feature" />
                  <Skeleton className="paket-skel-feature" />
                </div>
              </div>
              <Skeleton className="paket-skel-button" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Paket() {
  const navigate = useNavigate();
  const { data: packages } = usePackages();

  return (
    <div className="paket-page paket-page--compact">
      <SectionGlow />
      <div className="paket-container">
        <h1 className="paket-heading">
          Pilihan Paket yang Fleksibel untuk Setiap Tahap Akademik Anda
        </h1>

        {packages?.length ? (
          <div className="paket-grid">
            {packages.map((pkg) => {
              const featured = Boolean(pkg.is_recommended);
              const code = pkg.package_code;
              const features = Array.isArray(pkg.features) ? pkg.features : [];

              return (
                <article
                  className={`paket-card${featured ? ' paket-card--featured' : ''}`}
                  key={pkg.id}
                  role="link"
                  tabIndex={0}
                  onClick={() => navigate(`/checkout/${pkg.id}`)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      navigate(`/checkout/${pkg.id}`);
                    }
                  }}
                >
                  <div className="paket-card-body">
                    <span
                      className={`paket-card-eyebrow${featured ? ' paket-card-eyebrow--primary' : ''}`}
                    >
                      {EYEBROW_BY_CODE[code] || 'Paket Langganan'}
                    </span>

                    <div className="paket-card-title-row">
                      <h2 className="paket-card-title">{pkg.name}</h2>
                      {featured ? <span className="paket-badge">Disarankan</span> : null}
                    </div>

                    <p className="paket-card-desc">{pkg.description}</p>

                    <div
                      className={`paket-card-price${featured ? ' paket-card-price--primary' : ''}`}
                    >
                      <strong>{formatRupiah(pkg.price)}</strong>
                      <span className="paket-card-period">{pkg.billing_label}</span>
                    </div>

                    {featured ? (
                      <p className="paket-card-billing-note">
                        Ditagihkan tahunan Rp 468.000/tahun (Hemat 25%)
                      </p>
                    ) : null}

                    <div
                      className={`paket-card-divider${featured ? ' paket-card-divider--primary' : ''}`}
                    />

                    <p className="paket-card-subtitle">
                      {featured
                        ? 'Semua Fitur Gratis, Ditambah:'
                        : code === 'PRO_PLUS'
                          ? 'Semua Fitur Pro, Ditambah:'
                          : 'Fasilitas Termasuk:'}
                    </p>

                    <ul className="paket-card-features">
                      {features.map((feature) => (
                        <li className="paket-card-feature" key={feature}>
                          <FiCheckCircle aria-hidden="true" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="paket-card-action">
                    <span
                      className={`paket-button${featured ? ' paket-button--primary' : ''}`}
                    >
                      {ACTION_BY_CODE[code] || 'Pilih Paket'}
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="paket-state">
            <p className="paket-state-title">Belum ada paket aktif.</p>
            <p className="paket-state-text">Silakan kembali lagi nanti.</p>
          </div>
        )}
      </div>
    </div>
  );
}
