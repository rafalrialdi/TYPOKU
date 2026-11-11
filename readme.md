# TypoKu — Asisten Penulisan Akademik AI

TypoKu adalah platform asisten penulisan berbasis kecerdasan buatan untuk membantu mahasiswa, dosen, dan akademisi menyempurnakan naskah akademik: memeriksa typo dan ejaan, memparafrase, serta menerjemahkan naskah.

Dokumen ini menjelaskan cara menjalankan proyek, seluruh variabel lingkungan yang dibutuhkan frontend dan backend, dan query SQL untuk membuat struktur database.

---

## Daftar Isi

- [Fitur](#fitur)
- [Teknologi](#teknologi)
- [Struktur Direktori](#struktur-direktori)
- [Prasyarat](#prasyarat)
- [Menjalankan Proyek](#menjalankan-proyek)
- [Environment Variables](#environment-variables)
  - [Frontend](#frontend)
  - [Backend](#backend)
- [Struktur Database](#struktur-database)
- [Deploy](#deploy)
- [Catatan Keamanan](#catatan-keamanan)

---

## Fitur

| Fitur | Deskripsi |
|---|---|
| **Cek Typo** | Mendeteksi dan memperbaiki salah ketik/ejaan. Mendukung unggah PDF, DOCX, TXT (maks. 5 MB) atau teks langsung. |
| **Parafrase** | Menyusun ulang kalimat dengan gaya akademik tanpa mengubah makna. |
| **Terjemah** | Menerjemahkan naskah akademik dua arah (Indonesia ↔ Inggris). |
| **Unduh Hasil** | Hasil pemeriksaan/parafrase dapat diunduh sebagai PDF atau TXT. |
| **Akun** | Registrasi email + kata sandi, login Google, reset kata sandi lewat email. |
| **Langganan** | Paket Cepat/Pro/Pro Plus, pembayaran Midtrans (QRIS, DANA, OVO). |
| **Halaman Legal** | Syarat & Ketentuan dan Kebijakan Privasi (publik, tanpa login). |

---

## Teknologi

### Frontend

- **React 19** + **Vite 8**
- **React Router DOM 7** — routing
- **TanStack Query 5** — data fetching, cache, dan persistensi
- **React Hook Form** + **Zod** — form dan validasi
- **React Icons** — ikon
- **CSS** — styling dan responsivitas
- **Google Identity Services** — login Google

### Backend

- **Node.js** + **Express 5**
- **MySQL 8** (`mysql2`) — database
- **JWT** (`jsonwebtoken`) + **bcryptjs** — autentikasi
- **Google Gemini API** (`@google/genai`) — mesin AI
- **Midtrans** — pembayaran
- **Nodemailer** — email transaksional (reset kata sandi)
- **Multer**, **pdf-parse**, **mammoth**, **pdfkit** — unggah dan ekstraksi dokumen
- **Helmet**, **CORS**, **Morgan**, **express-rate-limit** — keamanan dan logging
- **node-cron** — penjadwal kedaluwarsa langganan dan rekonsiliasi pembayaran

---

## Struktur Direktori

```text
typoku/
├── frontend/
│   ├── public/                  # Aset statis dan favicon
│   ├── src/
│   │   ├── assets/              # Gambar dan logo
│   │   ├── components/          # Komponen UI yang dapat dipakai ulang
│   │   ├── context/             # Context React (autentikasi)
│   │   ├── hooks/               # Custom hooks
│   │   ├── layouts/             # Layout halaman (auth, main)
│   │   ├── lib/                 # Konfigurasi React Query
│   │   ├── pages/               # Halaman aplikasi
│   │   ├── services/            # Klien API dan manajemen sesi
│   │   └── utils/               # Helper
│   ├── vercel.json              # Rewrite SPA untuk Vercel
│   ├── .env                     # Variabel lingkungan frontend (tidak di-commit)
│   └── package.json
│
├── backend/
│   ├── confiq/                  # Konfigurasi koneksi database
│   ├── controllers/             # Logika endpoint
│   ├── jobs/                    # Cron job (kedaluwarsa, rekonsiliasi)
│   ├── middleware/              # Autentikasi, subscription, rate limit
│   ├── routes/                  # Definisi rute API
│   ├── utils/                   # Mailer, Midtrans, token, response
│   ├── ca.pem                   # CA untuk TLS database
│   ├── .env                     # Variabel lingkungan backend (tidak di-commit)
│   ├── package.json
│   └── server.js                # Entry point Express
│
├── .gitignore
└── readme.md
```

---

## Prasyarat

- **Node.js** v20 atau lebih baru (disarankan LTS terbaru)
- **npm** v10 atau lebih baru
- **Git** v2 atau lebih baru
- **MySQL** 8 (lokal atau layanan terkelola seperti Aiven)

---

## Menjalankan Proyek

### 1. Clone repositori

```bash
git clone https://github.com/rafalrialdi/TYPOKU.git
cd TYPOKU
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend berjalan di `http://localhost:5173`.

Perintah lain:

```bash
npm run build     # build produksi ke folder dist/
npm run preview   # pratinjau hasil build
```

### 3. Backend

```bash
cd backend
npm install
npm run dev       # nodemon, auto-reload
# atau
npm start         # mode produksi
```

Backend berjalan di `http://localhost:8000`.

### 4. Buat database

Jalankan query pada bagian [Struktur Database](#struktur-database) menggunakan MySQL client, phpMyAdmin, atau DBeaver. Setelah itu isi variabel `DB_*` di `backend/.env`.

### 5. Sesuaikan environment

Salin nilai contoh pada bagian [Environment Variables](#environment-variables) ke:

- `frontend/.env`
- `backend/.env`

Pastikan `GOOGLE_CLIENT_ID` (backend) dan `VITE_GOOGLE_CLIENT_ID` (frontend) berisi **Client ID yang sama**.

---

## Environment Variables

### Frontend

Buat file `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_GOOGLE_CLIENT_ID=xxxxxxxxxxxx.apps.googleusercontent.com
```

| Variabel | Wajib | Contoh | Keterangan |
|---|---|---|---|
| `VITE_API_BASE_URL` | Ya | `http://localhost:8000` | Base URL backend. Saat deploy, ganti dengan URL backend produksi (HTTPS). |
| `VITE_GOOGLE_CLIENT_ID` | Ya (untuk login Google) | `xxxx.apps.googleusercontent.com` | Client ID OAuth dari Google Cloud Console. Harus sama dengan `GOOGLE_CLIENT_ID` di backend. |

> Variabel berawalan `VITE_` akan tertanam di bundle frontend. Jangan pernah menaruh secret di sini.

### Backend

Buat file `backend/.env`:

```env
# Server
PORT=8000
NODE_ENV=development
APP_URL=http://localhost:5173

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=typoku
DB_SSL=false
DB_SSL_CA=ca.pem

# Autentikasi
JWT_SECRET=ganti-dengan-string-acak-panjang
JWT_EXPIRES_IN=7d
GOOGLE_CLIENT_ID=xxxxxxxxxxxx.apps.googleusercontent.com

# Reset kata sandi
RESET_TOKEN_TTL_MINUTES=60

# Email (Brevo HTTP API — jalur utama)
BREVO_API_KEY=xkeysib-xxxxxxxxxxxxxxxx
MAIL_FROM_EMAIL=alamat@domain-anda.com
MAIL_FROM_NAME=TypoKu

# Email (SMTP — fallback lokal, hanya dipakai bila BREVO_API_KEY kosong)
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=alamat@gmail.com
# SMTP_PASS=app-password
# MAIL_FROM="TypoKu <alamat@gmail.com>"

# Gemini AI
GEMINI_API_KEY=AIza...
GEMINI_MODEL=gemini-3.8-flash
GEMINI_MODEL_FALLBACKS=gemini-3.6-flash,gemini-3.5-flash,gemini-3.5-flash-lite,gemini-3.7-flash,gemini-flash-latest
GEMINI_MODEL_COOLDOWN_MS=300000
GEMINI_TYPO_TIMEOUT_MS=60000
GEMINI_TEXT_TIMEOUT_MS=30000

# Midtrans
MIDTRANS_SERVER_KEY=SB-Mid-server-xxxxxxxx
MIDTRANS_CLIENT_KEY=SB-Mid-client-xxxxxxxx
MIDTRANS_IS_PRODUCTION=false
PAYMENT_METHODS=qris,dana,ovo
PAYMENT_RECONCILE_MINUTES=60
ADMIN_FEE=700
```

| Variabel | Wajib | Default | Keterangan |
|---|---|---|---|
| `PORT` | Tidak | `8000` | Port server Express. |
| `NODE_ENV` | Tidak | `development` | Mode aplikasi (`development`/`production`). |
| `APP_URL` | Ya | `http://localhost:5173` | Whitelist CORS **dan** base URL tautan reset password. Beberapa origin dipisah koma. |
| `DB_HOST` | Ya | — | Host MySQL. |
| `DB_PORT` | Tidak | `3306` | Port MySQL. |
| `DB_USER` | Ya | — | User database. |
| `DB_PASSWORD` | Ya | — | Kata sandi database. |
| `DB_NAME` | Ya | — | Nama database. |
| `DB_SSL` | Tidak | `false` | `true` untuk koneksi TLS (wajib untuk Aiven/cloud). |
| `DB_SSL_CA` | Jika SSL | `ca.pem` | Path sertifikat CA. File `ca.pem` harus ada di folder `backend/`. |
| `JWT_SECRET` | Ya | — | Kunci penandatangan JWT. Gunakan string acak panjang. |
| `JWT_EXPIRES_IN` | Tidak | `7d` | Masa berlaku token login. |
| `GOOGLE_CLIENT_ID` | Ya (login Google) | — | Client ID OAuth Google. Harus sama dengan frontend. |
| `RESET_TOKEN_TTL_MINUTES` | Tidak | `60` | Masa berlaku token reset kata sandi (menit). |
| `BREVO_API_KEY` | Ya (reset password) | - | API key Brevo. Jika diisi, email dikirim lewat HTTP API (port 443) sehingga tembus hosting yang memblokir SMTP. |
| `MAIL_FROM_EMAIL` | Ya (jika pakai Brevo) | - | Alamat pengirim. **Wajib** sudah diverifikasi di Brevo (Senders & Domains). |
| `MAIL_FROM_NAME` | Tidak | `TypoKu` | Nama pengirim yang tampil di kotak masuk penerima. |
| `SMTP_HOST` | Tidak | `smtp.gmail.com` | Host SMTP. Hanya dipakai bila `BREVO_API_KEY` kosong. |
| `SMTP_PORT` | Tidak | `587` | Port SMTP fallback. Port `465` memakai koneksi secure. |
| `SMTP_USER` | Tidak | - | Akun SMTP fallback. |
| `SMTP_PASS` | Tidak | - | Kata sandi/app password SMTP fallback. |
| `MAIL_FROM` | Tidak | - | Nama dan alamat pengirim untuk jalur SMTP fallback. |
| `GEMINI_API_KEY` | Ya | — | API key Google Gemini. |
| `GEMINI_MODEL` | Tidak | `gemini-3.8-flash` | Model utama. |
| `GEMINI_MODEL_FALLBACKS` | Tidak | lihat contoh | Daftar model cadangan, dipisah koma. |
| `GEMINI_MODEL_COOLDOWN_MS` | Tidak | `300000` | Jeda model yang terkena rate limit (ms). |
| `GEMINI_TYPO_TIMEOUT_MS` | Tidak | `60000` | Timeout khusus cek typo. |
| `GEMINI_TEXT_TIMEOUT_MS` | Tidak | `30000` | Timeout parafrase/terjemah. |
| `MIDTRANS_SERVER_KEY` | Ya | — | Server key Midtrans (rahasia). |
| `MIDTRANS_CLIENT_KEY` | Ya | — | Client key Midtrans. |
| `MIDTRANS_IS_PRODUCTION` | Tidak | `false` | `false` = Sandbox, `true` = produksi. |
| `PAYMENT_METHODS` | Tidak | `qris,dana,ovo` | Metode pembayaran yang diaktifkan. |
| `PAYMENT_RECONCILE_MINUTES` | Tidak | `60` | Jendela rekonsiliasi pembayaran (menit). |
| `ADMIN_FEE` | Tidak | `700` | Biaya admin tetap per transaksi (Rupiah). |

> **CORS:** backend hanya mengizinkan origin yang terdaftar di `APP_URL`. Saat deploy, isi dengan domain frontend, mis. `APP_URL=https://typoku.vercel.app`. Jika lebih dari satu, pisahkan koma: `https://typoku.vercel.app,https://www.typoku.id`.

---

## Struktur Database

Jalankan query berikut di MySQL. Skema ini mencakup autentikasi, login Google, langganan, pembayaran Midtrans, dan reset kata sandi.

```sql
-- ============================================================
-- Database TypoKu
-- Engine: InnoDB | Charset: utf8mb4
-- ============================================================

CREATE DATABASE IF NOT EXISTS typoku
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE typoku;

SET NAMES utf8mb4;

-- 1. USERS
CREATE TABLE IF NOT EXISTS users (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(190) NOT NULL,
    phone VARCHAR(20) NULL,
    password_hash VARCHAR(255) NULL,
    google_id VARCHAR(255) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_users_email (email),
    UNIQUE KEY uq_users_phone (phone),
    UNIQUE KEY uq_users_google_id (google_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. PACKAGES
CREATE TABLE IF NOT EXISTS packages (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    package_code VARCHAR(50) NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT NULL,
    price DECIMAL(12,2) NOT NULL,
    duration_days INT UNSIGNED NOT NULL,
    billing_label VARCHAR(50) NOT NULL,
    features JSON NOT NULL,
    is_recommended TINYINT(1) NOT NULL DEFAULT 0,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_packages_code (package_code),
    INDEX idx_packages_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. ORDERS
CREATE TABLE IF NOT EXISTS orders (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    order_code VARCHAR(40) NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    package_id BIGINT UNSIGNED NULL,
    package_name VARCHAR(150) NOT NULL,
    package_price DECIMAL(12,2) NOT NULL,
    duration_days INT UNSIGNED NOT NULL,
    admin_fee DECIMAL(12,2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(12,2) NOT NULL,
    status ENUM('pending','paid','expired','cancelled','failed')
        NOT NULL DEFAULT 'pending',
    expired_at DATETIME NOT NULL,
    paid_at DATETIME NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_orders_code (order_code),
    INDEX idx_orders_user (user_id),
    INDEX idx_orders_status_expired (status, expired_at),
    CONSTRAINT fk_orders_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_orders_package
        FOREIGN KEY (package_id) REFERENCES packages(id)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. PAYMENT_TRANSACTIONS
CREATE TABLE IF NOT EXISTS payment_transactions (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    order_id BIGINT UNSIGNED NOT NULL,
    midtrans_order_id VARCHAR(64) NOT NULL,
    midtrans_transaction_id VARCHAR(100) NULL,
    snap_token TEXT NULL,
    payment_method VARCHAR(50) NOT NULL,
    transaction_status VARCHAR(40) NOT NULL DEFAULT 'pending',
    fraud_status VARCHAR(40) NULL,
    gross_amount DECIMAL(12,2) NOT NULL,
    currency CHAR(3) NOT NULL DEFAULT 'IDR',
    midtrans_status_code VARCHAR(10) NULL,
    status_message VARCHAR(255) NULL,
    transaction_time DATETIME NULL,
    settlement_time DATETIME NULL,
    expiry_time DATETIME NOT NULL,
    last_notification_at DATETIME NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_payment_midtrans_order_id (midtrans_order_id),
    INDEX idx_payment_order_id (order_id),
    INDEX idx_payment_transaction_id (midtrans_transaction_id),
    INDEX idx_payment_status_expiry (transaction_status, expiry_time),
    CONSTRAINT fk_payment_order
        FOREIGN KEY (order_id) REFERENCES orders(id)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. USER_SUBSCRIPTIONS
CREATE TABLE IF NOT EXISTS user_subscriptions (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL,
    order_id BIGINT UNSIGNED NOT NULL,
    package_id BIGINT UNSIGNED NOT NULL,
    package_name VARCHAR(150) NOT NULL,
    package_price DECIMAL(12,2) NOT NULL,
    duration_days INT UNSIGNED NOT NULL,
    started_at DATETIME NOT NULL,
    expired_at DATETIME NOT NULL,
    status ENUM('active','expired','cancelled')
        NOT NULL DEFAULT 'active',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_subscription_order (order_id),
    INDEX idx_subscription_user (user_id),
    INDEX idx_subscription_status_expiry (status, expired_at),
    CONSTRAINT fk_subscription_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_subscription_order
        FOREIGN KEY (order_id) REFERENCES orders(id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_subscription_package
        FOREIGN KEY (package_id) REFERENCES packages(id)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. PASSWORD_RESETS
CREATE TABLE IF NOT EXISTS password_resets (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL,
    token_hash CHAR(64) NOT NULL,
    expires_at DATETIME NOT NULL,
    used_at DATETIME NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_password_resets_token (token_hash),
    INDEX idx_password_resets_user (user_id),
    INDEX idx_password_resets_expires (expires_at),
    CONSTRAINT fk_password_resets_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Data awal paket

```sql
INSERT IGNORE INTO packages
    (package_code, name, description, price, duration_days, billing_label, features, is_recommended)
VALUES
    (
        'CEPAT',
        'Cepat',
        'Cocok untuk cek tugas harian dan artikel pendek.',
        3000,
        1,
        '/hari',
        JSON_ARRAY('Parafrase', 'Cek Typo', 'Terjemah'),
        0
    ),
    (
        'PRO',
        'Pro',
        'Paling diminati mahasiswa tingkat akhir, dosen, dan peneliti.',
        10000,
        30,
        '/bulan',
        JSON_ARRAY('Parafrase', 'Cek Typo', 'Terjemah'),
        1
    ),
    (
        'PRO_PLUS',
        'Pro Plus',
        'Untuk tim laboratorium riset, departemen prodi, dan biro jurnal kampus.',
        25000,
        90,
        '/3 bulan',
        JSON_ARRAY('Parafrase', 'Cek Typo', 'Terjemah'),
        0
    );
```

### Verifikasi

```sql
SHOW TABLES;
SELECT package_code, name, price, duration_days, is_active FROM packages;
```

---

## Deploy

### Frontend (Vercel)

1. Import repository ke Vercel.
2. **Root Directory:** `frontend`
3. **Build Command:** `npm run build`
4. **Output Directory:** `dist`
5. Tambahkan environment variable:
   - `VITE_API_BASE_URL` → URL backend produksi (HTTPS)
   - `VITE_GOOGLE_CLIENT_ID` → Client ID OAuth

File `frontend/vercel.json` sudah berisi rewrite SPA agar rute seperti `/login`, `/syarat-ketentuan`, dan `/checkout/:id` tidak menghasilkan 404 saat di-refresh:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Backend

1. Deploy folder `backend/` ke layanan yang mendukung Node.js (Railway, Render, Fly.io, VPS, dsb.).
2. Set seluruh environment variable backend, terutama:
   - `APP_URL=https://domain-frontend-anda`
   - `NODE_ENV=production`
   - `DB_SSL=true` + `ca.pem` jika memakai database cloud
3. Jalankan `npm start`.
4. Daftarkan URL backend sebagai Notification URL Midtrans:
   `https://domain-backend-anda/api/payments/notification`

### Google OAuth

Di Google Cloud Console:

1. **Authorized JavaScript origins** → tambahkan `http://localhost:5173` dan domain frontend produksi.
2. **Authorized redirect URIs** → tambahkan domain frontend produksi.
3. Isi **Privacy Policy URL** dan **Terms of Service URL** dengan halaman `/kebijakan-privasi` dan `/syarat-ketentuan`.
4. Setelah domain publik aktif, klik **Publish app**.

---

## Catatan Keamanan

- File `.env` **tidak boleh** di-commit. Pastikan hanya `.env.example` (tanpa nilai rahasia) yang masuk repositori.
- `MIDTRANS_SERVER_KEY`, `GEMINI_API_KEY`, `JWT_SECRET`, `BREVO_API_KEY`, dan `SMTP_PASS` bersifat rahasia - jangan pernah ditaruh di frontend.
- `VITE_*` akan terlihat publik di bundle. Hanya isi dengan nilai yang memang publik (URL API dan Client ID OAuth).
- Autentikasi memakai **Bearer JWT** di header `Authorization`, bukan cookie. Karena itu CORS tidak mengaktifkan `credentials`.
- Rate limit aktif untuk request umum, login, lupa password, dan pembuatan order.
- Webhook Midtrans diverifikasi dengan signature SHA-512 sebelum mengubah status pembayaran.
