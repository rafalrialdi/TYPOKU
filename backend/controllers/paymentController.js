const db = require('../confiq/database');
const {
  coreApi,
  verifyNotificationSignature,
  clientKey,
  isProduction,
} = require('../utils/midtrans');
const { sendSuccess, sendError } = require('../utils/response');

const RECONCILE_WINDOW_MINUTES = Number(process.env.PAYMENT_RECONCILE_MINUTES) || 60;

function parseMidtransTime(value) {
  if (!value) {
    return new Date();
  }

  const normalized = String(value).trim().replace(' ', 'T');
  const hasOffset = /(Z|[+-]\d{2}:?\d{2})$/i.test(normalized);
  const parsed = new Date(hasOffset ? normalized : `${normalized}+07:00`);

  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

function isWithinReconcileWindow(expiredAt) {
  if (!expiredAt) return false;
  const expiredTime = new Date(expiredAt).getTime();
  const maxTime = expiredTime + RECONCILE_WINDOW_MINUTES * 60 * 1000;
  return Date.now() <= maxTime;
}

async function syncOrderWithMidtrans(order) {
  try {
    const midtransStatus = await coreApi.transaction.status(order.order_code);
    const transStatus = midtransStatus.transaction_status;
    const fraud = midtransStatus.fraud_status;

    if (transStatus === 'settlement' || (transStatus === 'capture' && fraud === 'accept')) {
      await applyPaymentSettlement(order.id, midtransStatus);
      return {
        status: 'paid',
        paid_at: parseMidtransTime(midtransStatus.settlement_time),
        midtransStatus,
      };
    }

    if (transStatus === 'expire') {
      await db.query(`UPDATE orders SET status = 'expired' WHERE id = ? AND status != 'paid'`, [order.id]);
      await db.query(`UPDATE payment_transactions SET transaction_status = 'expire' WHERE order_id = ?`, [order.id]);
      return { status: 'expired', midtransStatus };
    }

    if (['cancel', 'deny'].includes(transStatus)) {
      await db.query(`UPDATE orders SET status = 'failed' WHERE id = ? AND status != 'paid'`, [order.id]);
      await db.query('UPDATE payment_transactions SET transaction_status = ? WHERE order_id = ?', [transStatus, order.id]);
      return { status: 'failed', midtransStatus };
    }

    return { status: order.status, midtransStatus };
  } catch (error) {
    if (order.status === 'pending') {
      const isExpiredLocally = new Date(order.expired_at) <= new Date();
      if (isExpiredLocally) {
        await db.query(`UPDATE orders SET status = 'expired' WHERE id = ? AND status != 'paid'`, [order.id]);
        return { status: 'expired', error };
      }
    }
    return { status: order.status, error };
  }
}

async function applyPaymentSettlement(orderId, midtransData = {}) {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const [orders] = await connection.query(
      'SELECT id, user_id, package_id, package_name, package_price, duration_days, total_amount, status, created_at FROM orders WHERE id = ? FOR UPDATE',
      [orderId]
    );

    if (orders.length === 0) {
      await connection.rollback();
      connection.release();
      return false;
    }

    const order = orders[0];

    // Jika pesanan sudah paid sebelumnya, operasi idempoten
    if (order.status === 'paid') {
      await connection.commit();
      connection.release();
      return true;
    }

    const settlementTime = parseMidtransTime(midtransData.settlement_time);
    const transactionTime = parseMidtransTime(midtransData.transaction_time);

    // 1. Update status pesanan menjadi paid
    await connection.query(
      `UPDATE orders SET status = 'paid', paid_at = COALESCE(?, NOW()) WHERE id = ?`,
      [settlementTime, order.id]
    );

    // 2. Update data transaksi Midtrans
    await connection.query(
      `UPDATE payment_transactions
       SET midtrans_transaction_id = COALESCE(?, midtrans_transaction_id),
           transaction_status = 'settlement',
           fraud_status = COALESCE(?, fraud_status),
           midtrans_status_code = COALESCE(?, midtrans_status_code),
           status_message = COALESCE(?, status_message),
           transaction_time = COALESCE(?, transaction_time),
           settlement_time = COALESCE(?, settlement_time, NOW()),
           last_notification_at = NOW()
       WHERE order_id = ?`,
      [
        midtransData.transaction_id || null,
        midtransData.fraud_status || null,
        midtransData.status_code || '200',
        midtransData.status_message || 'Success',
        transactionTime,
        settlementTime,
        order.id,
      ]
    );

    // 3. Periksa benturan subscription aktif yang lebih baru
    const [activeSubscriptions] = await connection.query(
      `SELECT id, order_id, created_at
       FROM user_subscriptions
       WHERE user_id = ?
         AND status = 'active'
       ORDER BY created_at DESC
       LIMIT 1
       FOR UPDATE`,
      [order.user_id]
    );

    const hasNewerActiveSubscription =
      activeSubscriptions.length > 0 &&
      activeSubscriptions[0].order_id !== order.id &&
      new Date(activeSubscriptions[0].created_at) > new Date(order.created_at);

    if (hasNewerActiveSubscription) {
      console.log(
        `[PAYMENT] Order ${order.id} pulih sebagai paid, tetapi user ${order.user_id} memiliki langganan aktif lebih baru. Lewati aktivasi paket.`
      );
    } else {
      // Batalkan paket aktif sebelumnya agar paket baru langsung aktif dari sekarang
      await connection.query(
        `UPDATE user_subscriptions SET status = 'cancelled' WHERE user_id = ? AND status = 'active'`,
        [order.user_id]
      );

      // Buat subscription baru yang aktif mulai dari sekarang
      try {
        await connection.query(
          `INSERT INTO user_subscriptions (
              user_id,
              order_id,
              package_id,
              package_name,
              package_price,
              duration_days,
              started_at,
              expired_at,
              status
           ) VALUES (?, ?, ?, ?, ?, ?, NOW(), DATE_ADD(NOW(), INTERVAL ? DAY), 'active')`,
          [
            order.user_id,
            order.id,
            order.package_id,
            order.package_name,
            order.package_price,
            order.duration_days,
            order.duration_days,
          ]
        );
      } catch (subErr) {
        if (subErr.code !== 'ER_DUP_ENTRY') {
          throw subErr;
        }
      }
    }

    await connection.commit();
    connection.release();
    return true;
  } catch (err) {
    await connection.rollback();
    connection.release();
    console.error('applyPaymentSettlement error:', err);
    throw err;
  }
}

