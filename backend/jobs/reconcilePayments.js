const cron = require('node-cron');
const db = require('../confiq/database');
const {
  syncOrderWithMidtrans,
  RECONCILE_WINDOW_MINUTES,
} = require('../controllers/paymentController');

let isRunning = false;

function initReconcilePaymentsJob() {
  // Berjalan setiap 5 menit
  cron.schedule('*/5 * * * *', async () => {
    if (isRunning) {
      return;
    }

    isRunning = true;
    try {
      const [candidateOrders] = await db.query(
        `SELECT
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
         LIMIT 20`,
        [RECONCILE_WINDOW_MINUTES]
      );

      if (candidateOrders.length === 0) {
        return;
      }

      let recoveredCount = 0;

      for (const order of candidateOrders) {
        try {
          const result = await syncOrderWithMidtrans(order);
          if (result.status === 'paid') {
            recoveredCount += 1;
          }
        } catch (itemError) {
          console.error(
            `[RECONCILE] Gagal rekonsiliasi pesanan ${order.order_code}:`,
            itemError.message
          );
        }
      }

      if (recoveredCount > 0) {
        console.log(
          `[RECONCILE] ${recoveredCount} pesanan expired berhasil dipulihkan menjadi paid.`
        );
      }
    } catch (error) {
      console.error('[RECONCILE ERROR] Gagal menjalankan rekonsiliasi pesanan:', error.message);
    } finally {
      isRunning = false;
    }
  });

  console.log(
    `[CRON] Background scheduler rekonsiliasi pembayaran aktif (interval: 5 menit, window: ${RECONCILE_WINDOW_MINUTES} menit)`
  );
}

module.exports = initReconcilePaymentsJob;
