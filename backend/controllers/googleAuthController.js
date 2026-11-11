const { OAuth2Client } = require('google-auth-library');
const db = require('../confiq/database');
const { generateAccessToken } = require('../utils/tokens');
const { sendSuccess, sendError } = require('../utils/response');

let googleClient = null;

function getGoogleClient() {
  if (!googleClient) {
    const clientId = (process.env.GOOGLE_CLIENT_ID || '').trim();
    googleClient = new OAuth2Client(clientId || undefined);
  }
  return googleClient;
}

/**
 * POST /api/auth/google
 *
 * Menerima ID token (credential) dari Google Identity Services, memverifikasinya,
 * lalu mengembalikan JWT dengan bentuk yang SAMA PERSIS seperti login email+password
 * agar AuthContext dan seluruh middleware tidak perlu diubah.
 */
async function googleLogin(req, res) {
  try {
    const clientId = (process.env.GOOGLE_CLIENT_ID || '').trim();

    if (!clientId) {
      console.error('Google login error: GOOGLE_CLIENT_ID belum diatur di .env');
      return sendError(res, 'Login dengan Google belum dikonfigurasi pada server', 500);
    }

    const { credential } = req.body;

    // 1. Verifikasi token langsung ke Google
    const ticket = await getGoogleClient().verifyIdToken({
      idToken: credential,
      audience: clientId,
    });

    // 2. Ambil data HANYA dari payload terverifikasi, jangan pernah dari request body
    const payload = ticket.getPayload() || {};
    const { sub, email, name, email_verified: emailVerified } = payload;

    if (!sub || !email) {
      return sendError(res, 'Token Google tidak memuat data yang diperlukan', 401);
    }

    if (!emailVerified) {
      return sendError(res, 'Email Google belum terverifikasi', 401);
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const fallbackName = cleanEmail.split('@')[0];
    const cleanName = String(name || fallbackName).trim().slice(0, 150) || fallbackName;

    // 3. Cari pengguna berdasarkan email
    const [rows] = await db.query(
      'SELECT id, name, email, phone, password_hash, google_id FROM users WHERE email = ? LIMIT 1',
      [cleanEmail]
    );

    let user = rows[0];
    let isNewUser = false;

    if (!user) {
      // Kondisi 1: email belum terdaftar -> buat akun baru tanpa kata sandi
      const [result] = await db.query(
        'INSERT INTO users (name, email, google_id) VALUES (?, ?, ?)',
        [cleanName, cleanEmail, sub]
      );

      user = {
        id: result.insertId,
        name: cleanName,
        email: cleanEmail,
        phone: null,
        google_id: sub,
      };
      isNewUser = true;
    } else if (!user.google_id) {
      // Kondisi 2: sudah terdaftar via password tetapi belum tertaut Google -> tautkan
      await db.query('UPDATE users SET google_id = ? WHERE id = ?', [sub, user.id]);
      user.google_id = sub;
    } else if (user.google_id !== sub) {
      // Kondisi 3: email sudah tertaut ke akun Google yang berbeda -> tolak
      return sendError(
        res,
        'Email ini sudah tertaut dengan akun Google lain. Silakan gunakan akun Google yang sesuai.',
        409
      );
    }
    // Kondisi 4: sudah tertaut dengan sub yang sama -> tidak ada perubahan data

    // 4. Terbitkan token dengan cara yang sama seperti login biasa
    const token = generateAccessToken({
      id: user.id,
      email: user.email,
    });

    return sendSuccess(res, 'Berhasil masuk dengan Google', {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone ?? null,
      },
      is_new_user: isNewUser,
    });
  } catch (error) {
    console.error('Google login error:', error.message);
    return sendError(res, 'Token Google tidak valid atau sudah kedaluwarsa', 401);
  }
}

module.exports = {
  googleLogin,
};