async function handleMidtransNotification(req, res) {
  try {
    const notification = req.body;
    const orderId = notification.order_id;
    const statusCode = notification.status_code;
    const grossAmount = notification.gross_amount;
    const signatureKey = notification.signature_key;
    const transactionStatus = notification.transaction_status;
    const fraudStatus = notification.fraud_status;

    if (!orderId || !statusCode || !grossAmount || !signatureKey) {
      return sendError(res, 'Format notifikasi Midtrans tidak lengkap', 400);
    }

    if (orderId.startsWith('payment_notif_test_')) {
      return sendSuccess(res, 'Notifikasi pengujian Midtrans diterima');
    }

    // Verifikasi signature
    const isValid = verifyNotificationSignature(orderId, statusCode, grossAmount, signatureKey);
    if (!isValid) {
      console.warn(`[MIDTRANS WEBHOOK] Invalid signature for order: ${orderId}`);
      return sendError(res, 'Signature tidak valid', 400);
    }

    // Cari pesanan berdasarkan order_code
    const [orders] = await db.query(
      'SELECT id, total_amount, status FROM orders WHERE order_code = ? LIMIT 1',
      [orderId]
    );

    if (orders.length === 0) {
      console.warn(`[MIDTRANS WEBHOOK] Pesanan tidak ditemukan, notifikasi di-acknowledge: ${orderId}`);
      return sendSuccess(res, 'Notifikasi diterima, tetapi pesanan tidak ditemukan di database');
    }

    const order = orders[0];

    // Jangan pernah menurunkan status yang sudah paid
    if (order.status === 'paid') {
      return sendSuccess(res, 'Pesanan sudah berstatus lunas sebelumnya');
    }

    if (transactionStatus === 'capture') {
      if (fraudStatus === 'accept') {
        await applyPaymentSettlement(order.id, notification);
      } else if (fraudStatus === 'challenge') {
        await db.query(
          `UPDATE payment_transactions SET transaction_status = 'challenge', fraud_status = 'challenge', last_notification_at = NOW() WHERE order_id = ?`,
          [order.id]
        );
      }
    } else if (transactionStatus === 'settlement') {
      await applyPaymentSettlement(order.id, notification);
    } else if (['cancel', 'deny'].includes(transactionStatus)) {
      await db.query(
        `UPDATE orders SET status = 'failed' WHERE id = ? AND status != 'paid'`,
        [order.id]
      );
      await db.query(
        'UPDATE payment_transactions SET transaction_status = ?, last_notification_at = NOW() WHERE order_id = ?',
        [transactionStatus, order.id]
      );
    } else if (transactionStatus === 'expire') {
      await db.query(
        `UPDATE orders SET status = 'expired' WHERE id = ? AND status != 'paid'`,
        [order.id]
      );
      await db.query(
        `UPDATE payment_transactions SET transaction_status = 'expire', last_notification_at = NOW() WHERE order_id = ?`,
        [order.id]
      );
    } else if (transactionStatus === 'pending') {
      await db.query(
        `UPDATE payment_transactions SET transaction_status = 'pending', last_notification_at = NOW() WHERE order_id = ?`,
        [order.id]
      );
    }

    return sendSuccess(res, 'Notifikasi pembayaran berhasil diproses');
  } catch (error) {
    console.error('handleMidtransNotification error:', error);
    return sendError(res, 'Gagal memproses notifikasi Midtrans', 500);
  }
}

