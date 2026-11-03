# Panduan Integrasi Payment Gateway (Midtrans) — TypoKu Backend

Dokumen ini mendokumentasikan secara menyeluruh arsitektur, konfigurasi, skema data, alur transaksi, kebijakan langganan (*replace policy*), rekonsiliasi otomatis, serta tata cara pengujian payment gateway menggunakan **Midtrans Snap & Core API** pada backend TypoKu.

---

## 1. Arsitektur & Gambaran Umum

Backend TypoKu menggunakan **Midtrans Payment Gateway** dalam mode **Snap** (frontend checkout popup/redirect) dan **Core API** (pengecekan status & rekonsiliasi).

- **Snap API:** Digunakan saat user memilih paket untuk menghasilkan `snap_token` dan `redirect_url`.
- **Webhook Notification:** Endpoint publik yang menerima notifikasi HTTP POST dari Midtrans secara asinkron saat transaksi berubah status (misal: pembayaran QRIS sukses).
- **Core API:** Digunakan oleh endpoint status client (`GET /api/payments/status/:orderCode`) dan cron rekonsiliasi berkala untuk sinkronisasi proaktif ke Midtrans.

---

## 2. Variabel Lingkungan (.env)

Konfigurasi payment gateway diatur melalui berkas `.env`:

```env
# Mode Midtrans (false = Sandbox, true = Production)
MIDTRANS_IS_PRODUCTION=false

# Kredensial API Midtrans
MIDTRANS_SERVER_KEY=SB-Mid-server-xxxxxxxxxxxxxxxxx
MIDTRANS_CLIENT_KEY=Mid-client-xxxxxxxxxxxxxxxxx

# Metode pembayaran yang diizinkan (dipisahkan koma)
PAYMENT_METHODS=qris,dana,ovo

# Biaya administrasi tetap per transaksi (dalam Rupiah)
ADMIN_FEE=700

# Jendela rekonsiliasi pesanan expired (dalam menit)
PAYMENT_RECONCILE_MINUTES=60
```

> **Catatan Keamanan:** `MIDTRANS_SERVER_KEY` adalah rahasia server dan tidak boleh diekspos ke frontend, repo git, maupun log publik.

---

## 3. Skema Data & Relasi Database

### 3.1 Diagram Hubungan Antar-Tabel

```text
users (id)
  ▲
  │ 1:N
  │
orders (id, user_id, package_id, total_amount, status)
  ▲                       ▲
  │ 1:1                   │ 1:1
  │                       │
payment_transactions    user_subscriptions
(order_id, snap_token,  (user_id, order_id, package_id,
 transaction_status)     status, started_at, expired_at)
```

### 3.2 Penjelasan Tabel

1. **`packages` (Master Data):**
   - Berisi paket langganan aktif: `CEPAT` (1 hari / Rp3.000), `PRO` (30 hari / Rp10.000), `PRO_PLUS` (90 hari / Rp25.000).
2. **`orders` (Transaksi Bisnis):**
   - Mengunci snapshot nama paket (`package_name`), harga (`package_price`), biaya admin (`admin_fee`), total bayar (`total_amount`), durasi (`duration_days`), dan status bisnis (`pending`, `paid`, `expired`, `failed`, `cancelled`).
   - Batas waktu pembayaran standar: **15 menit** dari waktu pembuatan (`DATE_ADD(NOW(), INTERVAL 15 MINUTE)`).
3. **`payment_transactions` (Cermin Gateway Midtrans):**
   - Berisi data teknis gateway: `snap_token`, `payment_method`, `gross_amount`, `midtrans_transaction_id`, dan status mentah gateway `transaction_status`.
   - **Tabel ini tidak memiliki kolom `user_id`**; kepemilikan selalu divalidasi dengan `JOIN` ke tabel `orders` lewat `orders.id = payment_transactions.order_id`.
4. **`user_subscriptions` (Hak Akses Pengguna):**
   - Catatan langganan aktif pengguna yang mengizinkan pemakaian fitur AI (`/api/cek-typo`, `/api/parafrase`, `/api/terjemah`).

---

## 4. Perbedaan Kosakata Status: `settlement` vs `paid`

Di TypoKu terdapat pemisahan tegas antara status **bisnis internal** dan status **teknis vendor**:

| Tabel & Kolom | Bahasa / Pemilik | Nilai-Nilai Status |
|---|---|---|
| `orders.status` | **Bisnis TypoKu** | `pending`, `paid`, `expired`, `failed`, `cancelled` |
| `payment_transactions.transaction_status` | **Mentah Midtrans** | `pending`, `settlement`, `capture`, `expire`, `cancel`, `deny`, `challenge` |

### Tabel Pemetaan Status

