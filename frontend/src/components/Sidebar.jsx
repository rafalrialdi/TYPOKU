import { Link, useLocation } from 'react-router-dom';
import { FiGrid, FiType, FiRefreshCw, FiGlobe, FiAward, FiSettings, FiLogOut } from 'react-icons/fi';
import logoImg from '../assets/logo.svg';
import './components.css';

export default function Sidebar() {
  const location = useLocation();
  const path = location.pathname;

  return (
    <aside className="sidebar">
      {/* Container ini sekarang lengket ke atas (sticky) */}
      <div className="sidebar-sticky-wrapper">
        
        <div className="sidebar-header">
          <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: 'inherit' }}>
            <img src={logoImg} alt="Logo TypoKu" style={{ height: '32px' }} />
          </Link>
        </div>

        <nav className="sidebar-menu">
          <Link to="/dashboard" className={`sidebar-link ${path === '/dashboard' ? 'active' : ''}`}><FiGrid size={20} /> Dashboard</Link>
          <Link to="/koreksi" className={`sidebar-link ${path === '/koreksi' ? 'active' : ''}`}><FiType size={20} /> Koreksi Typo</Link>
          <Link to="/parafrase" className={`sidebar-link ${path === '/parafrase' ? 'active' : ''}`}><FiRefreshCw size={20} /> Parafrase</Link>
          <Link to="/terjemah" className={`sidebar-link ${path === '/terjemah' ? 'active' : ''}`}><FiGlobe size={20} /> Penerjemah</Link>
          <Link to="/langganan" className={`sidebar-link ${path === '/langganan' ? 'active' : ''}`}><FiAward size={20} /> Langganan</Link>
          <Link to="/pengaturan" className={`sidebar-link ${path === '/pengaturan' ? 'active' : ''}`}><FiSettings size={20} /> Pengaturan</Link>
        </nav>
        
        <div className="sidebar-bottom">
          <Link to="/login" className="logout-link"><FiLogOut size={20} /> Keluar</Link>
        </div>
        
      </div>
    </aside>
  );
}