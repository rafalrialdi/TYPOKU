import { Link, useLocation } from 'react-router-dom';
import logoImg from '../assets/logo.svg';
import './components.css';

export default function Navbar() {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <nav className="navbar">
      <div className="nav-left">
        <img src={logoImg} alt="Logo TypoKu" style={{ height: '36px' }} />
      </div>

      <div className="nav-center">
        <Link to="/" className={currentPath === '/' ? 'nav-link active' : 'nav-link'}>Beranda</Link>
        <Link to="#fitur" className="nav-link">Fitur</Link>
        <Link to="#cara-kerja" className="nav-link">Cara Kerja</Link>
        <Link to="/harga" className={currentPath === '/harga' ? 'nav-link active' : 'nav-link'}>Harga</Link>
      </div>

      <div className="nav-right">
        <Link to="/login" className="login-text">Masuk</Link>
        <div className="profile-btn"></div>
      </div>
    </nav>
  );
}