| Status Mentah Midtrans | Fraud Status | `orders.status` | `payment_transactions` | Arti bagi Pengguna |
|---|---|---|---|---|
| `settlement` | - | `paid` | `settlement` | Lunas, paket aktif |
| `capture` | `accept` | `paid` | `settlement` | Lunas (Kartu Kredit) |
| `capture` | `challenge` | `pending` | `challenge` | Ditinjau oleh Midtrans |
| `pending` | - | `pending` | `pending` | Menunggu pembayaran |
| `expire` | - | `expired` | `expire` | Waktu bayar habis |
| `cancel` / `deny` | - | `failed` | `cancel` / `deny` | Pembayaran gagal/batal |

> **Mengapa `transaction_status` memakai `settlement` bukan `paid`?**
> Kolom ini sengaja menyimpan status asli dari Midtrans apa adanya agar audit rekonsiliasi, pengecekan log, dan sinkronisasi webhook tetap presisi dan tidak membingungkan saat mencocokkan respon Midtrans.

---

## 5. Alur Transaksi End-to-End

### 5.1 Checkout / Pembuatan Pesanan (`POST /api/orders`)
1. User terautentikasi mengirim `package_id` dan `payment_method` (contoh: `qris`, `dana`, `ovo`).
2. Server mengambil harga dan durasi resmi langsung dari tabel `packages` (tidak mempercayai harga dari client).
3. Menghitung total: `total_amount = package_price + ADMIN_FEE` (misal Rp10.000 + Rp700 = Rp10.700).
4. Membuat transaksi ke Midtrans Snap dengan rincian `item_details` (baris paket + baris biaya admin) sehingga jumlah item cocok persis dengan `gross_amount`.
5. Dalam transaksi database (`BEGIN TRANSACTION`):
   - `INSERT INTO orders` dengan status `pending` dan `expired_at = NOW() + 15 menit`.
   - `INSERT INTO payment_transactions` dengan status `pending` dan menyimpan `snap_token`.
6. Mengembalikan `order_code`, `snap_token`, dan `redirect_url` ke frontend.

### 5.2 Pembayaran oleh Pengguna
- Frontend membuka popup Midtrans Snap menggunakan `snap.pay(snapToken)` atau redirect.
- User menyelesaikan pembayaran via QRIS simulator, e-wallet sandbox, atau VA.

### 5.3 Webhook Notification (`POST /api/payments/notification`)
1. **Bypass Pengujian Dashboard:** Jika `order_id` berawalan `payment_notif_test_`, server langsung membalas HTTP 200 tanpa mengubah database.
2. **Verifikasi Signature:** Server memvalidasi hash SHA-512:
   $$\text{SHA512}(\text{order\_id} + \text{status\_code} + \text{gross\_amount} + \text{MIDTRANS\_SERVER\_KEY})$$
   Jika tidak cocok, request ditolak dengan HTTP 400.
3. **Idempotensi:** Jika `orders.status` sudah `paid`, webhook langsung mengembalikan respons sukses tanpa memproses ulang.
4. **Eksekusi:** Jika status adalah `settlement` (atau `capture` + `accept`), server memanggil fungsi terpusat `applyPaymentSettlement()`.

### 5.4 Cek Status Frontend (`GET /api/payments/status/:orderCode`)
- Frontend polling atau memanggil endpoint ini setelah popup Snap ditutup.
- Memeriksa kepemilikan pesanan (`WHERE o.order_code = ? AND o.user_id = ?`).
- Jika pesanan masih `pending` atau berstatus `expired` tetapi masih berada di dalam jendela rekonsiliasi (60 menit), server melakukan verifikasi langsung ke Midtrans Core API (`syncOrderWithMidtrans`).

---

## 6. Kebijakan Langganan (*Replace Policy*) & Guard Benturan

Ketika pembayaran sukses dikonfirmasi via `applyPaymentSettlement()`, seluruh proses dieksekusi dalam **satu transaksi database atomik**:

```text
Midtrans settlement
       ↓
BEGIN TRANSACTION
  1. UPDATE orders SET status = 'paid', paid_at = NOW()
  2. UPDATE payment_transactions SET transaction_status = 'settlement'
  3. Cek guard benturan: apakah ada subscription aktif yang lebih baru?
       ├─ YA  → Lewati aktivasi paket (order tetap paid)
       └─ TIDAK → Batalkan paket aktif lama (status = 'cancelled')
                  INSERT subscription baru (aktif dari NOW() s.d. NOW() + duration_days)
COMMIT
```

### 6.1 Keputusan Bisnis: Replace (Bukan Akumulasi)
- **Aturan:** Setiap pembelian paket baru yang berhasil akan **langsung aktif saat itu juga** (`started_at = NOW()`).
- Paket aktif lama milik user diubah statusnya menjadi `'cancelled'`.
- **Konsekuensi:** Sisa hari dari paket lama **hangus** (tidak ditambahkan/diakumulasikan). Contoh: Sisa 1 hari paket Cepat, lalu membeli Pro 30 hari → status Cepat batal, Pro aktif 30 hari ke depan.

