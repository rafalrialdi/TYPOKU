import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiChevronRight, FiCheckCircle, FiShield } from 'react-icons/fi';
import logoImg from '../assets/logo.svg';
import './style.css';

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();
    navigate('/login');
  };

  return (
    <div className="auth-box" style={{ padding: '2rem 0' }}>
      {/* Header Luar Kartu */}
      <div className="auth-logo-header">
        <img src={logoImg} alt="TypoKu" style={{ height: '36px' }} />
      </div>

      <div className="auth-card-inner">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', fontWeight: 'bold', color: '#4F46E5', backgroundColor: '#EEF2FF', padding: '0.25rem 0.75rem', borderRadius: '999px', marginBottom: '1rem' }}>
            MULAI GRATIS 7 HARI
          </span>
          <h2 className="auth-title" style={{ justifyContent: 'center' }}>Buat Akun TypoKu</h2>
          <p className="auth-subtitle" style={{ margin: 0 }}>Tingkatkan kualitas tulisan akademik dan tugasmu dengan bantuan AI cerdas.</p>
        </div>

        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label className="form-label">Nama Lengkap <span>Wajib</span></label>
            <div className="input-wrapper">
              <FiUser className="input-icon-left" />
              <input type="text" className="form-input" placeholder="Contoh: Prima Ananda" required />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Kampus / Pribadi <span>Verifikasi instan</span></label>
            <div className="input-wrapper">
              <FiMail className="input-icon-left" />
              <input type="email" className="form-input" placeholder="nama@universitas.ac.id atau email@domain.com" required />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Kata Sandi</label>
            <div className="input-wrapper">
              <FiLock className="input-icon-left" />
              <input type={showPassword ? "text" : "password"} className="form-input" placeholder="Masukkan kata sandi baru" required />
              {showPassword ? (
                <FiEyeOff className="input-icon-right" onClick={() => setShowPassword(false)} />
              ) : (
                <FiEye className="input-icon-right" onClick={() => setShowPassword(true)} />
              )}
            </div>
            
            {/* Indikator Keamanan */}
            <div className="pwd-strength-container">
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                <span>Kekuatan Kata Sandi</span>
                <span>Belum terisi</span>
              </div>
              <div className="pwd-bars">
                <div className="pwd-bar"></div>
                <div className="pwd-bar"></div>
                <div className="pwd-bar"></div>
              </div>
              <div className="pwd-reqs">
                <span className="pwd-req"><span style={{ border: '1px solid #d1d5db', borderRadius: '50%', width: '12px', height: '12px', display: 'inline-block' }}></span> Min. 8 karakter</span>
                <span className="pwd-req"><span style={{ border: '1px solid #d1d5db', borderRadius: '50%', width: '12px', height: '12px', display: 'inline-block' }}></span> Huruf & angka</span>
              </div>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label className="form-label">Konfirmasi Kata Sandi</label>
            <div className="input-wrapper">
              <FiLock className="input-icon-left" />
              <input type={showConfirm ? "text" : "password"} className="form-input" placeholder="Ulangi kata sandi" required />
              {showConfirm ? (
                <FiEyeOff className="input-icon-right" onClick={() => setShowConfirm(false)} />
              ) : (
                <FiEye className="input-icon-right" onClick={() => setShowConfirm(true)} />
              )}
            </div>
          </div>

          <div className="form-options">
            <label className="checkbox-label" style={{ fontSize: '0.8rem', alignItems: 'flex-start' }}>
              <input type="checkbox" style={{ accentColor: '#4F46E5', width: '16px', height: '16px', marginTop: '2px' }} required />
              <span>Saya menyetujui <Link to="/syarat" className="auth-link">Syarat & Ketentuan</Link> serta <Link to="/privasi" className="auth-link">Kebijakan Privasi</Link> TypoKu.</span>
            </label>
          </div>

          <button type="submit" className="btn-auth-primary">
            Daftar Sekarang <FiChevronRight />
          </button>
        </form>

        <div className="divider">ATAU DAFTAR DENGAN</div>
        
        <button type="button" className="btn-auth-google">
          <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          Lanjutkan dengan Google
        </button>

        <div className="auth-footer-text">
          Sudah punya akun? <Link to="/login" className="auth-link">Masuk di sini <FiChevronRight style={{ verticalAlign: 'middle' }}/></Link>
        </div>

        <div className="secure-badge-box">
          <div className="secure-item">
            <FiShield color="#10b981" size={20} /> Data aman & terenkripsi AES-256
          </div>
          <div className="secure-item">
            <FiCheckCircle color="#4F46E5" size={20} /> 100% PUEBI V & KBBI VI
          </div>
        </div>
      </div>
      <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: '0.75rem', marginTop: '2rem' }}>
        TypoKu Workspace Engine • Versi 3.4 • Dirancang untuk akademisi Indonesia
      </p>
    </div>
  );
}