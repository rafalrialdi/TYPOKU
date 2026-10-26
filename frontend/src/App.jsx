import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import Layouts
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';
import AuthLayout from './layouts/AuthLayout';

// Import Pages
import Home from './pages/Home';
import Harga from './pages/Harga';
import Info from './pages/Info';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import KoreksiTypo from './pages/KoreksiTypo';
import Parafrase from './pages/Parafrase';
import Terjemah from './pages/Terjemah';
import Langganan from './pages/Langganan';
import Pengaturan from './pages/Pengaturan';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Rute Publik (Navbar & Footer) */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/harga" element={<Harga />} />
          <Route path="/tentang" element={<Info />} />
          <Route path="/bantuan" element={<Info />} />
          <Route path="/privasi" element={<Info />} />
          <Route path="/syarat" element={<Info />} />
        </Route>

        {/* Rute Autentikasi (AuthLayout) */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Rute Setelah Login (Sidebar) */}
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/koreksi" element={<KoreksiTypo />} />
          <Route path="/parafrase" element={<Parafrase />} />
          <Route path="/terjemah" element={<Terjemah />} />
          <Route path="/langganan" element={<Langganan />} />
          <Route path="/pengaturan" element={<Pengaturan />} />
        </Route>
      </Routes>
    </Router>
  );
}