### 6.2 Guard Benturan Transaksi Telat (`hasNewerActiveSubscription`)

Guard di `controllers/paymentController.js` melindungi user dari kondisi pembayaran order lama yang datang terlambat:

```javascript
const hasNewerActiveSubscription =
  activeSubscriptions.length > 0 &&
  activeSubscriptions[0].order_id !== order.id &&
  new Date(activeSubscriptions[0].created_at) > new Date(order.created_at);
```

#### Studi Kasus Mengapa Guard Ini Sangat Penting:
1. Pukul 10:00: User membuat Order A (paket Cepat 1 hari), tetapi lupa membayar. Order A kedaluwarsa pukul 10:15.
2. Pukul 10:30: User membuat Order B (paket Pro 30 hari) dan langsung membayar lunas. Paket Pro aktif 30 hari.
3. Pukul 11:00: Webhook terlambat untuk Order A masuk atau cron rekonsiliasi mendeteksi pembayaran Order A masuk di Midtrans.
4. **Tanpa Guard:** Order A akan membatalkan paket Pro 30 hari user dan menimpanya dengan paket Cepat 1 hari! (Kerugian besar bagi pengguna).
5. **Dengan Guard:** Server mendeteksi bahwa paket Pro yang sedang aktif dibuat lebih baru daripada Order A. Maka:
   - Order A ditandai `paid` (pencatatan uang masuk tetap valid).
   - `payment_transactions` Order A ditandai `settlement`.
   - Paket Pro **tetap aktif**, dan paket Cepat untuk Order A **tidak diaktifkan**.

---

## 7. Sistem Rekonsiliasi & Cron Job

Backend TypoKu memiliki dua cron job otomatis:

### 7.1 `jobs/expireSubscription.js` (Interval: Setiap 1 Menit)
- Memperbarui subscription aktif yang melewati `expired_at <= NOW()` menjadi `status = 'expired'`.
- Memperbarui pesanan `pending` yang melewati `expired_at <= DATE_SUB(NOW(), INTERVAL 2 MINUTE)` menjadi `status = 'expired'` (diberikan grace period 2 menit).

### 7.2 `jobs/reconcilePayments.js` (Interval: Setiap 5 Menit)
- Mencari maksimal 20 pesanan berstatus `expired` yang kedaluwarsa dalam rentang `PAYMENT_RECONCILE_MINUTES` (default 60 menit) dan belum berstatus akhir di Midtrans (`NOT IN ('settlement', 'expire', 'cancel', 'deny')`).
- Memeriksa status sebenarnya ke Midtrans Core API secara berurutan.
- Jika Midtrans menyatakan transaksi sebenarnya telah dibayar (`settlement`), pesanan dipulihkan secara otomatis menjadi `paid` dan langganan diaktifkan (selama tidak terbentur guard).

---

## 8. Mengambil Riwayat Transaksi per User

Karena tabel `payment_transactions` tidak menyimpan `user_id`, pengambilan data riwayat transaksi user dilakukan lewat relasi `orders`:

```sql
SELECT
    o.id,
    o.order_code,
    o.package_name,
    o.total_amount,
    o.status,
    o.created_at,
    o.expired_at,
    o.paid_at,
    pt.payment_method,
    pt.transaction_status AS midtrans_status
FROM orders o
LEFT JOIN payment_transactions pt ON pt.order_id = o.id
WHERE o.user_id = ?
ORDER BY o.created_at DESC;
```

Endpoint ini sudah tersedia dan aktif di:
- **`GET /api/orders/my`** (memerlukan header `Authorization: Bearer <token>`).

---

## 9. Panduan Pengujian Lokal (Sandbox + Ngrok)

Karena server lokal (`localhost:8000`) tidak dapat dihubungi langsung oleh Midtrans Sandbox di internet, gunakan tunnel **Ngrok**:

1. Jalankan backend:
   ```bash
   npm run dev
   ```
2. Di terminal terpisah, buka tunnel:
   ```bash
   ngrok http 8000
   ```
3. Salin URL HTTPS yang dihasilkan Ngrok (misal: `https://xxxx-xxxx.ngrok-free.dev`).
4. Buka **Midtrans Merchant Administration Portal (MAP) Sandbox**:
   - Menu: **Settings** > **Configuration**.
   - Isi **Payment Notification URL**: `https://xxxx-xxxx.ngrok-free.dev/api/payments/notification`.
   - Klik **Save Changes**.
5. Gunakan **Midtrans Simulator** (misal QRIS Simulator) untuk mensimulasikan pembayaran sukses.
6. Pantau traffic webhook yang masuk melalui terminal backend atau web inspeksi Ngrok di `http://127.0.0.1:4040`.
