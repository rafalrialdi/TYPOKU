const cron = require('node-cron');
const db = require('../confiq/database');

function initExpireSubscriptionJob() {
  // Berjalan setiap 1 menit
  cron.schedule('* * * * *', async () => {
    try {
      // 1. Perbarui masa aktif langganan pengguna
      const [subResult] = await db.query(
        `UPDATE user_subscriptions
         SET status = 'expired'
         WHERE status = 'active'
           AND expired_at <= NOW()`
      );

      if (subResult.affectedRows > 0) {
        console.log(`[CRON] ${subResult.affectedRows} langganan berhasil diperbarui menjadi expired.`);
      }

      // 2. Perbarui pesanan yang belum dibayar dan sudah lewat batas waktu (grace 2 menit)
      const [orderResult] = await db.query(
        `UPDATE orders
         SET status = 'expired'
         WHERE status = 'pending'
           AND expired_at <= DATE_SUB(NOW(), INTERVAL 2 MINUTE)`
      );

      if (orderResult.affectedRows > 0) {
        console.log(`[CRON] ${orderResult.affectedRows} pesanan kedaluwarsa diperbarui menjadi expired.`);
      }
    } catch (error) {
      console.error('[CRON ERROR] Gagal memperbarui status expired:', error.message);
    }
  });

  console.log('[CRON] Background scheduler untuk langganan & pesanan expired aktif (interval: 1 menit)');
}

module.exports = initExpireSubscriptionJob;
