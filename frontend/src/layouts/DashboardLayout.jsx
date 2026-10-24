import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { FiSearch, FiBell } from 'react-icons/fi';
import './layout.css';

export default function DashboardLayout() {
  return (
    <div className="dashboard-layout-container">
      {/* Sidebar */}
      <Sidebar />

      {/* Konten Utama */}
      <div className="dashboard-content-area">
        {/* Header / Navbar Atas Dashboard */}
        <header className="dashboard-header">
          
          {/* Pencarian */}
          <div className="dashboard-search-container">
            <FiSearch color="#9ca3af" />
            <input type="text" placeholder="Cari dokumen atau fitur..." className="dashboard-search-input" />
          </div>
          
          {/* Notifikasi & Profil */}
          <div className="dashboard-header-right">
            <FiBell size={20} color="#4b5563" className="dashboard-bell" />
            <div className="profile-wrapper">
              <div className="profile-avatar">P</div>
              <div className="profile-info">
                <span className="profile-name">Prima</span>
                <span className="profile-role">Pro Member</span>
              </div>
            </div>
          </div>
        </header>

        {/* Konten yang berubah-ubah (Outlet) */}
        <main className="dashboard-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}