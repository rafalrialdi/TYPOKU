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
import { useForgotPasswordMutation } from '../hooks/useAuthMutations';

const RESET_EMAIL_KEY = 'typoku_reset_email';

export default function CheckEmail() {
  const location = useLocation();
  const navigate = useNavigate();
  const [email] = useState(
    () => location.state?.email || sessionStorage.getItem(RESET_EMAIL_KEY) || ''
  );
  const forgotPasswordMutation = useForgotPasswordMutation();
  const resending = forgotPasswordMutation.isPending;
  const [message, setMessage] = useState('');
  const [serverError, setServerError] = useState('');

  async function handleResend() {
    if (resending) return;
    if (!email) {
      navigate('/lupa-kata-sandi');
      return;
    }

    setMessage('');
    setServerError('');

    try {
      await forgotPasswordMutation.mutateAsync(email);
      setMessage('Tautan pemulihan telah dikirim ulang. Silakan periksa kotak masuk Anda.');
    } catch (error) {
      setServerError(error.message);
    }
  }

  return (
    <section className="auth-card auth-card--narrow" aria-labelledby="check-email-title">
      <AuthHeader
        titleId="check-email-title"
        title="Periksa Email Anda"
        subtitle="Kami telah mengirimkan tautan pemulihan kata sandi ke alamat email terdaftar Anda."
      />

      <div className="auth-message-box">
        <FiInfo aria-hidden="true" />
        <p>
          Email verifikasi dikirimkan ke <strong>{email || 'alamat email Anda'}</strong>. Klik tautan
          di dalamnya untuk membuat kata sandi baru.
        </p>
      </div>

      {serverError ? (
        <div className="auth-alert auth-alert--error" role="alert">
          <FiAlertCircle aria-hidden="true" />
          <span>{serverError}</span>
        </div>
      ) : null}

      {message ? (
        <div className="auth-alert auth-alert--success" role="status">
          <FiInfo aria-hidden="true" />
          <span>{message}</span>
        </div>
      ) : null}

      <div className="auth-actions">
        <button
          className="auth-button"
          type="button"
          onClick={handleResend}
          disabled={resending}
          aria-busy={resending}
        >
          <FiRefreshCw aria-hidden="true" />
          {resending ? 'Mengirim Ulang...' : 'Kirim Ulang Email'}
        </button>

        <a
          className="auth-button auth-button--secondary"
          href="https://mail.google.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          Buka Gmail
          <FiExternalLink aria-hidden="true" />
        </a>
      </div>

      <hr className="auth-divider" />

      <Link className="auth-back-link" to="/login">
        <FiArrowLeft aria-hidden="true" />
        Kembali ke halaman masuk
      </Link>
    </section>
  );
}
