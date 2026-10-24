import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, FiSmile, FiInfo } from 'react-icons/fi';
import logoImg from '../assets/logo.svg';
import './style.css';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // Dummy login: langsung arahkan ke dashboard
    navigate('/dashboard');
  };

  return (
    <div className="auth-box">
      <div className="auth-card-inner">
        {/* Header Dalam Kartu */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src={logoImg} alt="TypoKu" style={{ height: '32px' }} />
          </div>
          <span className="auth-badge">• v2.4 Rilis</span>
        </div>

        <h2 className="auth-title">Selamat Datang Kembali <FiSmile color="#f59e0b" /></h2>
        <p className="auth-subtitle">Masuk ke akun TypoKu kamu untuk melanjutkan pemeriksaan dan parafrase dokumen.</p>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Alamat Email <span>Wajib</span></label>
            <div className="input-wrapper">
              <FiMail className="input-icon-left" />
              <input type="email" className="form-input" placeholder="nama@universitas.ac.id atau email Anda" required />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Kata Sandi <Link to="#" className="auth-link" style={{ fontWeight: 'normal', fontSize: '0.75rem' }}>Lupa Password?</Link></label>
            <div className="input-wrapper">
              <FiLock className="input-icon-left" />
              <input type={showPassword ? "text" : "password"} className="form-input" placeholder="••••••••••••" required />
              {showPassword ? (
                <FiEyeOff className="input-icon-right" onClick={() => setShowPassword(false)} />
              ) : (
                <FiEye className="input-icon-right" onClick={() => setShowPassword(true)} />
              )}
            </div>
          </div>

          <div className="form-options">
            <label className="checkbox-label">
              <input type="checkbox" style={{ accentColor: '#4F46E5', width: '16px', height: '16px' }} />
              Ingat saya selama 30 hari
            </label>
          </div>

          <button type="submit" className="btn-auth-primary">
            Masuk ke Akun <FiArrowRight />
          </button>
        </form>

        <div className="divider">ATAU MASUK DENGAN</div>
        
        <button type="button" className="btn-auth-google">
          <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          Masuk dengan Google
        </button>

        <div className="auth-footer-text">
          Belum punya akun? <Link to="/register" className="auth-link">Buat Akun Gratis</Link>
        </div>

        <div className="auth-tips">
          <FiInfo size={20} color="#4F46E5" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong>Tips Mahasiswa:</strong> Gunakan email institusi/kampus untuk akses fitur kolaborasi tugas akhir otomatis.
          </div>
        </div>
      </div>
    </div>
  );
}