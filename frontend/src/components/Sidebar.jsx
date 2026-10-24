import { Link, useLocation } from 'react-router-dom';
import { FiGrid, FiType, FiRefreshCw, FiGlobe, FiAward, FiSettings, FiLogOut } from 'react-icons/fi';
import './components.css';

export default function Sidebar() {
  const location = useLocation();
  const path = location.pathname;

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="nav-logo">
          <span>T</span>
        </div>
        <h2 className="nav-title">TypoKu</h2>
      </div>

      <nav className="sidebar-menu">
        <Link to="/dashboard" className={`sidebar-link ${path === '/dashboard' ? 'active' : ''}`}><FiGrid size={20} /> Dashboard</Link>
        <Link to="/koreksi" className={`sidebar-link ${path === '/koreksi' ? 'active' : ''}`}><FiType size={20} /> Koreksi Typo</Link>
        <Link to="/parafrase" className={`sidebar-link ${path === '/parafrase' ? 'active' : ''}`}><FiRefreshCw size={20} /> Parafrase</Link>
        <Link to="/terjemah" className={`sidebar-link ${path === '/terjemah' ? 'active' : ''}`}><FiGlobe size={20} /> Penerjemah</Link>
        <Link to="/harga" className={`sidebar-link ${path === '/harga' ? 'active' : ''}`}><FiAward size={20} /> Langganan</Link>
        <Link to="/pengaturan" className={`sidebar-link ${path === '/pengaturan' ? 'active' : ''}`}><FiSettings size={20} /> Pengaturan</Link>

        <div className="sidebar-bottom">
          <Link to="/login" className="logout-link"><FiLogOut size={20} /> Keluar</Link>
        </div>
      </nav>
    </aside>
  );
}