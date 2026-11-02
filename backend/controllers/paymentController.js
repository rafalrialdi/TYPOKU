const db = require('../confiq/database');
const { coreApi, verifyNotificationSignature, clientKey } = require('../utils/midtrans');
const { sendSuccess, sendError } = require('../utils/response');

async function applyPaymentSettlement(orderId, midtransData = {}) {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const [orders] = await connection.query(
      'SELECT id, user_id, package_id, package_name, package_price, duration_days, total_amount, status FROM orders WHERE id = ? FOR UPDATE',
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

    const settlementTime = midtransData.settlement_time || new Date();
    const transactionTime = midtransData.transaction_time || new Date();

    // 1. Update status pesanan menjadi paid
    await connection.query(
      'UPDATE orders SET status = "paid", paid_at = COALESCE(?, NOW()) WHERE id = ?',
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

    // 3. Batalkan paket aktif sebelumnya agar paket baru langsung aktif dari sekarang
    await connection.query(
      'UPDATE user_subscriptions SET status = "cancelled" WHERE user_id = ? AND status = "active"',
      [order.user_id]
    );

    // 4. Buat subscription baru yang aktif mulai dari sekarang
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
      // Jika duplicate order_id (UNIQUE key), abaikan karena sudah dibuat sebelumnya
      if (subErr.code !== 'ER_DUP_ENTRY') {
        throw subErr;
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
          'UPDATE payment_transactions SET transaction_status = "challenge", fraud_status = "challenge", last_notification_at = NOW() WHERE order_id = ?',
          [order.id]
        );
      }
    } else if (transactionStatus === 'settlement') {
      await applyPaymentSettlement(order.id, notification);
    } else if (['cancel', 'deny'].includes(transactionStatus)) {
      await db.query(
        'UPDATE orders SET status = "failed" WHERE id = ? AND status != "paid"',
        [order.id]
      );
      await db.query(
        'UPDATE payment_transactions SET transaction_status = ?, last_notification_at = NOW() WHERE order_id = ?',
        [transactionStatus, order.id]
      );
    } else if (transactionStatus === 'expire') {
      await db.query(
        'UPDATE orders SET status = "expired" WHERE id = ? AND status != "paid"',
        [order.id]
      );
      await db.query(
        'UPDATE payment_transactions SET transaction_status = "expire", last_notification_at = NOW() WHERE order_id = ?',
        [order.id]
      );
    } else if (transactionStatus === 'pending') {
      await db.query(
        'UPDATE payment_transactions SET transaction_status = "pending", last_notification_at = NOW() WHERE order_id = ?',
        [order.id]
      );
    }

    return sendSuccess(res, 'Notifikasi pembayaran berhasil diproses');
  } catch (error) {
    console.error('handleMidtransNotification error:', error);
    return sendError(res, 'Gagal memproses notifikasi Midtrans', 500);
  }
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
          o.admin_fee,
          o.total_amount,
          o.status,
          o.expired_at,
          o.paid_at,
          pt.snap_token,
          pt.payment_method,
          pt.transaction_status as midtrans_status
       FROM orders o
       LEFT JOIN payment_transactions pt ON pt.order_id = o.id
       WHERE o.order_code = ? AND o.user_id = ?
       LIMIT 1`,
      [orderCode, userId]
    );

    if (orders.length === 0) {
      return sendError(res, 'Pesanan tidak ditemukan', 404);
    }

    let order = orders[0];

    // Jika status masih pending, periksa status terkini ke Midtrans API
    if (order.status === 'pending') {
      try {
        const midtransStatus = await coreApi.transaction.status(orderCode);
        const transStatus = midtransStatus.transaction_status;
        const fraud = midtransStatus.fraud_status;

        if (transStatus === 'settlement' || (transStatus === 'capture' && fraud === 'accept')) {
          await applyPaymentSettlement(order.id, midtransStatus);
          order.status = 'paid';
          order.paid_at = midtransStatus.settlement_time || new Date();
        } else if (transStatus === 'expire') {
          await db.query('UPDATE orders SET status = "expired" WHERE id = ?', [order.id]);
          await db.query('UPDATE payment_transactions SET transaction_status = "expire" WHERE order_id = ?', [order.id]);
          order.status = 'expired';
        } else if (['cancel', 'deny'].includes(transStatus)) {
          await db.query('UPDATE orders SET status = "failed" WHERE id = ?', [order.id]);
          await db.query('UPDATE payment_transactions SET transaction_status = ? WHERE order_id = ?', [transStatus, order.id]);
          order.status = 'failed';
        }
      } catch (checkErr) {
        // Jika belum tercatat di Midtrans (misal popup belum dibuka), cek expiry local
        const isExpiredLocally = new Date(order.expired_at) <= new Date();
        if (isExpiredLocally) {
          await db.query('UPDATE orders SET status = "expired" WHERE id = ?', [order.id]);
          order.status = 'expired';
        }
      }
    }

    const isPending = order.status === 'pending' && new Date(order.expired_at) > new Date();

    return sendSuccess(res, 'Status pembayaran berhasil diperiksa', {
      order_code: order.order_code,
      status: order.status,
      package_name: order.package_name,
      package_price: Number(order.package_price),
      admin_fee: Number(order.admin_fee),
      total_amount: Number(order.total_amount),
      paid_at: order.paid_at,
      expired_at: order.expired_at,
      snap_token: isPending ? order.snap_token : null,
      can_reopen: isPending,
      client_key: clientKey,
    });
  } catch (error) {
    console.error('getPaymentStatus error:', error);
    return sendError(res, 'Gagal memeriksa status pembayaran', 500);
  }
}

module.exports = {
  applyPaymentSettlement,
  handleMidtransNotification,
  getPaymentStatus,
};
