const bcrypt = require('bcryptjs');
const db = require('../confiq/database');
const { generateRandomToken, hashToken } = require('../utils/tokens');
const { sendPasswordResetEmail } = require('../utils/mailer');
const { sendSuccess, sendError } = require('../utils/response');

async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    const cleanEmail = (email || '').trim().toLowerCase();

    const [users] = await db.query(
      'SELECT id, email, name, (password_hash IS NOT NULL) AS has_password FROM users WHERE email = ? LIMIT 1',
      [cleanEmail]
    );

    // Keamanan: selalu kirim respon sukses generik untuk mencegah account enumeration.
    // Akun Google-only tidak punya kata sandi, jadi tidak perlu dikirimi tautan reset.
    if (users.length === 0 || !users[0].has_password) {
      return sendSuccess(
        res,
        'Jika alamat email terdaftar, tautan pemulihan kata sandi telah dikirim ke kotak masuk Anda.'
      );
    }

    const user = users[0];
    const rawToken = generateRandomToken(32);
    const tokenHash = hashToken(rawToken);

    // Matikan token lama milik user yang belum dipakai
    await db.query(
      'UPDATE password_resets SET used_at = NOW() WHERE user_id = ? AND used_at IS NULL',
      [user.id]
    );

    const ttlMinutes = parseInt(process.env.RESET_TOKEN_TTL_MINUTES || '60', 10);

    // Simpan token hash baru ke database
    await db.query(
      `INSERT INTO password_resets (user_id, token_hash, expires_at)
       VALUES (?, ?, DATE_ADD(NOW(), INTERVAL ? MINUTE))`,
      [user.id, tokenHash, ttlMinutes]
    );

    const appUrl = (process.env.APP_URL || 'http://localhost:5173').trim().replace(/\/$/, '');
    const resetUrl = `${appUrl}/reset-password?token=${rawToken}`;

    // Kirim email (jika SMTP belum disetel dengan benar, log error namun jangan gagalkan respon)
    try {
      await sendPasswordResetEmail(user.email, resetUrl);
    } catch (mailError) {
      console.error('Nodemailer error sending reset email:', mailError.message);
      // Di mode development/staging, log URL agar developer bisa menguji langsung
      console.log(`[DEV ONLY] Password reset URL for ${user.email}: ${resetUrl}`);
    }

    return sendSuccess(
      res,
      'Jika alamat email terdaftar, tautan pemulihan kata sandi telah dikirim ke kotak masuk Anda.'
    );
  } catch (error) {
    console.error('forgotPassword error:', error);
    return sendError(res, 'Terjadi kesalahan saat memproses permintaan reset kata sandi', 500);
  }
}

async function verifyResetToken(req, res) {
  try {
    const rawToken = (req.query.token || '').trim();
    if (!rawToken) {
      return sendError(res, 'Token reset kata sandi wajib disertakan', 400);
    }

    const tokenHash = hashToken(rawToken);
    const [rows] = await db.query(
      `SELECT pr.id, pr.expires_at, u.email
       FROM password_resets pr
       JOIN users u ON u.id = pr.user_id
       WHERE pr.token_hash = ?
         AND pr.used_at IS NULL
         AND pr.expires_at > NOW()
       LIMIT 1`,
      [tokenHash]
    );

    if (rows.length === 0) {
      return sendError(res, 'Token reset kata sandi tidak valid atau sudah kedaluwarsa', 400, {
        valid: false,
      });
    }

    return sendSuccess(res, 'Token valid', {
      valid: true,
      email: rows[0].email,
    });
  } catch (error) {
    console.error('verifyResetToken error:', error);
    return sendError(res, 'Gagal memverifikasi token', 500);
  }
}

async function resetPassword(req, res) {
  try {
    const { token, password } = req.body;
    const rawToken = (token || '').trim();

    if (!rawToken) {
      return sendError(res, 'Token reset kata sandi wajib disertakan', 400);
    }

    const tokenHash = hashToken(rawToken);
    const [resets] = await db.query(
      `SELECT id, user_id, expires_at
       FROM password_resets
       WHERE token_hash = ?
         AND used_at IS NULL
         AND expires_at > NOW()
       LIMIT 1`,
      [tokenHash]
    );

    if (resets.length === 0) {
      return sendError(res, 'Token reset kata sandi tidak valid atau sudah kedaluwarsa', 400);
    }

    const resetRecord = resets[0];

    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(password, salt);

    // Update password dan tandai token telah digunakan
    await db.query(
      'UPDATE users SET password_hash = ? WHERE id = ?',
      [newPasswordHash, resetRecord.user_id]
    );

    await db.query(
      'UPDATE password_resets SET used_at = NOW() WHERE id = ?',
      [resetRecord.id]
    );

    return sendSuccess(res, 'Kata sandi berhasil diperbarui. Silakan masuk menggunakan kata sandi baru Anda.');
  } catch (error) {
    console.error('resetPassword error:', error);
    return sendError(res, 'Terjadi kesalahan saat memperbarui kata sandi', 500);
  }
}

module.exports = {
  forgotPassword,
  verifyResetToken,
  resetPassword,
};
