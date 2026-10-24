import { Outlet } from 'react-router-dom';
import './layout.css';

export default function AuthLayout() {
  return (
    <div className="auth-layout-container">
      {/* Form Login/Register */}
      <Outlet />
    </div>
  );
}