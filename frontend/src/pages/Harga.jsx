import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiCheck, 
  FiX, 
  FiChevronDown, 
  FiChevronUp,
  FiShield,
  FiStar
} from 'react-icons/fi';
import './style.css';

// Import logo pembayaran
import qrisLogo from '../assets/qris-logo.svg';
import gopayLogo from '../assets/gopay-logo.svg';
import shopeepayLogo from '../assets/shopeepay-logo.svg';
import vaLogo from '../assets/virtual-account-logo.svg';

export default function Harga() {
  // State untuk toggle Bulanan / Tahunan
  const [isAnnual, setIsAnnual] = useState(false);

  // State untuk melacak FAQ mana yang sedang dibuka
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  // Data Dummy FAQ
  const faqs = [
    {
      question: "Metode pembayaran apa saja yang didukung?",
      answer: "Kami mendukung berbagai metode pembayaran termasuk QRIS, GoPay, OVO, ShopeePay, serta Virtual Account dari berbagai bank (BCA, Mandiri, BRI, BNI) melalui sistem pembayaran yang terenkripsi dan aman."
    },
    {
      question: "Apakah saya bisa membatalkan langganan sewaktu-waktu?",
      answer: "Tentu saja. Anda dapat membatalkan langganan kapan saja melalui halaman Pengaturan Akun. Setelah dibatalkan, Anda tetap dapat menikmati fitur Pro/Premium hingga masa aktif paket Anda berakhir pada bulan tersebut."
    },
    {
      question: "Apakah dokumen saya aman dan tidak disebarluaskan?",
      answer: "Keamanan data Anda adalah prioritas utama kami. TypoKu menggunakan enkripsi end-to-end 256-bit. Dokumen yang Anda unggah hanya diproses sementara oleh AI dan secara otomatis dihapus dari server kami setelah proses selesai."
    },
    {
      question: "Bagaimana jika kuota dokumen saya habis sebelum akhir bulan?",
      answer: "Jika kuota dokumen bulanan Anda habis, Anda dapat melakukan top-up kuota tambahan (add-on) atau melakukan upgrade ke paket yang lebih tinggi (misalnya dari Pro ke Premium) yang menawarkan kuota tak terbatas."
    }
  ];

  // Fungsi untuk handle klik pada FAQ
  const toggleFaq = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <div className="home-container">
      {/* Header Harga */}
      <section className="harga-header">
        <span className="hero-badge">Investasi Akademik Profesional Terbaik</span>
        <h1 className="hero-title" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
          Pilih Paket yang Sesuai dengan Kebutuhanmu
        </h1>
        <p className="hero-subtitle">
          Mulai gratis untuk tugas harian, upgrade ke paket Pro atau Premium kapan saja untuk kemudahan tanpa batas.
        </p>
        
        {/* Toggle Bulanan / Tahunan */}
        <div className="toggle-container">
          <button 
            className={`toggle-btn ${!isAnnual ? 'active' : ''}`}
            onClick={() => setIsAnnual(false)}
          >
            Bayar Bulanan
          </button>
          <button 
            className={`toggle-btn ${isAnnual ? 'active' : ''}`}
            onClick={() => setIsAnnual(true)}
          >
            Bayar Tahunan <span className="discount-badge">Hemat 20% (2 Bulan Gratis)</span>
          </button>
        </div>
        
        <div className="guarantee-links">
          <span><FiCheck color="#16a34a" /> Garansi Aman & Terenkripsi</span>
          <span><FiCheck color="#16a34a" /> Batalkan Kapan Saja</span>
          <span><FiCheck color="#16a34a" /> Aktivasi Instan</span>
        </div>
      </section>

      {/* Pricing Grid */}
      <section className="pricing-section">
        <div className="pricing-grid">
          {/* Paket Gratis */}
          <div className="pricing-card">
            <div className="pricing-header-row">
              <h3>Gratis</h3>
              <span className="badge-free">Dasar</span>
            </div>
            <p className="package-desc">Sempurna untuk pelajar atau mahasiswa yang butuh cek tugas sesekali.</p>
            <div className="pricing-price">Rp0 <span className="price-period">/ bulan</span></div>
            <p className="price-sub">Selamanya gratis tanpa kartu kredit</p>
            
            <ul className="pricing-features-list">
              <li><FiCheck color="#16a34a" size={18} style={{ flexShrink: 0 }} /> 3 Dokumen per bulan (maks. 5 halaman/dokumen)</li>
              <li><FiCheck color="#16a34a" size={18} style={{ flexShrink: 0 }} /> 5 Kali parafrase kalimat per hari</li>
              <li><FiCheck color="#16a34a" size={18} style={{ flexShrink: 0 }} /> Koreksi typo dasar & ejaan KBBI</li>
              <li className="disabled"><FiX color="#ef4444" size={18} style={{ flexShrink: 0 }} /> Download dokumen yang telah dirapikan (.DOCX)</li>
              <li className="disabled"><FiX color="#ef4444" size={18} style={{ flexShrink: 0 }} /> Prioritas server pemrosesan kilat</li>
            </ul>
            <Link to="/register" className="btn-pricing outline" style={{ marginTop: 'auto' }}>Pakai Saat Ini</Link>
          </div>

          {/* Paket Pro */}
          <div className="pricing-card pro">
            <div className="popular-badge">
              <FiStar style={{ marginRight: '5px' }} /> Paling Populer Pilihan Mahasiswa
            </div>
            <div className="pricing-header-row">
              <h3>Pro</h3>
              <span className="badge-pro">Rekomendasi</span>
            </div>
            <p className="package-desc">Solusi lengkap untuk mahasiswa tingkat akhir dan staf pengajar aktif.</p>
            
            {/* Logic Harga Berubah */}
            <div className="pricing-price">
              {isAnnual ? 'Rp290.000' : 'Rp29.000'} 
              <span className="price-period">{isAnnual ? ' / tahun' : ' / bulan'}</span>
            </div>
            
            <p className="price-sub" style={{ color: '#16a34a', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <FiCheck /> Jika dibatalkan kapan saja (Hanya seharga segelas kopi)
            </p>
            
            <ul className="pricing-features-list">
              <li><FiCheck color="#16a34a" size={18} style={{ flexShrink: 0 }} /> 30 Dokumen per bulan (maks. 20 halaman/dokumen)</li>
              <li><FiCheck color="#16a34a" size={18} style={{ flexShrink: 0 }} /> Parafrase kalimat tanpa batas (Gaya Akademik)</li>
              <li><FiCheck color="#16a34a" size={18} style={{ flexShrink: 0 }} /> Penerjemahan akademik tanpa batas (ID &larr;&rarr; EN)</li>
              <li><FiCheck color="#16a34a" size={18} style={{ flexShrink: 0 }} /> Deteksi typo, ejaan baku, & pembenahan mubazir</li>
              <li><FiCheck color="#16a34a" size={18} style={{ flexShrink: 0 }} /> Download dokumen langsung format .DOCX</li>
              <li><FiCheck color="#16a34a" size={18} style={{ flexShrink: 0 }} /> Pemrosesan prioritas supercepat</li>
            </ul>
            <Link to="/register" className="btn-pricing filled" style={{ marginTop: 'auto' }}>Upgrade ke Pro Sekarang</Link>
          </div>

          {/* Paket Premium */}
          <div className="pricing-card">
            <div className="pricing-header-row">
              <h3>Premium</h3>
              <span className="badge-premium">Maksimal</span>
            </div>
            <p className="package-desc">Untuk dosen, peneliti, penulis buku, dan agensi penulisan profesional.</p>
            
            {/* Logic Harga Berubah */}
            <div className="pricing-price">
               {isAnnual ? 'Rp590.000' : 'Rp59.000'} 
               <span className="price-period">{isAnnual ? ' / tahun' : ' / bulan'}</span>
            </div>
            
            <p className="price-sub">Bukan per dokumen, mulai Rp1.000-an per hari</p>
            
            <ul className="pricing-features-list">
              <li><FiCheck color="#16a34a" size={18} style={{ flexShrink: 0 }} /> Kuota dokumen tanpa batas (maks. 200 halaman/dokumen)</li>
              <li><FiCheck color="#16a34a" size={18} style={{ flexShrink: 0 }} /> Semua fitur Pro tanpa limitasi harian</li>
              <li><FiCheck color="#16a34a" size={18} style={{ flexShrink: 0 }} /> Pemadanan kata bahasa Inggris mendalam (Academic Grade)</li>
              <li><FiCheck color="#16a34a" size={18} style={{ flexShrink: 0 }} /> Integrasi Google Docs & Microsoft Word (Segera Datang)</li>
              <li><FiCheck color="#16a34a" size={18} style={{ flexShrink: 0 }} /> Dukungan customer service prioritas 24/7 via WhatsApp</li>
              <li><FiCheck color="#16a34a" size={18} style={{ flexShrink: 0 }} /> Sertifikat Orisinalitas & Proofread Report</li>
            </ul>
            <Link to="/register" className="btn-pricing outline" style={{ marginTop: 'auto', backgroundColor: '#EEF2FF', border: 'none' }}>Pilih Premium</Link>
          </div>
        </div>
      </section>

      {/* Banner Efisiensi */}
      <section style={{ padding: '0 5% 4rem' }}>
        <div className="efficiency-banner">
          <div className="efficiency-text">
            <span className="badge-eff"><FiCheck /> EFISIENSI WAKTU REVISI</span>
            <h4>Hemat hingga 14 jam pengerjaan skripsi & jurnal</h4>
            <p>Rata-rata pengguna TypoKu Pro menyelesaikan proofread naskah skripsi dalam 4 menit.</p>
          </div>
          <div className="efficiency-stats">
            <div className="eff-stat-box">
              <span className="eff-stat-num">99.4%</span>
              <span className="eff-stat-label">Akurasi KBBI & PUEBI</span>
            </div>
            <div className="eff-stat-box">
              <span className="eff-stat-num">120K+</span>
              <span className="eff-stat-label">Halaman Diperiksa</span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-section">
        <p className="faq-subtitle" style={{ textAlign: 'center', fontSize: '0.875rem', fontWeight: 'bold', color: '#4F46E5', letterSpacing: '1px', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
           METODE PEMBAYARAN RESMI & TERPERCAYA
        </p>
        
        {/* Gambar Logo Metode Pembayaran (Berwarna & Diperbesar) */}
        <div className="payment-methods" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '3rem', marginBottom: '4rem', marginTop: '1.5rem' }}>
          <img src={qrisLogo} alt="QRIS" style={{ height: '48px' }} />
          <img src={gopayLogo} alt="GoPay" style={{ height: '48px' }} />
          <img src={shopeepayLogo} alt="ShopeePay" style={{ height: '64px' }} />
          <img src={vaLogo} alt="Virtual Account" style={{ height: '56px' }} />
        </div>

        <div className="section-header">
          <span className="hero-badge" style={{ backgroundColor: 'transparent', color: '#4F46E5', padding: 0 }}>TANYA JAWAB</span>
          <h2 style={{ fontSize: '2rem', margin: '0.5rem 0' }}>Pertanyaan yang Sering Diajukan</h2>
          <p style={{ color: '#6b7280' }}>Punya pertanyaan seputar paket berlangganan? Temukan jawabannya di bawah ini.</p>
        </div>

        {/* FAQ List */}
        <div className="faq-list">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className="faq-item" 
              onClick={() => toggleFaq(index)}
              style={{ transition: 'all 0.3s ease' }}
            >
              <div className="faq-question">
                {faq.question} 
                {openFaqIndex === index ? <FiChevronUp /> : <FiChevronDown />}
              </div>
              
              {/* Tampilkan jawaban jika index cocok */}
              {openFaqIndex === index && (
                <div style={{ marginTop: '1rem', color: '#6b7280', fontSize: '0.9rem', lineHeight: '1.6', borderTop: '1px solid #f3f4f6', paddingTop: '1rem' }}>
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="campus-banner">
          <div className="campus-text">
            <div className="campus-icon">
                <FiShield />
            </div>
            <div>
              <h4 style={{ margin: '0 0 0.25rem 0' }}>Ada pertanyaan lain seputar layanan kami?</h4>
              <p style={{ margin: 0, color: '#6b7280', fontSize: '0.875rem' }}>Hubungi tim dukungan kami atau pelajari lebih lanjut mengenai sistem TypoKu.</p>
            </div>
          </div>
          <Link to="/tentang" className="btn-campus" style={{ textDecoration: 'none' }}>Hubungi TypoKu</Link>
        </div>
      </section>
    </div>
  );
}