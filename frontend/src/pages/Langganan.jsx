import { useState } from 'react';
import { 
  FiCheckCircle, 
  FiShield, 
  FiLock, 
  FiTag, 
  FiCreditCard, 
  FiInfo,
  FiArrowRight,
  FiTrash2,
  FiStar,
  FiCheck
} from 'react-icons/fi';
import './dashboard.css';

import qrisLogo from '../assets/qris-logo.svg';
import vaLogo from '../assets/virtual-account-logo.svg';

export default function Langganan() {
  const [step, setStep] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState('pro');
  const [billingCycle, setBillingCycle] = useState('bulanan');
  const [paymentMethod, setPaymentMethod] = useState('qris');
  const [promoCode, setPromoCode] = useState('DISKONMHS');

  // Harga & Detail Paket
  const planPricing = {
    pro: { bulanan: 29000, tahunan: 290000 },
    premium: { bulanan: 59000, tahunan: 590000 }
  };

  const planDetails = {
    pro: {
      title: 'TypoKu Pro',
      subtitle: 'Pilihan Utama Mahasiswa & Dosen',
      features: [
        '30 Dokumen / bulan (Maks. 50 halaman)',
        'Parafrase kalimat tanpa batas (Gaya Akademik)',
        'Penerjemah akademik tak terbatas (ID → EN)',
        'Deteksi ejaan baku KBBI VI & pembenahan',
        'Export dokumen .DOCX dengan pelacakan revisi',
        'Pemrosesan server prioritas tinggi'
      ]
    },
    premium: {
      title: 'TypoKu Premium',
      subtitle: 'Maksimal untuk Peneliti & Agensi',
      features: [
        'Kuota dokumen TANPA BATAS',
        'Semua fitur Pro tanpa limitasi harian',
        'Pemadanan Inggris Academic Grade',
        'Integrasi G-Docs & Word (Segera)',
        'Dukungan CS Prioritas 24/7',
        'Sertifikat Orisinalitas & Proofread'
      ]
    }
  };

  const basePrice = planPricing[selectedPlan][billingCycle];
  const discount = promoCode === 'DISKONMHS' ? 5000 : 0;
  const total = basePrice - discount;

  const handleNext = () => setStep(2);
  const handleBack = () => setStep(1);

  return (
    <div className="langganan-container">
      
      {/* Stepper Progress */}
      <div className="checkout-stepper">
        <div className={`stepper-item ${step > 1 ? 'completed' : 'active'}`}>
          {step > 1 ? <FiCheckCircle size={18} /> : <div className="step-circle">1</div>}
          <span>1. Pilih Paket</span>
        </div>
        <div className="stepper-divider"></div>
        <div className={`stepper-item ${step === 2 ? 'active' : 'disabled'}`}>
          <div className="step-circle">2</div>
          <span>Konfirmasi & Pembayaran {step === 2 && <small>Langkah Terakhir</small>}</span>
        </div>
        <div className="stepper-divider"></div>
        <div className="stepper-item disabled">
          <div className="step-circle">3</div>
          <span>Aktivasi Instan</span>
        </div>
        
        <div className="stepper-badges">
          <span><FiLock /> Enkripsi SSL 256-bit</span>
          <span><FiShield /> Garansi 7 Hari</span>
        </div>
      </div>

      {/* TAHAP 1: PILIH PAKET */}
      {step === 1 && (
        <div className="step-1-container">
          <div className="plan-header">
            <h2>Pilih Paket Langganan</h2>
            <p>Tingkatkan batas kuota dan dapatkan akses ke fitur AI tingkat lanjut.</p>
            
            <div className="billing-toggle" style={{ maxWidth: '400px', margin: '1.5rem auto' }}>
              <button 
                className={`toggle-btn ${billingCycle === 'bulanan' ? 'active' : ''}`}
                onClick={() => setBillingCycle('bulanan')}
              >
                Bayar Bulanan
              </button>
              <button 
                className={`toggle-btn ${billingCycle === 'tahunan' ? 'active' : ''}`}
                onClick={() => setBillingCycle('tahunan')}
              >
                Bayar Tahunan <span className="discount-tag">Hemat 20%</span>
              </button>
            </div>
          </div>

          <div className="plan-selection-grid">
            {/* Kartu Pro */}
            <div 
              className={`plan-card ${selectedPlan === 'pro' ? 'selected' : ''}`}
              onClick={() => setSelectedPlan('pro')}
            >
              {selectedPlan === 'pro' && <div className="plan-selected-badge"><FiCheckCircle /> Dipilih</div>}
              <div className="plan-card-header">
                <h3>{planDetails.pro.title}</h3>
                <span className="badge-popular"><FiStar style={{marginRight:'4px'}}/> Populer</span>
              </div>
              <div className="plan-price">
                Rp{planPricing.pro[billingCycle].toLocaleString('id-ID')}
                <span className="period">/{billingCycle === 'bulanan' ? 'bulan' : 'tahun'}</span>
              </div>
              <p className="plan-desc">{planDetails.pro.subtitle}</p>
              <ul className="plan-features">
                <li><FiCheck /> 30 Dokumen / bulan</li>
                <li><FiCheck /> Parafrase tanpa batas</li>
                <li><FiCheck /> Export dokumen .DOCX</li>
                <li><FiCheck /> Pemrosesan prioritas</li>
              </ul>
            </div>

            {/* Kartu Premium */}
            <div 
              className={`plan-card ${selectedPlan === 'premium' ? 'selected' : ''}`}
              onClick={() => setSelectedPlan('premium')}
            >
              {selectedPlan === 'premium' && <div className="plan-selected-badge"><FiCheckCircle /> Dipilih</div>}
              <div className="plan-card-header">
                <h3>{planDetails.premium.title}</h3>
                <span className="badge-premium" style={{backgroundColor: '#fef3c7', color: '#d97706', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 'bold'}}>Maksimal</span>
              </div>
              <div className="plan-price">
                Rp{planPricing.premium[billingCycle].toLocaleString('id-ID')}
                <span className="period">/{billingCycle === 'bulanan' ? 'bulan' : 'tahun'}</span>
              </div>
              <p className="plan-desc">{planDetails.premium.subtitle}</p>
              <ul className="plan-features">
                <li><FiCheck /> Kuota dokumen TANPA BATAS</li>
                <li><FiCheck /> Academic Grade Paraphrasing</li>
                <li><FiCheck /> Integrasi G-Docs & Word</li>
                <li><FiCheck /> Sertifikat Orisinalitas</li>
              </ul>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
            <button className="btn-pay-now" style={{ maxWidth: '300px', margin: '0 auto' }} onClick={handleNext}>
              Lanjutkan ke Pembayaran <FiArrowRight />
            </button>
          </div>
        </div>
      )}

      {/* TAHAP 2: CHECKOUT / PEMBAYARAN */}
      {step === 2 && (
        <div className="checkout-grid">
          
          {/* KOLOM KIRI: Ringkasan Pesanan */}
          <div className="checkout-left">
            <div className="checkout-card summary-card">
              <div className="summary-header">
                <span className="summary-label">RINGKASAN PESANAN</span>
                {selectedPlan === 'pro' && <span className="badge-popular">Paling Populer</span>}
              </div>
              
              <h3 className="summary-title">{planDetails[selectedPlan].title}</h3>
              <p className="summary-subtitle">{planDetails[selectedPlan].subtitle}</p>

              <div className="billing-toggle">
                <button 
                  className={`toggle-btn ${billingCycle === 'bulanan' ? 'active' : ''}`}
                  onClick={() => setBillingCycle('bulanan')}
                >
                  Bulanan
                </button>
                <button 
                  className={`toggle-btn ${billingCycle === 'tahunan' ? 'active' : ''}`}
                  onClick={() => setBillingCycle('tahunan')}
                >
                  Tahunan <span className="discount-tag">Hemat 20%</span>
                </button>
              </div>

              <div className="summary-features">
                <p className="feature-label">FITUR TERMASUK DALAM PAKET:</p>
                <ul>
                  {planDetails[selectedPlan].features.map((feat, idx) => (
                    <li key={idx}><FiCheckCircle className="icon-check" /> {feat}</li>
                  ))}
                </ul>
              </div>

              <div className="promo-section">
                <p className="promo-label">Voucher / Kode Promo</p>
                <div className="promo-input-group">
                  <div className="promo-input-wrapper">
                    <FiTag className="promo-icon" />
                    <input type="text" value={promoCode} readOnly className="promo-input" />
                  </div>
                  <button className="btn-apply-promo">Terapkan</button>
                </div>
                {promoCode && (
                  <div className="active-promo-tag">
                    <span className="promo-success"><FiCheckCircle /> KUPON: {promoCode} (-Rp5.000)</span>
                    <button className="btn-remove-promo" onClick={() => setPromoCode('')}><FiTrash2 /> Hapus</button>
                  </div>
                )}
              </div>

              <div className="price-calculation">
                <div className="price-row">
                  <span>Harga Paket ({billingCycle === 'bulanan' ? '1 Bulan' : '1 Tahun'})</span>
                  <span>Rp{basePrice.toLocaleString('id-ID')}</span>
                </div>
                {discount > 0 && (
                  <div className="price-row text-green">
                    <span>Diskon Kupon <FiCheckCircle size={14} /></span>
                    <span>-Rp{discount.toLocaleString('id-ID')}</span>
                  </div>
                )}
                <div className="price-row text-blue">
                  <span>Biaya Layanan & PPN <span className="badge-promo">0% Promo</span></span>
                  <span>Gratis</span>
                </div>
              </div>

              <div className="total-section">
                <div className="total-text">
                  <span className="total-label">TOTAL PEMBAYARAN</span>
                  <span className="total-sub">Perpanjangan otomatis per {billingCycle}</span>
                </div>
                <div className="total-price-box">
                  <span className="total-price">Rp{total.toLocaleString('id-ID')}</span>
                  {discount > 0 && <span className="total-strike">Rp{basePrice.toLocaleString('id-ID')}</span>}
                </div>
              </div>

              <div className="guarantee-box">
                <FiShield className="guarantee-icon" />
                <p><strong>Jaminan Kepuasan 100%:</strong> Ajukan pengembalian dana penuh dalam 7 hari jika TypoKu tidak membantu produktivitas Anda.</p>
              </div>
            </div>
          </div>

          {/* KOLOM KANAN: Data Pelanggan & Pembayaran */}
          <div className="checkout-right">
            
            {/* Section 1: Data Pelanggan (Aprima) */}
            <div className="checkout-card step-card">
              <div className="step-header">
                <div className="step-title">
                  <div className="step-number">1</div>
                  <h3>Data Pelanggan</h3>
                </div>
                <button className="btn-edit-text">Ubah</button>
              </div>
              
              <div className="customer-data-box">
                <div className="customer-avatar">AS</div>
                <div className="customer-info">
                  <h4>Aprima Sunjani <span className="badge-verified"><FiCheckCircle /> Akun Mahasiswa Terverifikasi</span></h4>
                  <p>aprima.sunjani@student.unpam.ac.id • +62 812-XXXX-XXXX</p>
                </div>
                <div className="customer-status">
                  <span className="status-active"><FiCheckCircle /> Status Aktif</span>
                  <span className="status-id">ID: TYPO-90281</span>
                </div>
              </div>
            </div>

            {/* Section 2: Metode Pembayaran */}
            <div className="checkout-card step-card">
              <div className="step-header">
                <div className="step-title">
                  <div className="step-number">2</div>
                  <h3>Pilih Metode Pembayaran</h3>
                </div>
                <span className="auto-verify-text"><FiCheckCircle /> Verifikasi Otomatis</span>
              </div>

              <div className="payment-methods-list">
                {/* Opsi QRIS */}
                <label className={`payment-option ${paymentMethod === 'qris' ? 'selected' : ''}`}>
                  <div className="payment-option-header">
                    <div className="payment-radio-group">
                      <input 
                        type="radio" 
                        name="payment" 
                        value="qris" 
                        checked={paymentMethod === 'qris'}
                        onChange={() => setPaymentMethod('qris')} 
                      />
                      <div>
                        <span className="payment-name">QRIS (GoPay, OVO, ShopeePay, Dana)</span>
                        <span className="badge-free-admin">Bebas Admin • Rekomendasi</span>
                      </div>
                    </div>
                    <img src={qrisLogo} alt="QRIS" className="payment-logo" />
                  </div>
                  
                  {paymentMethod === 'qris' && (
                    <div className="payment-expanded-content">
                      <p>Pindai instan menggunakan kamera perbankan BCA Mobile, Livin Mandiri, BRImo, atau dompet digital apa pun.</p>
                      <div className="qris-info-box">
                        <FiInfo color="#4F46E5" size={20} />
                        <span>Kode QR dinamis resmi ASPI / Bank Indonesia akan langsung tampil di layar setelah klik Bayar Sekarang.</span>
                      </div>
                    </div>
                  )}
                </label>

                {/* Opsi Virtual Account */}
                <label className={`payment-option ${paymentMethod === 'va' ? 'selected' : ''}`}>
                  <div className="payment-option-header">
                    <div className="payment-radio-group">
                      <input 
                        type="radio" 
                        name="payment" 
                        value="va" 
                        checked={paymentMethod === 'va'}
                        onChange={() => setPaymentMethod('va')} 
                      />
                      <span className="payment-name">Virtual Account Bank <span className="payment-sub">BCA, Mandiri, BNI, BRI</span></span>
                    </div>
                    <img src={vaLogo} alt="VA" className="payment-logo va-logo" />
                  </div>
                </label>

                {/* Opsi Kartu Kredit */}
                <label className={`payment-option ${paymentMethod === 'card' ? 'selected' : ''}`}>
                  <div className="payment-option-header">
                    <div className="payment-radio-group">
                      <input 
                        type="radio" 
                        name="payment" 
                        value="card" 
                        checked={paymentMethod === 'card'}
                        onChange={() => setPaymentMethod('card')} 
                      />
                      <span className="payment-name">Kartu Kredit / Debit Online <span className="payment-sub badge-3d">3D Secure</span></span>
                    </div>
                    <FiCreditCard size={24} color="#9ca3af" />
                  </div>
                </label>
              </div>

              <div className="agreement-section">
                <label className="checkbox-agreement">
                  <input type="checkbox" defaultChecked />
                  <span>
                    Saya menyetujui Ketentuan Layanan Berlangganan TypoKu dan kebijakan privasi. 
                    Saya memahami bahwa langganan diperbarui otomatis setiap periode, 
                    dan saya dapat membatalkannya kapan pun tanpa syarat lewat menu Pengaturan Akun.
                  </span>
                </label>
              </div>

              <button className="btn-pay-now">
                <FiLock /> Bayar Sekarang • Rp{total.toLocaleString('id-ID')} <FiArrowRight />
              </button>
              
              <div className="secure-footer-links">
                <span onClick={handleBack} style={{cursor: 'pointer', color: '#4F46E5', fontWeight: '500'}}>&larr; Kembali ke Pilihan Paket</span>
                <span className="secure-text"><FiShield /> Transaksi Terenkripsi End-to-End</span>
              </div>
            </div>

            <div className="trust-badges-bottom">
              <span>Standar BI / ASPI</span>
              <span>PCI-DSS Level 1 Compliant</span>
              <span>ISO/IEC 27001 Certified</span>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}