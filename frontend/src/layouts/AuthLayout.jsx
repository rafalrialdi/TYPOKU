import { Outlet } from 'react-router-dom';
import './auth.css';

export default function AuthLayout() {
  return (
    <div className="auth-page">
      <main className="auth-main">
        <Outlet />
        <p className="auth-copyright">
          {"\u00A9"} {new Date().getFullYear()} TypoKu. Hak Cipta Dilindungi Undang-Undang.
        </p>
      </main>
    </div>
  );
}
