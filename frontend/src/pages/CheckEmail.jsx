import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FiAlertCircle,
  FiArrowLeft,
  FiExternalLink,
  FiInfo,
  FiRefreshCw,
} from 'react-icons/fi';
import AuthHeader from '../components/AuthHeader';
import { requestPasswordReset } from '../services/authApi';

const RESET_EMAIL_KEY = 'typoku_reset_email';

export default function CheckEmail() {
  const location = useLocation();
  const navigate = useNavigate();
  const [email] = useState(
    () => location.state?.email || sessionStorage.getItem(RESET_EMAIL_KEY) || ''
  );
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState('');
  const [serverError, setServerError] = useState('');

  async function handleResend() {
    if (!email) {
      navigate('/lupa-kata-sandi');
      return;
    }

    setResending(true);
    setMessage('');
    setServerError('');

    try {
      await requestPasswordReset(email);
      setMessage('Tautan pemulihan telah dikirim ulang. Silakan periksa kotak masuk Anda.');
    } catch (error) {
      setServerError(error.message);
    } finally {
      setResending(false);
    }
  }

  return (
    <section className="auth-card auth-card--narrow" aria-labelledby="check-email-title">
      <AuthHeader
        titleId="check-email-title"
        title="Periksa Email Anda"
        subtitle="Kami telah mengirimkan tautan pemulihan kata sandi ke alamat email terdaftar Anda."
      />

      {serverError ? (
        <div className="auth-alert auth-alert--error auth-alert--spaced" role="alert">
          <FiAlertCircle aria-hidden="true" />
          <span>{serverError}</span>
        </div>
      ) : null}

      {message ? (
        <div className="auth-alert auth-alert--success auth-alert--spaced" role="status">
          <FiInfo aria-hidden="true" />
          <span>{message}</span>
        </div>
      ) : null}

      {email ? (
        <p className="auth-subtitle auth-email-target">
          Tautan dikirim ke <strong>{email}</strong>
        </p>
      ) : null}

      <div className="auth-note">
        <FiInfo aria-hidden="true" />
        <span>
          Tautan pemulihan memiliki masa berlaku terbatas. Jika email tidak muncul dalam beberapa
          menit, periksa folder spam atau promosi.
        </span>
      </div>

      <div className="auth-actions">
        <a className="auth-button" href="mailto:">
          Buka Aplikasi Email
          <FiExternalLink aria-hidden="true" />
        </a>
        <button
          className="auth-button auth-button--secondary"
          type="button"
          onClick={handleResend}
          disabled={resending}
        >
          <FiRefreshCw aria-hidden="true" />
          {resending ? 'Mengirim ulang...' : 'Kirim Ulang Tautan'}
        </button>
      </div>

      <hr className="auth-divider" />

      <Link className="auth-back-link" to="/login">
        <FiArrowLeft aria-hidden="true" />
        Kembali ke halaman masuk
      </Link>
    </section>
  );
}
