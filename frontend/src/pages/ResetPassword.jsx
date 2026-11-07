import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  FiAlertCircle,
  FiArrowLeft,
  FiArrowRight,
  FiCheckCircle,
  FiCircle,
  FiEye,
  FiEyeOff,
  FiLock,
} from 'react-icons/fi';
import AuthHeader from '../components/AuthHeader';
import { resetPassword, verifyResetToken } from '../services/authApi';
import { useSubmit } from '../hooks/useSubmit';
import { getPasswordRequirements, getPasswordStrength } from '../utils/password';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = (searchParams.get('token') || '').trim();
  const [status, setStatus] = useState(token ? 'checking' : 'invalid');
  const [email, setEmail] = useState('');
  const [error, setError] = useState(
    token ? '' : 'Tautan reset kata sandi tidak lengkap. Silakan minta tautan baru.'
  );
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const { run: submitResetPassword, loading: submitting } = useSubmit(resetPassword);

  const strength = useMemo(() => getPasswordStrength(password), [password]);
  const requirements = useMemo(() => getPasswordRequirements(password), [password]);

  useEffect(() => {
    if (!token) {
      setStatus('invalid');
      setError('Tautan reset kata sandi tidak lengkap. Silakan minta tautan baru.');
      return undefined;
    }

    let active = true;
    setStatus('checking');

    verifyResetToken(token)
      .then((result) => {
        if (!active) return;
        setEmail(result.data?.email || '');
        setError('');
        setStatus('valid');
      })
      .catch((requestError) => {
        if (!active) return;
        setError(requestError.message);
        setStatus('invalid');
      });

    return () => {
      active = false;
    };
  }, [token]);

  function goToForgotPage() {
    return (
      <Link className="auth-button" to="/lupa-kata-sandi">
        Minta Tautan Baru
        <FiArrowRight aria-hidden="true" />
      </Link>
    );
  }

  function handlePasswordChange(event) {
    setPassword(event.target.value);
    if (fieldErrors.password) {
      setFieldErrors((current) => ({ ...current, password: '' }));
    }
    if (serverError) setServerError('');
  }

  function handleConfirmChange(event) {
    setPasswordConfirm(event.target.value);
    if (fieldErrors.password_confirm) {
      setFieldErrors((current) => ({ ...current, password_confirm: '' }));
    }
    if (serverError) setServerError('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (submitting) return;
    const nextErrors = {};

    if (!password) {
      nextErrors.password = 'Kata sandi baru wajib diisi';
    } else if (password.length < 8) {
      nextErrors.password = 'Kata sandi minimal 8 karakter';
    } else if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      nextErrors.password = 'Kata sandi harus mengandung huruf dan angka';
    }

    if (!passwordConfirm) {
      nextErrors.password_confirm = 'Konfirmasi kata sandi wajib diisi';
    } else if (passwordConfirm !== password) {
      nextErrors.password_confirm = 'Konfirmasi kata sandi tidak cocok';
    }

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return;
    }

    setServerError('');

    try {
      const result = await submitResetPassword({
        token,
        password,
        password_confirm: passwordConfirm,
      });
      setSuccessMessage(
        result.message || 'Kata sandi berhasil diperbarui. Silakan masuk dengan kata sandi baru.'
      );
      setStatus('success');
    } catch (requestError) {
      setServerError(requestError.message);
    }
  }

  if (status === 'checking') {
    return (
      <section className="auth-card auth-card--narrow">
        <div className="auth-loading" role="status">
          <div className="auth-spinner" aria-hidden="true" />
          <p>Memverifikasi tautan pemulihan...</p>
        </div>
      </section>
    );
  }

  if (status === 'invalid') {
    return (
      <section className="auth-card auth-card--narrow" aria-labelledby="reset-invalid-title">
        <AuthHeader
          titleId="reset-invalid-title"
          title="Tautan Tidak Valid"
          subtitle="Tautan pemulihan kata sandi tidak dapat digunakan atau sudah kedaluwarsa."
        />

        <div className="auth-alert auth-alert--error auth-alert--spaced" role="alert">
          <FiAlertCircle aria-hidden="true" />
          <span>{error}</span>
        </div>

        <div className="auth-actions">{goToForgotPage()}</div>

        <hr className="auth-divider" />

        <Link className="auth-back-link" to="/login">
          <FiArrowLeft aria-hidden="true" />
          Kembali ke halaman masuk
        </Link>
      </section>
    );
  }

  if (status === 'success') {
    return (
      <section className="auth-card auth-card--narrow" aria-labelledby="reset-success-title">
        <AuthHeader
          titleId="reset-success-title"
          title="Kata Sandi Berhasil Diperbarui"
          subtitle={successMessage}
        />

        <div className="auth-actions">
          <Link className="auth-button" to="/login">
            Masuk Sekarang
            <FiArrowRight aria-hidden="true" />
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="auth-card auth-card--narrow" aria-labelledby="reset-password-title">
      <AuthHeader
        titleId="reset-password-title"
        title="Buat Kata Sandi Baru"
        subtitle={
          email
            ? `Masukkan kata sandi baru untuk akun ${email}.`
            : 'Masukkan kata sandi baru untuk akun Anda.'
        }
      />

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        {serverError ? (
          <div className="auth-alert auth-alert--error" role="alert">
            <FiAlertCircle aria-hidden="true" />
            <span>{serverError}</span>
          </div>
        ) : null}

        <div className="auth-field">
          <label className="auth-label" htmlFor="reset-password">
            Kata Sandi Baru
          </label>
          <div className="auth-input-wrap">
            <span className="auth-input-icon" aria-hidden="true">
              <FiLock />
            </span>
            <input
              id="reset-password"
              className={`auth-input${fieldErrors.password ? ' is-error' : ''}`}
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={handlePasswordChange}
              placeholder="Buat kata sandi baru"
              autoComplete="new-password"
              aria-invalid={Boolean(fieldErrors.password)}
              aria-describedby={fieldErrors.password ? 'reset-password-error' : undefined}
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

          <div className="auth-strength">
            <div className="auth-strength-bars" aria-hidden="true">
              {[0, 1, 2, 3].map((index) => (
                <span
                  key={index}
                  className={`auth-strength-bar${
                    index < strength.score
                      ? strength.tone === 'is-strong'
                        ? ' is-active'
                        : strength.tone === 'is-medium'
                          ? ' is-medium'
                          : ' is-weak'
                      : ''
                  }`}
                />
              ))}
            </div>
            <div className="auth-strength-meta">
              <span>Kekuatan kata sandi</span>
              <span className={`auth-strength-value ${strength.tone}`}>{strength.label}</span>
            </div>
          </div>

          <div className="auth-requirements">
            {requirements.map((requirement) => (
              <span
                key={requirement.label}
                className={`auth-requirement${requirement.met ? ' is-met' : ''}`}
              >
                {requirement.met ? <FiCheckCircle /> : <FiCircle />}
                {requirement.label}
              </span>
            ))}
          </div>

          {fieldErrors.password ? (
            <p className="auth-field-error" id="reset-password-error">
              {fieldErrors.password}
            </p>
          ) : null}
        </div>

        <div className="auth-field">
          <label className="auth-label" htmlFor="reset-password-confirm">
            Konfirmasi Kata Sandi Baru
          </label>
          <div className="auth-input-wrap">
            <span className="auth-input-icon" aria-hidden="true">
              <FiLock />
            </span>
            <input
              id="reset-password-confirm"
              className={`auth-input${fieldErrors.password_confirm ? ' is-error' : ''}`}
              type={showConfirmPassword ? 'text' : 'password'}
              value={passwordConfirm}
              onChange={handleConfirmChange}
              placeholder="Ulangi kata sandi baru"
              autoComplete="new-password"
              aria-invalid={Boolean(fieldErrors.password_confirm)}
              aria-describedby={
                fieldErrors.password_confirm ? 'reset-password-confirm-error' : undefined
              }
            />
            <button
              className="auth-input-toggle"
              type="button"
              onClick={() => setShowConfirmPassword((current) => !current)}
              aria-label={
                showConfirmPassword
                  ? 'Sembunyikan konfirmasi kata sandi'
                  : 'Tampilkan konfirmasi kata sandi'
              }
            >
              {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
          {fieldErrors.password_confirm ? (
            <p className="auth-field-error" id="reset-password-confirm-error">
              {fieldErrors.password_confirm}
            </p>
          ) : null}
        </div>

        <button
          className="auth-button auth-submit"
          type="submit"
          disabled={submitting}
          aria-busy={submitting}
        >
          {submitting ? 'Menyimpan...' : 'Simpan Kata Sandi Baru'}
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
