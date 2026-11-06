import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiAlertCircle, FiArrowRight, FiEye, FiEyeOff, FiLock, FiMail } from 'react-icons/fi';
import AuthHeader from '../components/AuthHeader';
import { useAuth } from '../context/AuthContext';
import { getMyAccess } from '../services/authApi';
import { getToken } from '../services/session';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const token = getToken();
  const [form, setForm] = useState({ email: '', password: '', remember: true });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) {
      return undefined;
    }

    getMyAccess();

    return undefined;
  }, [token, getMyAccess]);

  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (errors[name]) {
      setErrors((current) => ({ ...current, [name]: '' }));
    }
    if (serverError) {
      setServerError('');
    }
  }

  function validate() {
    const nextErrors = {};

    if (!form.email.trim()) {
      nextErrors.email = 'Email wajib diisi';
    } else if (!EMAIL_PATTERN.test(form.email.trim())) {
      nextErrors.email = 'Format email tidak valid';
    }

    if (!form.password) {
      nextErrors.password = 'Kata sandi wajib diisi';
    }

    return nextErrors;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validate();

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setSubmitting(true);
    setServerError('');

    try {
      await login(
        {
          email: form.email.trim(),
          password: form.password,
        },
        form.remember
      );
      navigate('/', { replace: true });
    } catch (error) {
      setServerError(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="auth-card" aria-labelledby="login-title">
      <AuthHeader
        titleId="login-title"
        title="Masuk ke TypoKu"
        subtitle="Lanjutkan penulisan skripsi & jurnal bebas kesalahan ejaan."
      />

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        {serverError ? (
          <div className="auth-alert auth-alert--error" role="alert">
            <FiAlertCircle aria-hidden="true" />
            <span>{serverError}</span>
          </div>
        ) : null}

        <div className="auth-field">
          <label className="auth-label" htmlFor="login-email">
            Alamat Email
          </label>
          <div className="auth-input-wrap">
            <span className="auth-input-icon" aria-hidden="true">
              <FiMail />
            </span>
            <input
              id="login-email"
              className={`auth-input${errors.email ? ' is-error' : ''}`}
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="nama@kampus.ac.id"
              autoComplete="email"
              inputMode="email"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? 'login-email-error' : undefined}
            />
          </div>
          {errors.email ? (
            <p className="auth-field-error" id="login-email-error">
              {errors.email}
            </p>
          ) : null}
        </div>

        <div className="auth-field">
          <div className="auth-label-row">
            <label className="auth-label" htmlFor="login-password">
              Kata Sandi
            </label>
            <Link className="auth-link auth-label-hint" to="/lupa-kata-sandi">
              Lupa kata sandi?
            </Link>
          </div>
          <div className="auth-input-wrap">
            <span className="auth-input-icon" aria-hidden="true">
              <FiLock />
            </span>
            <input
              id="login-password"
              className={`auth-input${errors.password ? ' is-error' : ''}`}
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Masukkan kata sandi"
              autoComplete="current-password"
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? 'login-password-error' : undefined}
            />
            <button
              className="auth-input-toggle"
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
          {errors.password ? (
            <p className="auth-field-error" id="login-password-error">
              {errors.password}
            </p>
          ) : null}
        </div>

        <label className="auth-checkbox-row">
          <input
            className="auth-checkbox"
            type="checkbox"
            name="remember"
            checked={form.remember}
            onChange={handleChange}
          />
          <span>Ingat saya di perangkat ini</span>
        </label>

        <button className="auth-button auth-submit" type="submit" disabled={submitting}>
          {submitting ? 'Memproses...' : 'Masuk'}
          {submitting ? null : <FiArrowRight aria-hidden="true" />}
        </button>
      </form>

      <p className="auth-footer-text">
        Belum punya akun?{' '}
        <Link className="auth-link" to="/register">
          Daftar sekarang
        </Link>
      </p>
    </section>
  );
}