function getPaymentConfig(req, res) {
  const configuredFee = Number(process.env.ADMIN_FEE);
  const adminFee =
    Number.isFinite(configuredFee) && configuredFee >= 0 ? Math.round(configuredFee) : 700;
  const methods = (process.env.PAYMENT_METHODS || 'qris,dana,ovo')
    .split(',')
    .map((method) => method.trim().toLowerCase())
    .filter(Boolean);

  return sendSuccess(res, 'Konfigurasi pembayaran berhasil diambil', {
    admin_fee: adminFee,
    payment_methods: methods,
    midtrans_is_production: isProduction,
  });
}

async function getPaymentStatus(req, res) {
  try {
    const userId = req.user.id;
    const { orderCode } = req.params;

    const [orders] = await db.query(
      `SELECT
          o.id,
          o.order_code,
          o.user_id,
          o.package_id,
           o.package_name,
           o.package_price,
           COALESCE(o.duration_days, p.duration_days) AS duration_days,
           o.admin_fee,
           o.total_amount,
          o.status,
          o.expired_at,
          o.paid_at,
          o.created_at,
          pt.snap_token,
          pt.payment_method,
          pt.midtrans_transaction_id,
          pt.transaction_status as midtrans_status
        FROM orders o
        LEFT JOIN packages p ON p.id = o.package_id
        LEFT JOIN payment_transactions pt ON pt.order_id = o.id
       WHERE o.order_code = ? AND o.user_id = ?
       LIMIT 1`,
      [orderCode, userId]
    );

    if (orders.length === 0) {
      return sendError(res, 'Pesanan tidak ditemukan', 404);
    }

    let order = orders[0];

    // Jika status pending atau expired dalam jendela rekonsiliasi, sinkronkan ke Midtrans
    const shouldSyncWithMidtrans =
      order.status === 'pending' ||
      (order.status === 'expired' && isWithinReconcileWindow(order.expired_at));

    if (shouldSyncWithMidtrans) {
      const syncResult = await syncOrderWithMidtrans(order);
      order.status = syncResult.status;
      if (syncResult.paid_at) {
        order.paid_at = syncResult.paid_at;
      }
    }

    // Jaga-jaga webhook/Midtrans telat: pesanan pending yang sudah lewat expired_at langsung expired
    if (order.status === 'pending' && new Date(order.expired_at) <= new Date()) {
      await db.query("UPDATE orders SET status = 'expired' WHERE id = ? AND status != 'paid'", [
        order.id,
      ]);
      order.status = 'expired';
    }

    const isPending = order.status === 'pending' && new Date(order.expired_at) > new Date();

    return sendSuccess(res, 'Status pembayaran berhasil diperiksa', {
      order_code: order.order_code,
      status: order.status,
      package_id: order.package_id,
      package_name: order.package_name,
       package_price: Number(order.package_price),
       duration_days: Number(order.duration_days),
       admin_fee: Number(order.admin_fee),
      total_amount: Number(order.total_amount),
      payment_method: order.payment_method,
      midtrans_transaction_id: order.midtrans_transaction_id,
      created_at: order.created_at,
      paid_at: order.paid_at,
      expired_at: order.expired_at,
      snap_token: isPending ? order.snap_token : null,
      can_reopen: isPending,
      client_key: clientKey,
      midtrans_is_production: isProduction,
    });
  } catch (error) {
    console.error('getPaymentStatus error:', error);
    return sendError(res, 'Gagal memeriksa status pembayaran', 500);
  }
}

module.exports = {
  applyPaymentSettlement,
  handleMidtransNotification,
  getPaymentConfig,
  parseMidtransTime,
  getPaymentStatus,
  syncOrderWithMidtrans,
  isWithinReconcileWindow,
  RECONCILE_WINDOW_MINUTES,
};
