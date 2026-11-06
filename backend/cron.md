# Cron Job Backend TypoKu

Dokumen ini menjelaskan background scheduler (cron job) yang berjalan di backend TypoKu, sesuai implementasi pada folder `backend/`.

## 1. Ringkasan

Backend memakai `node-cron` untuk dua pekerjaan periodik:

| Job | File | Jadwal | Tugas |
|---|---|---|---|
| Expire subscription & order | `jobs/expireSubscription.js` | Setiap 1 menit (`* * * * *`) | Menandai langganan dan pesanan yang sudah melewati batas waktu menjadi `expired`. |
| Rekonsiliasi pembayaran | `jobs/reconcilePayments.js` | Setiap 5 menit (`*/5 * * * *`) | Memeriksa ulang pesanan `expired` yang masih dalam jendela rekonsiliasi dan memulihkannya menjadi `paid` bila Midtrans menyatakan pembayaran berhasil. |

Keduanya diinisialisasi saat server start di `server.js`:

```js
const initExpireSubscriptionJob = require('./jobs/expireSubscription');
const initReconcilePaymentsJob = require('./jobs/reconcilePayments');

// setelah middleware dan route dipasang
initExpireSubscriptionJob();
initReconcilePaymentsJob();
```

Dependensi yang dipakai: `node-cron` dan pool MySQL2 dari `confiq/database.js`.

## 2. Job 1 — Expire Subscription & Order

**File:** `jobs/expireSubscription.js`  
**Jadwal:** setiap 1 menit.

### 2.1 Langganan

```sql
UPDATE user_subscriptions
SET status = 'expired'
WHERE status = 'active'
  AND expired_at <= NOW()
```

Semua langganan aktif yang waktu `expired_at`-nya sudah lewat langsung diubah menjadi `expired`.

### 2.2 Pesanan

```sql
UPDATE orders
SET status = 'expired'
WHERE status = 'pending'
  AND expired_at <= DATE_SUB(NOW(), INTERVAL 2 MINUTE)
```

Pesanan `pending` diberi grace period 2 menit setelah `expired_at` sebelum diubah menjadi `expired`. Grace ini memberi kesempatan webhook atau pengecekan status pembayaran terakhir untuk masuk terlebih dahulu.

### 2.3 Log

- `[CRON] N langganan berhasil diperbarui menjadi expired.` jika ada subscription yang berubah.
- `[CRON] N pesanan kedaluwarsa diperbarui menjadi expired.` jika ada order yang berubah.
- `[CRON ERROR] Gagal memperbarui status expired: ...` jika query gagal.
- Saat startup: `[CRON] Background scheduler untuk langganan & pesanan expired aktif (interval: 1 menit)`.

## 3. Job 2 — Rekonsiliasi Pembayaran

**File:** `jobs/reconcilePayments.js`  
**Jadwal:** setiap 5 menit.

### 3.1 Kandidat pesanan

Job mengambil maksimal 20 pesanan `expired` yang masih berada dalam jendela rekonsiliasi:

```sql
SELECT
  o.id,
  o.order_code,
  o.user_id,
  o.package_id,
  o.package_name,
  o.package_price,
  o.duration_days,
  o.total_amount,
  o.status,
  o.expired_at,
  o.created_at
FROM orders o
JOIN payment_transactions pt ON pt.order_id = o.id
WHERE o.status = 'expired'
  AND o.expired_at >= DATE_SUB(NOW(), INTERVAL ? MINUTE)
  AND pt.transaction_status NOT IN ('settlement', 'expire', 'cancel', 'deny')
ORDER BY o.expired_at ASC
LIMIT 20
```

Nilai `?` berasal dari `PAYMENT_RECONCILE_MINUTES` (default 60 menit). Hanya pesanan dengan transaksi yang belum final yang diperiksa ulang.

### 3.2 Proses

Untuk setiap kandidat, job memanggil `syncOrderWithMidtrans(order)` dari `controllers/paymentController.js`. Jika Midtrans menyatakan status `paid`, pesanan dipulihkan dan subscription diaktifkan sesuai aturan di controller. Jika status masih `pending`, pesanan dibiarkan `expired`.

Job memakai guard `isRunning` agar eksekusi berikutnya tidak tumpang tindih bila proses sebelumnya belum selesai.

### 3.3 Log

- `[RECONCILE] Gagal rekonsiliasi pesanan <order_code>: ...` per pesanan yang gagal.
- `[RECONCILE] N pesanan expired berhasil dipulihkan menjadi paid.` jika ada yang berhasil.
- `[RECONCILE ERROR] Gagal menjalankan rekonsiliasi pesanan: ...` jika query utama gagal.
- Saat startup: `[CRON] Background scheduler rekonsiliasi pembayaran aktif (interval: 5 menit, window: N menit)`.

## 4. Environment Variable

| Variabel | Default | Fungsi |
|---|---|---|
| `PAYMENT_RECONCILE_MINUTES` | `60` | Jendela waktu (menit) setelah `orders.expired_at` yang masih boleh direkonsiliasi. |

Nilai dibaca di `controllers/paymentController.js` sebagai `RECONCILE_WINDOW_MINUTES` dan dipakai juga oleh endpoint `GET /api/payments/status/:orderCode`.

## 5. Hubungan dengan Endpoint Pembayaran

- Webhook `POST /api/payments/notification` dapat mengubah order menjadi `paid` lebih dulu.
- Endpoint status dapat merekonsiliasi order `expired` selama masih dalam jendela rekonsiliasi.
- Cron rekonsiliasi adalah lapisan cadangan agar pembayaran yang terlewat tetap pulih tanpa menunggu pengguna membuka halaman status.
- Cron expire memastikan subscription dan order tidak menggantung selamanya.

## 6. Cara Memeriksa

Jalankan backend:

```bash
npm run dev
```

Perhatikan log startup. Kedua job akan langsung aktif dan mencetak pesan `[CRON] ... aktif`.

Contoh pengujian aman di database:

1. Buat order uji dengan `expired_at` lebih lama dari 2 menit dan status `pending`.
2. Tunggu maksimal 1 menit, lalu cek `orders.status` berubah menjadi `expired`.
3. Buat subscription uji dengan `expired_at` di masa lalu dan status `active`.
4. Tunggu maksimal 1 menit, lalu cek `user_subscriptions.status` berubah menjadi `expired`.
5. Untuk rekonsiliasi, siapkan order `expired` dalam jendela 60 menit dengan transaksi Midtrans yang valid, lalu tunggu siklus 5 menit.

## 7. Catatan Operasional

- `node-cron` memakai zona waktu server. Pastikan zona waktu server konsisten dengan `NOW()` di MySQL, atau set `TZ` bila diperlukan.
- Cron berjalan di proses Node.js yang sama dengan API. Jika backend dijalankan lebih dari satu instance, setiap instance akan menjalankan cron. Untuk deployment multi-instance, gunakan satu instance scheduler atau mekanisme lock terpisah.
- Job tidak menangani error dengan crash; error dicatat ke console dan server tetap berjalan.
- Jangan mengubah jadwal tanpa menyesuaikan dokumentasi ini dan `AGENTS.md`.
