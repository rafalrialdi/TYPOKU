import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiArrowRight, FiCheckCircle } from 'react-icons/fi';
import './home.css';

function ArrowDoodleTop() {
  return (
    <div className="home-doodle home-doodle-top" aria-hidden="true">
      <svg fill="none" viewBox="0 0 120 90" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="arrowGradTop" x1="0%" x2="100%" y1="0%" y2="100%">
            <stop offset="0%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#4F46E5" />
          </linearGradient>
          <marker id="arrowHeadTop" markerHeight="7" markerWidth="7" orient="auto" refX="5" refY="3.5">
            <polygon fill="#4F46E5" points="0 0, 7 3.5, 0 7, 1.8 3.5" />
          </marker>
        </defs>
        <circle cx="14" cy="2" fill="#6366F1" r="3.5" />
        <circle cx="14" cy="2" fill="#FFFFFF" r="1.5" />
        <path
          d="M 14 2 C -4 44, 26 74, 75 78"
          fill="none"
          markerEnd="url(#arrowHeadTop)"
          stroke="url(#arrowGradTop)"
          strokeDasharray="5 3.5"
          strokeLinecap="round"
          strokeWidth="2.2"
        />
      </svg>
    </div>
  );
}

function ArrowDoodleBottom() {
  return (
    <div className="home-doodle home-doodle-bottom" aria-hidden="true">
      <svg fill="none" viewBox="0 0 120 90" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="arrowGradBtm" x1="100%" x2="0%" y1="100%" y2="0%">
            <stop offset="0%" stopColor="#4F46E5" />
            <stop offset="100%" stopColor="#6366F1" />
          </linearGradient>
          <marker id="arrowHeadBtm" markerHeight="7" markerWidth="7" orient="auto" refX="5" refY="3.5">
            <polygon fill="#6366F1" points="0 0, 7 3.5, 0 7, 1.8 3.5" />
          </marker>
        </defs>
        <circle cx="104" cy="92" fill="#4F46E5" r="3.5" />
        <circle cx="104" cy="92" fill="#FFFFFF" r="1.5" />
        <path
          d="M 104 92 C 118 44, 68 10, 20 16"
          fill="none"
          markerEnd="url(#arrowHeadBtm)"
          stroke="url(#arrowGradBtm)"
          strokeDasharray="5 3.5"
          strokeLinecap="round"
          strokeWidth="2.2"
        />
      </svg>
    </div>
  );
}

function EditorPreview() {
  return (
    <div className="home-editor-wrap">
      <ArrowDoodleTop />
      <ArrowDoodleBottom />
      <div className="home-editor">
        <div className="home-editor-toolbar">
          <div className="home-toolbar-left">
            <span className="home-dot home-dot-error" />
            <span className="home-dot home-dot-warning" />
            <span className="home-dot home-dot-success" />
            <span className="home-editor-filename">Draf_Bab4_Skripsi_v2.docx</span>
          </div>
        </div>
        <div className="home-editor-body">
          <div className="home-editor-meta">
            <span>Modul Pemeriksaan: PUEBI 2024</span>
            <span className="home-editor-count">842 Kata</span>
          </div>
          <p>
            Berdasarkan temuan empiris di lapangan, <span className="home-emphasis">Analisis</span>{' '}
            <mark>efektifitas</mark> penerapan tata kelola digital pada unit pelayanan publik
            menunjukkan korelasi linear yang sangat signifikan terhadap indeks kepuasan masyarakat
            perkotaan.
          </p>
          <p>
            Hal ini mempertegas hipotesis awal bahwa digitalisasi birokrasi mampu mengeliminasi
            friksi birokratis secara bertahap dan terukur.
          </p>
          <div className="home-correction">
            <div className="home-correction-main">
              <FiCheckCircle />
              <div>
                <div className="home-correction-line">
                  <span className="home-correction-old">efektifitas</span>
                  <FiArrowRight className="home-correction-arrow" />
                  <span className="home-correction-new">efektivitas</span>
                </div>
                <p className="home-correction-note">
                  Sesuai KBBI &amp; kaidah penyerapan sufiks bahasa asing: <em>-iteit / -ity</em>{' '}
                  diserap menjadi <em>-itas</em>.
                </p>
              </div>
            </div>
            <button type="button" className="home-correction-apply">
              Terapkan
            </button>
          </div>
        </div>
        <div className="home-editor-footer">
          <div className="home-editor-status">
            <span className="home-status-dot" />
            <span>Pemeriksaan aktif</span>
          </div>
          <div className="home-editor-footer-right">
            <span>1 Isu Ditemukan</span>
            <span className="home-editor-resolve">Selesaikan Semua</span>
          </div>
        </div>
      </div>
      <div className="home-editor-tile home-editor-tile-top" aria-hidden="true" />
      <div className="home-editor-tile" aria-hidden="true" />
    </div>
  );
}

export default function Home() {
  const { hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      return;
    }

    const target = document.getElementById(hash.slice(1));
    if (target) {
      requestAnimationFrame(() => {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  }, [hash]);

  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="home-hero-glow" aria-hidden="true" />
        <div className="home-container">
          <div className="home-hero-grid">
            <div className="home-hero-copy">
              <h1>
                <span>Tulisan Akademik Bebas</span>
                <span>Typo, Lebih Percaya Diri</span>
              </h1>
              <p className="home-lead">
                Asisten penulisan akademik berbasis AI terstandarisasi PUEBI &amp; KBBI. Deteksi
                salah ketik, perbaiki struktur kalimat, parafrase ilmiah, dan terjemahan jurnal
                tanpa mengubah esensi riset Anda.
              </p>
              <div className="home-actions">
                <Link className="home-button home-button-primary" to="/cek-typo">
                  Mulai Sekarang
                </Link>
                <a className="home-button home-button-secondary" href="#paket">
                  Lihat Paket
                  <FiArrowRight />
                </a>
              </div>
            </div>
            <EditorPreview />
          </div>
        </div>
      </section>

      <section className="home-pricing" id="paket">
        <div className="home-container">
          <div className="home-pricing-card">
            <div className="home-pricing-grid">
              <div className="home-pricing-copy">
                <h2>Akses Penuh Tanpa Membebani Uang Saku Riset</h2>
                <p>
                  Mulai dari pemeriksaan skripsi harian hingga asistensi manuskrip jurnal
                  internasional, nikmati fitur komprehensif tanpa batasan kosa kata.
                </p>
              </div>
              <div className="home-pricing-panel">
                <span className="home-pricing-label">Paket Pelajar &amp; Peneliti</span>
                <div className="home-pricing-amount">
                  <span className="home-pricing-from">Mulai</span>
                  <strong>Rp 3.000</strong>
                  <span className="home-pricing-period">/ Hari</span>
                </div>
                <p className="home-pricing-note">
                  Tersedia juga paket perbulan dengan masa yang sangat lama dan biaya yang
                  terjangkau relativ murah
                </p>
                <Link className="home-pricing-button" to="/paket">
                  Bandingkan Semua Paket
                  <FiArrowRight />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
