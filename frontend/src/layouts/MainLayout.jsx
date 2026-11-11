import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './layout.css';

const FOOTER_ROUTES = ['/', '/syarat-ketentuan', '/kebijakan-privasi'];

export default function MainLayout() {
  const { pathname } = useLocation();

  return (
    <div className="main-layout-container">
      <Navbar />
      <main className="main-content">
        <Outlet />
      </main>
      {FOOTER_ROUTES.includes(pathname) ? <Footer /> : null}
    </div>
  );
}