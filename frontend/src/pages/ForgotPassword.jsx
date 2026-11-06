import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiAlertCircle, FiArrowLeft, FiArrowRight, FiMail } from 'react-icons/fi';
import AuthHeader from '../components/AuthHeader';
import { requestPasswordReset } from '../services/authApi';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RESET_EMAIL_KEY = 'typoku_reset_email';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    const cleanEmail = email.trim();

    if (!cleanEmail) {
      setError('Email wajib diisi');
      return;
    }

    if (!EMAIL_PATTERN.test(cleanEmail)) {
      setError('Format email tidak valid');
      return;
    }

    setSubmitting(true);
    setError('');
    setServerError('');

    try {
      await requestPasswordReset(cleanEmail);
      sessionStorage.setItem(RESET_EMAIL_KEY, cleanEmail);
      navigate('/cek-email', { state: { email: cleanEmail } });
    } catch (requestError) {
      setServerError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="auth-card auth-card--narrow" aria-labelledby="forgot-title">
      <AuthHeader
        titleId="forgot-title"
        title="Lupa Kata Sandi?"
        subtitle="Masukkan alamat email yang terdaftar. Kami akan mengirimkan tautan untuk membuat kata sandi baru."
      />

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        {serverError ? (
          <div className="auth-alert auth-alert--error" role="alert">
            <FiAlertCircle aria-hidden="true" />
            <span>{serverError}</span>
          </div>
        ) : null}

        <div className="auth-field">
          <label className="auth-label" htmlFor="forgot-email">
            Alamat Email
          </label>
          <div className="auth-input-wrap">
            <span className="auth-input-icon" aria-hidden="true">
              <FiMail />
            </span>
            <input
              id="forgot-email"
              className={`auth-input${error ? ' is-error' : ''}`}
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                if (error) setError('');
                if (serverError) setServerError('');
              }}
              placeholder="nama@kampus.ac.id"
              autoComplete="email"
              inputMode="email"
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'forgot-email-error' : undefined}
            />
          </div>
          {error ? (
            <p className="auth-field-error" id="forgot-email-error">
              {error}
            </p>
          ) : null}
        </div>

        <button className="auth-button auth-submit" type="submit" disabled={submitting}>
          {submitting ? 'Mengirim...' : 'Kirim Tautan Pemulihan'}
          {submitting ? null : <FiArrowRight aria-hidden="true" />}
        </button>
      </form>

      <hr className="auth-divider" />

      <Link className="auth-back-link" to="/login">
        <FiArrowLeft aria-hidden="true" />
        Kembali ke halaman masuk
      </Link>
    </section>
  );
}
