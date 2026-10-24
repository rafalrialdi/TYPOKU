import { Link } from 'react-router-dom';
import { FiCheck, FiEdit3, FiRefreshCw, FiGlobe, FiStar } from 'react-icons/fi';
import womanLibrary from '../assets/woman-library.jpeg';
import './style.css';

export default function Home() {
  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <span className="hero-badge">✨ TypoKu AI Workspace ENGINE V3.4</span>
        <h1 className="hero-title">Tulisan Lebih Rapi,<br />Tanpa Ribet.</h1>
        <p className="hero-subtitle">
          Perbaiki ejaan, parafrase kalimat, dan terjemahkan teks jurnal seketika 
          dengan AI yang dilatih khusus dengan standar PUEBI dan KBBI VI.
        </p>
        
        {/* Mockup Sederhana */}
        <div className="hero-mockup">
          <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ef4444' }}></div>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#eab308' }}></div>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#22c55e' }}></div>
          </div>
          <div style={{ display: 'flex', gap: '2rem' }}>
            <div style={{ flex: 2 }}>
              <h4 style={{ margin: '0 0 1rem 0' }}>📄 Teks Asli</h4>
              <p style={{ color: '#4b5563', lineHeight: '1.6' }}>
                Machine learning di gunakan untuk menganalisa data dalm jumlah besar sehinga mampu menemukan pola yang sulit di deteksi manusia.
              </p>
            </div>
            <div style={{ flex: 1, backgroundColor: '#f9fafb', padding: '1rem', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#166534', backgroundColor: '#dcfce7', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>4 Kesalahan Ditemukan</span>
              <ul style={{ paddingLeft: '1.25rem', marginTop: '1rem', color: '#ef4444', fontSize: '0.875rem' }}>
                <li>di gunakan &rarr; digunakan</li>
                <li>menganalisa &rarr; menganalisis</li>
                <li>dalm &rarr; dalam</li>
                <li>sehinga &rarr; sehingga</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stat-card">
          <div className="stat-number">2.4M+</div>
          <div className="stat-label">Kata Dikoreksi Hari Ini</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">99.8%</div>
          <div className="stat-label">Akurasi EYD V</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">140+</div>
          <div className="stat-label">Kampus di Indonesia</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">4.9/5</div>
          <div className="stat-label">Rating Pengguna</div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section" id="fitur">
        <div className="section-header">
          <h2 style={{ fontSize: '2rem', margin: 0 }}>Semua yang Kamu Butuhkan untuk<br />Memperbaiki Tulisan</h2>
          <p style={{ color: '#6b7280', marginTop: '1rem' }}>Satu platform, beragam alat cerdas untuk meningkatkan kualitas naskah akademikmu.</p>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon" style={{ backgroundColor: '#e0e7ff', color: '#4F46E5' }}>
              <FiEdit3 />
            </div>
            <h3>Koreksi Typo & Ejaan</h3>
            <p style={{ color: '#6b7280', fontSize: '0.95rem', lineHeight: '1.6' }}>Pemeriksaan instan menggunakan standar KBBI VI dan PUEBI terbaru. Deteksi pemborosan kata dan imbuhan yang keliru.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon" style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}>
              <FiRefreshCw />
            </div>
            <h3>Parafrase Kalimat Cerdas</h3>
            <p style={{ color: '#6b7280', fontSize: '0.95rem', lineHeight: '1.6' }}>Ubah struktur kalimat menjadi lebih akademis atau ringkas tanpa mengubah esensi makna aslinya.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
              <FiGlobe />
            </div>
            <h3>Penerjemah Bahasa Jurnal</h3>
            <p style={{ color: '#6b7280', fontSize: '0.95rem', lineHeight: '1.6' }}>Terjemahan akurat dengan terminologi akademik yang sesuai untuk publikasi IEEE, Scopus, dan APA 7.</p>
          </div>
        </div>
      </section>

      {/* Highlight Section */}
      <section className="highlight-section" id="cara-kerja">
        <div className="highlight-content">
          <span className="highlight-badge">KUALITAS AKADEMIK</span>
          <h2 style={{ fontSize: '2.5rem', lineHeight: '1.2', margin: '0.5rem 0 1rem 0' }}>Dirancang Berdasarkan Standar Dosen & Reviewer Jurnal</h2>
          <p style={{ color: '#6b7280', fontSize: '1.1rem', lineHeight: '1.6' }}>
            Bukan sekadar perbaikan kata. Model AI kami dilatih dari puluhan ribu dataset jurnal terindeks SINTA untuk memahami konteks ilmiah dan gaya selingkung universitas.
          </p>
          <ul className="highlight-list">
            <li><FiCheck color="#4F46E5" size={24} /> Menjaga formalitas kalimat pasif akademik.</li>
            <li><FiCheck color="#4F46E5" size={24} /> Sinkronisasi lemma mutakhir Badan Bahasa.</li>
            <li><FiCheck color="#4F46E5" size={24} /> Enkripsi end-to-end 256-bit (Dokumen 100% aman).</li>
          </ul>
        </div>
        <div className="highlight-image-container">
          <img src={womanLibrary} alt="Mahasiswi di Perpustakaan" className="highlight-image" />
        </div>
      </section>

      {/* Pricing Section */}
      <section className="pricing-section" id="harga">
        <div className="section-header">
          <h2 style={{ fontSize: '2rem', margin: 0 }}>Paket Fleksibel untuk Setiap Kebutuhan</h2>
          <p style={{ color: '#6b7280', marginTop: '1rem' }}>Mulai gratis atau gunakan paket Pro untuk fitur tanpa batas.</p>
        </div>
        <div className="pricing-grid">
          {/* Card Gratis */}
          <div className="pricing-card">
            <h3>Gratis</h3>
            <div className="pricing-price">Rp0 <span style={{ fontSize: '1rem', color: '#6b7280', fontWeight: 'normal' }}>/ bulan</span></div>
            <ul className="pricing-features">
              <li><FiCheck color="#4F46E5" /> 3 dokumen per bulan</li>
              <li><FiCheck color="#4F46E5" /> 5 kali parafrase per hari</li>
              <li><FiCheck color="#4F46E5" /> Koreksi dasar & ejaan KBBI</li>
            </ul>
            <Link to="/register" className="btn-pricing outline">Pilih Gratis</Link>
          </div>

          {/* Card Pro (Tengah) */}
          <div className="pricing-card pro">
            <div style={{ position: 'absolute', top: '-15px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#4F46E5', color: '#fff', padding: '0.25rem 1rem', borderRadius: '999px', fontSize: '0.875rem', fontWeight: 'bold' }}>
              Paling Populer
            </div>
            <h3>Pro</h3>
            <div className="pricing-price">Rp29.000 <span style={{ fontSize: '1rem', color: '#6b7280', fontWeight: 'normal' }}>/ bulan</span></div>
            <ul className="pricing-features">
              <li><FiCheck color="#4F46E5" /> 30 dokumen per bulan</li>
              <li><FiCheck color="#4F46E5" /> Parafrase tanpa batas</li>
              <li><FiCheck color="#4F46E5" /> Terjemahan bahasa akademik</li>
              <li><FiCheck color="#4F46E5" /> Deteksi kalimat pemborosan</li>
            </ul>
            <Link to="/register" className="btn-pricing filled">Upgrade ke Pro</Link>
          </div>

          {/* Card Premium */}
          <div className="pricing-card">
            <h3>Premium</h3>
            <div className="pricing-price">Rp59.000 <span style={{ fontSize: '1rem', color: '#6b7280', fontWeight: 'normal' }}>/ bulan</span></div>
            <ul className="pricing-features">
              <li><FiCheck color="#4F46E5" /> Kuota dokumen tak terbatas</li>
              <li><FiCheck color="#4F46E5" /> Semua fitur Pro tanpa batas</li>
              <li><FiCheck color="#4F46E5" /> Prioritas proses antrean</li>
              <li><FiCheck color="#4F46E5" /> Integrasi Microsoft Word</li>
            </ul>
            <Link to="/register" className="btn-pricing outline">Pilih Premium</Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-box">
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', marginTop: 0 }}>Siap Membuat Tulisanmu Lebih Memukau Hari Ini?</h2>
          <p style={{ fontSize: '1.125rem', opacity: '0.9', maxWidth: '700px', margin: '0 auto' }}>
            Bergabung dengan puluhan ribu mahasiswa dan dosen yang telah mempercepat penyelesaian naskah revisi mereka menggunakan TypoKu.
          </p>
          <Link to="/register" className="cta-btn">Mulai Gratis Sekarang</Link>
        </div>
      </section>
    </div>
  );
}