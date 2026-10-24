import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import Layouts
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';
import AuthLayout from './layouts/AuthLayout';

// Import Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import KoreksiTypo from './pages/KoreksiTypo';
import Parafrase from './pages/Parafrase';
import Terjemah from './pages/Terjemah';
import Langganan from './pages/Langganan';
import Pengaturan from './pages/Pengaturan';

function App() {
  return (
    <Router>
      <Routes>
        {/* Rute Publik (Menggunakan MainLayout: Navbar atas) */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/harga" element={<Langganan />} />
        </Route>

        {/* Rute Autentikasi (Menggunakan AuthLayout) */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Rute Area Kerja (Menggunakan DashboardLayout: Sidebar Kiri) */}
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/koreksi" element={<KoreksiTypo />} />
          <Route path="/parafrase" element={<Parafrase />} />
          <Route path="/terjemah" element={<Terjemah />} />
          <Route path="/pengaturan" element={<Pengaturan />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;