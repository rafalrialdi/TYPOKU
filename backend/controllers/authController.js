const bcrypt = require('bcryptjs');
const db = require('../confiq/database');
const { generateAccessToken } = require('../utils/tokens');
const { sendSuccess, sendError } = require('../utils/response');

async function register(req, res) {
  try {
    const { name, email, phone, password } = req.body;
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPhone = phone ? phone.trim() : null;

    // Cek apakah email sudah terdaftar
    const [existingEmail] = await db.query(
      'SELECT id FROM users WHERE email = ? LIMIT 1',
      [cleanEmail]
    );
    if (existingEmail.length > 0) {
      return sendError(res, 'Email sudah terdaftar. Silakan gunakan email lain atau masuk ke akun Anda.', 409);
    }

    // Cek nomor telepon jika diisi
    if (cleanPhone) {
      const [existingPhone] = await db.query(
        'SELECT id FROM users WHERE phone = ? LIMIT 1',
        [cleanPhone]
      );
      if (existingPhone.length > 0) {
        return sendError(res, 'Nomor telepon sudah terdaftar. Silakan gunakan nomor lain.', 409);
      }
    }

    // Hash kata sandi
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Simpan user baru
    const [result] = await db.query(
      `INSERT INTO users (name, email, phone, password_hash)
       VALUES (?, ?, ?, ?)`,
      [name.trim(), cleanEmail, cleanPhone, passwordHash]
    );

    const newUserId = result.insertId;
    const token = generateAccessToken({
      id: newUserId,
      email: cleanEmail,
    });

    return sendSuccess(
      res,
      'Registrasi berhasil. Selamat datang di TypoKu!',
      {
        token,
        user: {
          id: newUserId,
          name: name.trim(),
          email: cleanEmail,
          phone: cleanPhone,
        },
      },
      201
    );
  } catch (error) {
    console.error('Register error:', error);
    return sendError(res, 'Terjadi kesalahan saat registrasi', 500);
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    const cleanEmail = (email || '').trim().toLowerCase();

    const [users] = await db.query(
      'SELECT id, name, email, phone, password_hash, google_id FROM users WHERE email = ? LIMIT 1',
      [cleanEmail]
    );

    if (users.length === 0) {
      return sendError(res, 'Email atau kata sandi tidak valid', 401);
    }

    const user = users[0];

    // Akun yang terdaftar lewat Google tidak punya kata sandi.
    // Jangan membandingkan hash kosong agar tidak crash.
    if (!user.password_hash) {
      return sendError(
        res,
        'Akun ini terdaftar dengan Google. Silakan masuk dengan tombol "Masuk dengan Google".',
        400
      );
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return sendError(res, 'Email atau kata sandi tidak valid', 401);
    }

    const token = generateAccessToken({
      id: user.id,
      email: user.email,
    });

    return sendSuccess(res, 'Berhasil masuk ke akun TypoKu', {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return sendError(res, 'Terjadi kesalahan saat masuk', 500);
  }
}

async function me(req, res) {
  try {
    const userId = req.user.id;
    const [users] = await db.query(
      `SELECT id, name, email, phone, google_id, created_at,
              (password_hash IS NOT NULL) AS has_password
       FROM users WHERE id = ? LIMIT 1`,
      [userId]
    );

    if (users.length === 0) {
      return sendError(res, 'Pengguna tidak ditemukan', 404);
    }

    const user = users[0];

    return sendSuccess(res, 'Data pengguna berhasil diambil', {
      user: {
        ...user,
        has_password: Boolean(user.has_password),
      },
    });
  } catch (error) {
    console.error('Me error:', error);
    return sendError(res, 'Gagal mengambil data pengguna', 500);
  }
}

module.exports = {
  register,
  login,
  me,
};
