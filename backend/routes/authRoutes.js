const express = require('express');
const { body, query } = require('express-validator');
const authController = require('../controllers/authController');
const passwordResetController = require('../controllers/passwordResetController');
const authenticate = require('../middleware/authenticate');
const validate = require('../middleware/validate');
const { authLimiter, forgotPasswordLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.post(
  '/register',
  [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Nama lengkap wajib diisi')
      .isLength({ min: 2, max: 150 })
      .withMessage('Nama harus antara 2 hingga 150 karakter'),
    body('email')
      .trim()
      .notEmpty()
      .withMessage('Alamat email wajib diisi')
      .isEmail()
      .withMessage('Format email tidak valid')
      .normalizeEmail(),
    body('phone')
      .optional({ checkFalsy: true })
      .trim()
      .isMobilePhone('any')
      .withMessage('Format nomor telepon tidak valid'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Kata sandi minimal 8 karakter')
      .matches(/^(?=.*[A-Za-z])(?=.*\d)/)
      .withMessage('Kata sandi harus mengandung kombinasi huruf dan angka'),
    body('password_confirm')
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Konfirmasi kata sandi tidak cocok');
        }
        return true;
      }),
  ],
  validate,
  authController.register
);

router.post(
  '/login',
  authLimiter,
  [
    body('email')
      .trim()
      .notEmpty()
      .withMessage('Alamat email wajib diisi')
      .isEmail()
      .withMessage('Format email tidak valid')
      .normalizeEmail(),
    body('password').notEmpty().withMessage('Kata sandi wajib diisi'),
  ],
  validate,
  authController.login
);

router.get('/me', authenticate, authController.me);

router.post(
  '/forgot-password',
  forgotPasswordLimiter,
  [
    body('email')
      .trim()
      .notEmpty()
      .withMessage('Alamat email wajib diisi')
      .isEmail()
      .withMessage('Format email tidak valid')
      .normalizeEmail(),
  ],
  validate,
  passwordResetController.forgotPassword
);

router.get(
  '/reset-password/verify',
  [query('token').trim().notEmpty().withMessage('Token reset wajib disertakan')],
  validate,
  passwordResetController.verifyResetToken
);

router.post(
  '/reset-password',
  [
    body('token').trim().notEmpty().withMessage('Token reset wajib disertakan'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Kata sandi baru minimal 8 karakter')
      .matches(/^(?=.*[A-Za-z])(?=.*\d)/)
      .withMessage('Kata sandi baru harus mengandung kombinasi huruf dan angka'),
    body('password_confirm')
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Konfirmasi kata sandi baru tidak cocok');
        }
        return true;
      }),
  ],
  validate,
  passwordResetController.resetPassword
);

module.exports = router;
