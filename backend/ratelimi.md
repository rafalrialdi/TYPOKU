# Panduan Rate Limiting — TypoKu Backend

Dokumen ini menjelaskan strategi perlindungan, konfigurasi, daftar endpoint yang dibatasi, format respon error, serta penanganan rate limiting pada backend TypoKu menggunakan pustaka **`express-rate-limit`**.

---

## 1. Tujuan & Arsitektur Rate Limiting

Rate limiting diterapkan untuk melindungi backend TypoKu dari:
1. **Serangan Brute Force:** Percobaan tebak kata sandi berulang-ulang pada endpoint login.
2. **Penyalahgunaan Fitur Pemulihan Kata Sandi:** Spam pengiriman email reset password via SMTP / Nodemailer.
3. **Spam Pembuatan Pesanan:** Mencegah pembuatan ribuan pesanan gantung (`orders` pending) dan pencegahan *exhaustion* kuota request token Snap ke Midtrans.
4. **Denial of Service (DoS):** Menjaga stabilitas server Express dan database MySQL Aiven dari lonjakan request yang tidak wajar.

File konfigurasi utama terletak di:
`backend/middleware/rateLimiter.js`

---

## 2. Daftar Rate Limiter & Konfigurasi Lengkap

Terdapat 4 tingkatan limiter yang dirancang khusus sesuai sensitivitas masing-masing aksi:

| Nama Limiter | Window Waktu (`windowMs`) | Maksimal Request (`max`) | Sasaran Proteksi | Pesan Kesalahan |
|---|---|---|---|---|
| **`generalLimiter`** | 15 Menit | 300 request | Global (seluruh API) | *Terlalu banyak permintaan. Silakan coba beberapa saat lagi.* |
| **`authLimiter`** | 15 Menit | 15 request | `POST /api/auth/login` | *Terlalu banyak percobaan masuk. Silakan coba lagi setelah 15 menit.* |
| **`forgotPasswordLimiter`** | 60 Menit (1 Jam) | 5 request | `POST /api/auth/forgot-password` | *Terlalu banyak permintaan pemulihan kata sandi. Silakan coba lagi setelah 1 jam.* |
| **`orderLimiter`** | 60 Menit (1 Jam) | 30 request | `POST /api/orders` | *Terlalu banyak permintaan pembuatan pesanan. Silakan coba lagi nanti.* |

---

## 3. Pemasangan pada Route / Endpoint

### 3.1 Global Limiter (`generalLimiter`)
Dipasang pada file `backend/server.js` sebelum semua route API dipanggil:

```javascript
const { generalLimiter } = require('./middleware/rateLimiter');

// Dipasang setelah helmet dan cors
app.use(generalLimiter);
```

Setiap IP client dibatasi maksimal **300 request per 15 menit** di seluruh endpoint server.

### 3.2 Autentikasi (`authLimiter`)
Dipasang pada `backend/routes/authRoutes.js` pada rute login:

```javascript
router.post(
  '/login',
  authLimiter, // ← Membatasi brute-force login
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ],
  validate,
  authController.login
);
```

### 3.3 Lupa Kata Sandi (`forgotPasswordLimiter`)
Dipasang pada `backend/routes/authRoutes.js` pada rute permintaan reset password:

```javascript
router.post(
  '/forgot-password',
  forgotPasswordLimiter, // ← Membatasi spam email OTP / token reset
  [body('email').isEmail().normalizeEmail()],
  validate,
  authController.forgotPassword
);
```

### 3.4 Pembuatan Pesanan (`orderLimiter`)
Dipasang pada `backend/routes/orderRoutes.js`:

```javascript
router.post(
  '/',
  authenticate,
  orderLimiter, // ← Membatasi spam order & token Snap
  [
    body('package_id').isInt({ min: 1 }),
    body('payment_method').trim().notEmpty(),
  ],
  validate,
  orderController.createOrder
);
```

---

## 4. Format Respon Saat Melebihi Batas (HTTP 429)

Ketika client melampaui ambang batas request, server akan langsung memutus request dan mengembalikan status **HTTP 429 (Too Many Requests)** dengan format JSON standar TypoKu:

```json
{
  "status": "error",
  "message": "Terlalu banyak percobaan masuk. Silakan coba lagi setelah 15 menit."
}
```

Format ini konsisten dengan utilitas respon TypoKu (`utils/response.js`), sehingga frontend dapat menangani blok error secara seragam via `error.response.data.message` atau `error.message`.

---

## 5. Standar Header HTTP yang Dikirimkan

Semua limiter di TypoKu dikonfigurasi dengan:

```javascript
standardHeaders: true, // Mengirimkan header standar IETF RateLimit-*
legacyHeaders: false,  // Menonaktifkan header usang X-RateLimit-*
```

Header yang disertakan dalam setiap respons HTTP:

1. `RateLimit-Limit`: Jumlah maksimum request yang diizinkan dalam satu window (misal: `300`).
2. `RateLimit-Remaining`: Sisa kuota request yang tersisa untuk IP tersebut sebelum terblokir.
3. `RateLimit-Reset`: Waktu dalam detik hingga jendela batas waktu direset kembali ke nol.

---

## 6. Rekomendasi Penanganan di Sisi Frontend

1. **Pendeteksian Status 429:**
   Jika fetch / axios mengembalikan error dengan status HTTP `429`, tampilkan pesan banner atau toast peringatan warna merah kepada user menggunakan `error.message` dari respons backend.
2. **Disable Tombol Sementara:**
   Pada form login atau tombol "Kirim Email Reset", jika terkena 429, tombol dapat dinonaktifkan sementara (*disable*) dan menampilkan countdown berdasarkan header `RateLimit-Reset`.
3. **Hindari Polling Berlebihan:**
   Ketika melakukan pengecekan status pesanan (`/api/payments/status/:orderCode`), gunakan interval polling yang wajar (misal: 3–5 detik sekali) agar tidak memicu `generalLimiter`.
