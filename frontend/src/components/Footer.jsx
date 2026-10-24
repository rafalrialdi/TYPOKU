import { Link } from 'react-router-dom';
import logoImg from '../assets/logo.svg';
import './components.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-col-brand">
        <div className="nav-left" style={{ marginBottom: '1.5rem' }}>
          <img src={logoImg} alt="Logo TypoKu" style={{ height: '40px' }} />
        </div>
        <p className="footer-desc">
          Asisten penulisan AI canggih untuk menyempurnakan tata bahasa, mendeteksi salah ketik, dan memparafrase kalimat secara instan.
        </p>
      </div>

      <div className="footer-col">
        <h4 className="footer-title">Produk</h4>
        <div className="footer-links">
          <Link to="#" className="footer-link">Fitur Utama</Link>
          <Link to="#" className="footer-link">Cara Kerja</Link>
          <Link to="/harga" className="footer-link">Paket & Harga</Link>
        </div>
      </div>

      <div className="footer-col">
        <h4 className="footer-title">Perusahaan</h4>
        <div className="footer-links">
          <Link to="#" className="footer-link">Tentang TypoKu</Link>
          <Link to="#" className="footer-link">Pusat Bantuan</Link>
        </div>
      </div>

      <div className="footer-col">
        <h4 className="footer-title">Legalitas</h4>
        <div className="footer-links">
          <Link to="#" className="footer-link">Kebijakan Privasi</Link>
          <Link to="#" className="footer-link">Syarat & Ketentuan</Link>
        </div>
      </div>
    </footer>
  );
}