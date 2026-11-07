import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  FiAlertCircle,
  FiArrowRight,
  FiEye,
  FiEyeOff,
  FiLock,
  FiMail,
  FiPhone,
  FiUser,
} from 'react-icons/fi';
import AuthHeader from '../components/AuthHeader';
import { useAuth } from '../context/AuthContext';
import { getPasswordStrength } from '../utils/password';

const PHONE_PATTERN = /^\+?[0-9\s()-]{8,20}$/;

const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, 'Nama minimal 2 karakter')
      .max(150, 'Nama maksimal 150 karakter'),
    email: z
      .string()
      .trim()
      .min(1, 'Email wajib diisi')
      .email('Format email tidak valid'),
    phone: z
      .string()
      .trim()
      .refine((value) => !value || PHONE_PATTERN.test(value), 'Format nomor telepon tidak valid'),
    password: z
      .string()
      .min(8, 'Kata sandi minimal 8 karakter')
      .regex(/[A-Za-z]/, 'Kata sandi harus mengandung huruf')
      .regex(/\d/, 'Kata sandi harus mengandung angka'),
    password_confirm: z.string().min(1, 'Konfirmasi kata sandi wajib diisi'),
    terms: z.boolean().refine((value) => value === true, {
      message: 'Anda harus menyetujui ketentuan layanan',
    }),
  })
  .refine((data) => data.password === data.password_confirm, {
    path: ['password_confirm'],
    message: 'Konfirmasi kata sandi tidak cocok',
  });

const initialValues = {
  name: '',
  email: '',
  phone: '',
  password: '',
  password_confirm: '',
  terms: false,
};

export default function Register() {
  const navigate = useNavigate();
  const { register: registerAccount } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState('');
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: initialValues,
    mode: 'onTouched',
  });

  const password = watch('password') || '';
  const strength = useMemo(() => getPasswordStrength(password), [password]);

  async function onSubmit(values) {
    if (isSubmitting) return;
    setServerError('');

    try {
      await registerAccount(values);
      navigate('/login', { replace: true });
    } catch (error) {
      setServerError(error.message);
    }
  }

  return (
    <section className="auth-card auth-card--register" aria-labelledby="register-title">
      <AuthHeader
        titleId="register-title"
        title="Daftar Akun TypoKu"
        subtitle="Mulai koreksi PUEBI, parafrase naskah, dan cek ejaan gratis"
      />

      <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
        {serverError ? (
          <div className="auth-alert auth-alert--error" role="alert">
            <FiAlertCircle aria-hidden="true" />
            <span>{serverError}</span>
          </div>
        ) : null}

        <div className="auth-field">
          <label className="auth-label" htmlFor="register-name">
            Nama Lengkap
          </label>
          <div className="auth-input-wrap">
            <span className="auth-input-icon" aria-hidden="true">
              <FiUser />
            </span>
            <input
              id="register-name"
              className={`auth-input${errors.name ? ' is-error' : ''}`}
              type="text"
              placeholder="Nama lengkap Anda"
              autoComplete="name"
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? 'register-name-error' : undefined}
              {...register('name')}
            />
          </div>
          {errors.name ? (
            <p className="auth-field-error" id="register-name-error">
              {errors.name.message}
            </p>
          ) : null}
        </div>

        <div className="auth-field">
          <label className="auth-label" htmlFor="register-email">
            Alamat Email
          </label>
          <div className="auth-input-wrap">
            <span className="auth-input-icon" aria-hidden="true">
              <FiMail />
            </span>
            <input
              id="register-email"
              className={`auth-input${errors.email ? ' is-error' : ''}`}
              type="email"
              placeholder="nama@kampus.ac.id"
              autoComplete="email"
              inputMode="email"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? 'register-email-error' : undefined}
              {...register('email')}
            />
          </div>
          {errors.email ? (
            <p className="auth-field-error" id="register-email-error">
              {errors.email.message}
            </p>
          ) : null}
        </div>

        <div className="auth-field">
          <label className="auth-label" htmlFor="register-phone">
            Nomor Telepon
          </label>
          <div className="auth-input-wrap">
            <span className="auth-input-icon" aria-hidden="true">
              <FiPhone />
            </span>
            <input
              id="register-phone"
              className={`auth-input${errors.phone ? ' is-error' : ''}`}
              type="tel"
              placeholder="08xxxxxxxxxx"
              autoComplete="tel"
              inputMode="tel"
              aria-invalid={Boolean(errors.phone)}
              aria-describedby={errors.phone ? 'register-phone-error' : undefined}
              {...register('phone')}
            />
          </div>
          {errors.phone ? (
            <p className="auth-field-error" id="register-phone-error">
              {errors.phone.message}
            </p>
          ) : null}
        </div>

        <div className="auth-field">
          <div className="auth-label-row">
            <label className="auth-label" htmlFor="register-password">
              Kata Sandi
            </label>
            <span className="auth-label-hint">Min. 8 karakter</span>
          </div>
          <div className="auth-input-wrap">
            <span className="auth-input-icon" aria-hidden="true">
              <FiLock />
            </span>
            <input
              id="register-password"
              className={`auth-input${errors.password ? ' is-error' : ''}`}
              type={showPassword ? 'text' : 'password'}
              placeholder="Buat kata sandi"
              autoComplete="new-password"
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? 'register-password-error' : undefined}
              {...register('password')}
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
              <span>Kekuatan kata sandi:</span>
              <span className={`auth-strength-value ${strength.tone}`}>{strength.label}</span>
            </div>
          </div>

          {errors.password ? (
            <p className="auth-field-error" id="register-password-error">
              {errors.password.message}
            </p>
          ) : null}
        </div>

        <div className="auth-field">
          <label className="auth-label" htmlFor="register-password-confirm">
            Konfirmasi Kata Sandi
          </label>
          <div className="auth-input-wrap">
            <span className="auth-input-icon" aria-hidden="true">
              <FiLock />
            </span>
            <input
              id="register-password-confirm"
              className={`auth-input${errors.password_confirm ? ' is-error' : ''}`}
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Ulangi kata sandi"
              autoComplete="new-password"
              aria-invalid={Boolean(errors.password_confirm)}
              aria-describedby={
                errors.password_confirm ? 'register-password-confirm-error' : undefined
              }
              {...register('password_confirm')}
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
          {errors.password_confirm ? (
            <p className="auth-field-error" id="register-password-confirm-error">
              {errors.password_confirm.message}
            </p>
          ) : null}
        </div>

        <div className="auth-field">
          <label className="auth-checkbox-row auth-checkbox-row--start">
            <input
              className="auth-checkbox"
              type="checkbox"
              aria-invalid={Boolean(errors.terms)}
              {...register('terms')}
            />
            <span>
              Dengan mendaftar, saya menyetujui Ketentuan Layanan dan Kebijakan Privasi TypoKu.
            </span>
          </label>
          {errors.terms ? <p className="auth-field-error">{errors.terms.message}</p> : null}
        </div>

        <button
          className="auth-button auth-submit"
          type="submit"
          disabled={isSubmitting}
          aria-busy={isSubmitting}
        >
          {isSubmitting ? 'Memproses...' : 'Buat Akun Gratis'}
          {isSubmitting ? null : <FiArrowRight aria-hidden="true" />}
        </button>
      </form>

      <p className="auth-footer-text">
        Sudah punya akun?{' '}
        <Link className="auth-link" to="/login">
          Masuk di sini
        </Link>
      </p>
    </section>
  );
}
