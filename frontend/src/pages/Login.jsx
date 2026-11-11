import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { FiAlertCircle, FiArrowRight, FiEye, FiEyeOff, FiLock, FiMail } from 'react-icons/fi';
import AuthHeader from '../components/AuthHeader';
import { useAuth } from '../context/AuthContext';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const GOOGLE_CLIENT_ID = (import.meta.env?.VITE_GOOGLE_CLIENT_ID || '').trim();

// Google hanya menerima lebar 200-400px. Di luar itu tombol tidak dirender.
const GOOGLE_MIN_WIDTH = 200;
const GOOGLE_MAX_WIDTH = 400;

function clampGoogleWidth(value) {
  if (!Number.isFinite(value) || value <= 0) return GOOGLE_MAX_WIDTH;
  return Math.min(GOOGLE_MAX_WIDTH, Math.max(GOOGLE_MIN_WIDTH, Math.round(value)));
}

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, loginWithGoogle, isLoggingIn, isGoogleLoggingIn } = useAuth();
  const googleWrapRef = useRef(null);
  const [googleButtonWidth, setGoogleButtonWidth] = useState(GOOGLE_MAX_WIDTH);

  // Selaraskan lebar tombol Google dengan lebar kolom input card.
  // Google merender tombol pada lebar TETAP sesuai prop `width`, jadi bila
  // prop ini lebih besar dari lebar card, isi tombol akan meluber ke kanan.
  useEffect(() => {
    const element = googleWrapRef.current;
    if (!element || typeof ResizeObserver === 'undefined') return undefined;

    function syncWidth() {
      const nextWidth = clampGoogleWidth(element.getBoundingClientRect().width);
      setGoogleButtonWidth((current) => (current === nextWidth ? current : nextWidth));
    }

    syncWidth();

    const observer = new ResizeObserver(syncWidth);
    observer.observe(element);

    return () => observer.disconnect();
  }, []);
  const redirectParam = searchParams.get('redirect') || '';
  const redirectTo =
    redirectParam.startsWith('/') && !redirectParam.startsWith('//') ? redirectParam : '/';
  const [form, setForm] = useState({ email: '', password: '', remember: true });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');

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
    if (isLoggingIn) return;
    const nextErrors = validate();

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setServerError('');

    try {
      await login(
        {
          email: form.email.trim(),
          password: form.password,
        },
        form.remember
      );
      navigate(redirectTo, { replace: true });
    } catch (error) {
      setServerError(error.message);
    }
  }

  async function handleGoogleSuccess(credentialResponse) {
    setServerError('');

    if (!credentialResponse?.credential) {
      setServerError('Login dengan Google gagal. Silakan coba lagi.');
      return;
    }

    try {
      await loginWithGoogle(credentialResponse.credential, form.remember);
      navigate(redirectTo, { replace: true });
    } catch (error) {
      setServerError(error.message);
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
          <label className="auth-label" htmlFor="login-password">
            Kata Sandi
          </label>
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
          <Link className="auth-link auth-forgot-link" to="/lupa-kata-sandi">
            Lupa kata sandi?
          </Link>
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

        <button
          className="auth-button auth-submit"
          type="submit"
          disabled={isLoggingIn}
          aria-busy={isLoggingIn}
        >
          {isLoggingIn ? 'Memproses...' : 'Masuk'}
          {isLoggingIn ? null : <FiArrowRight aria-hidden="true" />}
        </button>
      </form>

      {GOOGLE_CLIENT_ID ? (
        <>
          <div className="auth-google-divider" aria-hidden="true">
            <span>atau</span>
          </div>

          <div
            ref={googleWrapRef}
            className="auth-google-wrap"
            aria-busy={isGoogleLoggingIn}
          >
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setServerError('Login dengan Google gagal. Silakan coba lagi.')}
              text="signin_with"
              shape="rectangular"
              theme="outline"
              size="large"
              logo_alignment="left"
              locale="id"
              width={googleButtonWidth}
            />
          </div>

          {isGoogleLoggingIn ? (
            <p className="auth-google-status" role="status">
              Menghubungkan ke Google...
            </p>
          ) : null}
        </>
      ) : null}

      <p className="auth-consent-text">
        Dengan melanjutkan, kamu menyetujui{' '}
        <Link className="auth-text-link" to="/syarat-ketentuan">
          Syarat &amp; Ketentuan
        </Link>{' '}
        dan{' '}
        <Link className="auth-text-link" to="/kebijakan-privasi">
          Kebijakan Privasi
        </Link>
        .
      </p>

      <p className="auth-footer-text">
        Belum punya akun?{' '}
        <Link className="auth-link" to="/register">
          Daftar sekarang
        </Link>
      </p>
    </section>
  );
}
