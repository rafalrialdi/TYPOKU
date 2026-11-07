# Alur Pembayaran & Langganan (Frontend)

Dokumen ini menjelaskan implementasi halaman paket, checkout, status pembayaran, dan integrasi Midtrans Snap di frontend TypoKu.

## 1. Rute

| Rute | Akses | Komponen |
| --- | --- | --- |
| `/paket` | Publik | `pages/Paket.jsx` |
| `/checkout/:packageId` | Login wajib | `pages/Checkout.jsx` |
| `/pembayaran/lunas/:orderCode` | Login wajib | `pages/PembayaranLunas.jsx` |
| `/pembayaran/expired/:orderCode` | Login wajib | `pages/PembayaranExpired.jsx` |

Rute yang memerlukan login dibungkus `RequireAuth` di `App.jsx`. Pengguna yang belum masuk diarahkan ke `/login?redirect=<rute-asal>`.

## 2. Alur Utama

1. **Pilih paket** — `/paket` mengambil `GET /api/packages` (publik) dan menampilkan skeleton saat memuat.
2. **Checkout** — `/checkout/:packageId` mengambil daftar paket dan `GET /api/payments/config` (biaya admin + environment Midtrans).
3. **Buat pesanan** — tombol bayar memanggil `POST /api/orders` dengan `{ packageId, paymentMethod: 'qris' }`. Checkout hanya menyediakan QRIS.
4. **Buka Snap** — `loadSnap(clientKey, isProduction)` memuat `snap.js` sesuai environment, lalu `openSnap(snapToken, callbacks)`.
5. **Polling** — `usePaymentPolling` memanggil `GET /api/payments/status/:orderCode` setiap 5 detik selama status `pending`.
6. **Redirect** — status `paid` diarahkan ke `/pembayaran/lunas/:orderCode`; `expired`, `failed`, atau `cancelled` diarahkan ke `/pembayaran/expired/:orderCode`.
7. **Halaman hasil** — memverifikasi ulang status. Jika status tidak sesuai rute, halaman melakukan redirect silang.

## 3. Endpoint yang Digunakan

- `GET /api/packages` — daftar paket aktif.
- `GET /api/payments/config` — `{ admin_fee, payment_methods, midtrans_is_production }` (publik, tanpa rahasia).
- `POST /api/orders` — membuat order dan Snap token; mengembalikan `order`, `snap_token`, `redirect_url`, `client_key`.
- `GET /api/orders/:orderCode` — detail order + `can_reopen`, `snap_token`, `client_key` saat masih pending.
- `GET /api/orders/my` — riwayat transaksi untuk dropdown profil.
- `GET /api/payments/status/:orderCode` — status terkini, `can_reopen`, `snap_token` saat pending, `client_key`, `midtrans_is_production`.
- `POST /api/payments/notification` — webhook Midtrans (tidak dipanggil frontend).

## 4. Resume Pembayaran

- Setelah order berhasil dibuat, kode order disimpan di `sessionStorage` dengan kunci `typoku_pending_order_<packageId>`.
- Saat halaman checkout dibuka kembali, kode order dipulihkan dan diverifikasi lewat `GET /api/orders/:orderCode`.
- Jika `can_reopen = true` dan status masih `pending`, tombol berubah menjadi **Lanjutkan Pembayaran** dan Snap dibuka dengan token yang sama.
- Jika order sudah tidak pending, data `sessionStorage` dihapus.
- Halaman status pending juga dapat melanjutkan pembayaran memakai `snap_token` dari response status.

## 5. Polling

`hooks/usePaymentPolling.js`:

- Interval default 5 detik.
- Berhenti otomatis saat status final (`paid`, `expired`, `failed`, `cancelled`) atau saat komponen dibongkar.
- Callback tersedia: `onPaid`, `onExpired`, `onFailed`.
- Di halaman status pending, polling dibatasi maksimal 3 menit. Setelah berhenti, pengguna dapat menekan **Cek Status Sekarang**.
- Saat popup Snap ditutup, polling dihentikan sampai pengguna mencoba lagi.

## 6. Environment Midtrans

Client key sandbox tidak selalu diawali `SB-`. Karena itu penentuan environment tidak boleh hanya mengandalkan prefix key.

- Backend mengirim `midtrans_is_production` pada config dan status pembayaran.
- `utils/snap.js` memilih URL sandbox/production dari nilai tersebut.
- Fallback prefix `SB-` hanya dipakai jika nilai environment tidak tersedia.

## 7. Zona Waktu

- Koneksi MySQL memakai `timezone: 'Z'` karena server database berjalan pada UTC.
- Waktu dari Midtrans (`settlement_time`, `transaction_time`) berformat WIB tanpa offset. `parseMidtransTime` mengubahnya menjadi `Date` dengan offset `+07:00` sebelum disimpan.
- Frontend menampilkan waktu dengan `Intl.DateTimeFormat` zona `Asia/Jakarta` dan label `WIB`.

## 8. Aturan Loading

- **GET** — memakai skeleton shimmer melalui `useApiGet` + `Skeleton`. Halaman menampilkan skeleton saat `loading` agar tidak salah menampilkan empty state atau redirect sebelum data siap.
- **POST** — tombol `Bayar Sekarang` memakai `useSubmit`: guard klik ganda, `disabled`, `aria-busy`, opacity berkurang, dan selalu berakhir di blok `finally`.
- Tombol resume dan cek status juga dilindungi guard agar tidak memicu aksi ganda.

## 9. Komponen & Berkas Terkait

- `src/pages/Paket.jsx`, `paket.css`
- `src/pages/Checkout.jsx`, `checkout.css`
- `src/pages/PembayaranLunas.jsx`, `PembayaranExpired.jsx`, `payment.css`
- `src/hooks/useApiGet.js`, `useSubmit.js`, `usePaymentPolling.js`
- `src/services/paymentApi.js`, `apiClient.js`
- `src/utils/snap.js`
- `src/context/AuthContext.jsx` — memuat riwayat transaksi saat login
- `src/components/Navbar.jsx` — dropdown profil dan riwayat transaksi

## 10. Pengujian

Pengujian end-to-end yang sudah dilakukan:

- `GET /api/packages` → 200.
- `GET /api/payments/config` → 200 dengan `admin_fee` dan `midtrans_is_production`.
- Register, login, dan pembuatan order QRIS → 201.
- Detail order segar memiliki `can_reopen = true`.
- Status pending, expired, dan paid dapat dibaca dengan benar.
- `GET /api/orders/my` memuat order terbaru.
- Snap Sandbox terbuka dan menampilkan QRIS.
- Simulasi pembayaran paid saat popup terbuka memicu polling dan redirect otomatis ke halaman lunas.
- Halaman lunas, kedaluwarsa, dan pending sudah diperiksa pada viewport desktop dan mobile.
- Data uji dibersihkan setelah pengujian.
