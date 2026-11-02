const crypto = require('crypto');
const db = require('../confiq/database');
const { snap, clientKey, mapPaymentMethodToEnabledPayments } = require('../utils/midtrans');
const { sendSuccess, sendError } = require('../utils/response');

function generateOrderCode() {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomStr = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `ORD-${dateStr}-${randomStr}`;
}

async function createOrder(req, res) {
  const connection = await db.getConnection();
  try {
    const userId = req.user.id;
    const { packageId, paymentMethod } = req.body;

    // Ambil data user
    const [users] = await connection.query(
      'SELECT id, name, email, phone FROM users WHERE id = ? LIMIT 1',
      [userId]
    );
    if (users.length === 0) {
      connection.release();
      return sendError(res, 'Pengguna tidak ditemukan', 404);
    }
    const user = users[0];

    // Ambil data paket
    const [packages] = await connection.query(
      'SELECT id, package_code, name, price, duration_days, is_active FROM packages WHERE id = ? LIMIT 1',
      [packageId]
    );

    if (packages.length === 0 || !packages[0].is_active) {
      connection.release();
      return sendError(res, 'Paket tidak ditemukan atau sudah tidak aktif', 404);
    }
    const pkg = packages[0];

    // Validasi metode pembayaran
    const cleanMethod = (paymentMethod || 'qris').toLowerCase().trim();
    const rawAllowed = process.env.PAYMENT_METHODS || 'qris,dana,ovo';
    const allowedMethods = rawAllowed.split(',').map((m) => m.trim().toLowerCase());

    if (!allowedMethods.includes(cleanMethod)) {
      connection.release();
      return sendError(
        res,
        `Metode pembayaran '${cleanMethod}' tidak didukung. Metode yang tersedia: ${allowedMethods.join(', ')}`,
        400
      );
    }

    const orderCode = generateOrderCode();
    const packagePrice = Math.round(Number(pkg.price));
    const configuredFee = Number(process.env.ADMIN_FEE);
    const adminFee = Number.isFinite(configuredFee) && configuredFee >= 0
      ? Math.round(configuredFee)
      : 700;
    const grossAmount = packagePrice + adminFee;
    const enabledPayments = mapPaymentMethodToEnabledPayments(cleanMethod);

    // Siapkan parameter transaksi Snap Midtrans
    const snapParams = {
      transaction_details: {
        order_id: orderCode,
        gross_amount: grossAmount,
      },
      customer_details: {
        first_name: user.name,
        email: user.email,
        phone: user.phone || '08123456789',
      },
      item_details: [
        {
          id: String(pkg.id),
          price: packagePrice,
          quantity: 1,
          name: pkg.name.substring(0, 50),
        },
        ...(adminFee > 0
          ? [
              {
                id: 'ADMIN_FEE',
                price: adminFee,
                quantity: 1,
                name: 'Biaya Admin',
              },
            ]
          : []),
      ],
      enabled_payments: enabledPayments,
      expiry: {
        unit: 'minutes',
        duration: 15,
      },
    };

    // Buat transaksi di Midtrans
    let midtransResponse;
    try {
      midtransResponse = await snap.createTransaction(snapParams);
    } catch (midtransError) {
      console.error('Midtrans createTransaction error:', midtransError);
      connection.release();
      return sendError(
        res,
        'Gagal membuat transaksi pembayaran di Midtrans: ' + (midtransError.message || 'Layanan sedang sibuk'),
        502
      );
    }

    const snapToken = midtransResponse.token;
    const redirectUrl = midtransResponse.redirect_url;

    // Mulai transaksi database
    await connection.beginTransaction();

    // 1. Simpan ke orders
    const [orderResult] = await connection.query(
      `INSERT INTO orders (
          order_code,
          user_id,
          package_id,
          package_name,
          package_price,
          admin_fee,
          duration_days,
          total_amount,
          status,
          expired_at
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', DATE_ADD(NOW(), INTERVAL 15 MINUTE))`,
      [
        orderCode,
        user.id,
        pkg.id,
        pkg.name,
        packagePrice,
        adminFee,
        pkg.duration_days,
        grossAmount,
      ]
    );

    const orderId = orderResult.insertId;

    // 2. Simpan ke payment_transactions
    await connection.query(
      `INSERT INTO payment_transactions (
          order_id,
          midtrans_order_id,
          snap_token,
          payment_method,
          transaction_status,
          gross_amount,
          currency,
          expiry_time
       ) VALUES (?, ?, ?, ?, 'pending', ?, 'IDR', DATE_ADD(NOW(), INTERVAL 15 MINUTE))`,
      [
        orderId,
        orderCode,
        snapToken,
        cleanMethod,
        grossAmount,
      ]
    );

    await connection.commit();
    connection.release();

    return sendSuccess(
      res,
      'Pesanan berhasil dibuat. Silakan selesaikan pembayaran.',
      {
        order: {
          id: orderId,
          order_code: orderCode,
          package_id: pkg.id,
          package_name: pkg.name,
          package_price: packagePrice,
          admin_fee: adminFee,
          duration_days: pkg.duration_days,
          total_amount: grossAmount,
          status: 'pending',
          payment_method: cleanMethod,
          expiry_minutes: 15,
        },
        snap_token: snapToken,
        redirect_url: redirectUrl,
        client_key: clientKey,
      },
      201
    );
  } catch (error) {
    await connection.rollback();
    connection.release();
    console.error('createOrder error:', error);
    return sendError(res, 'Terjadi kesalahan saat membuat pesanan', 500);
  }
}

async function getMyOrders(req, res) {
  try {
    const userId = req.user.id;
    const [rows] = await db.query(
      `SELECT
          o.id,
          o.order_code,
          o.package_id,
          o.package_name,
          o.package_price,
          o.admin_fee,
          o.duration_days,
          o.total_amount,
          o.status,
          o.expired_at,
          o.paid_at,
          o.created_at,
          pt.snap_token,
          pt.payment_method,
          pt.transaction_status as midtrans_status
       FROM orders o
       LEFT JOIN payment_transactions pt ON pt.order_id = o.id
       WHERE o.user_id = ?
       ORDER BY o.created_at DESC`,
      [userId]
    );

    return sendSuccess(res, 'Daftar pesanan berhasil diambil', rows);
  } catch (error) {
    console.error('getMyOrders error:', error);
    return sendError(res, 'Gagal mengambil riwayat pesanan', 500);
  }
}

async function getOrderByCode(req, res) {
  try {
    const userId = req.user.id;
    const { orderCode } = req.params;

    const [rows] = await db.query(
      `SELECT
          o.id,
          o.order_code,
          o.package_id,
          o.package_name,
          o.package_price,
          o.admin_fee,
          o.duration_days,
          o.total_amount,
          o.status,
          o.expired_at,
          o.paid_at,
          o.created_at,
          pt.snap_token,
          pt.payment_method,
          pt.transaction_status as midtrans_status,
          pt.transaction_time,
          pt.settlement_time,
          pt.expiry_time
       FROM orders o
       LEFT JOIN payment_transactions pt ON pt.order_id = o.id
       WHERE o.order_code = ? AND o.user_id = ?
       LIMIT 1`,
      [orderCode, userId]
    );

    if (rows.length === 0) {
      return sendError(res, 'Pesanan tidak ditemukan', 404);
    }

    const order = rows[0];
    const isStillPending = order.status === 'pending' && new Date(order.expired_at) > new Date();

    return sendSuccess(res, 'Detail pesanan berhasil diambil', {
      order,
      snap_token: isStillPending ? order.snap_token : null,
      can_reopen: isStillPending,
      client_key: clientKey,
    });
  } catch (error) {
    console.error('getOrderByCode error:', error);
    return sendError(res, 'Gagal mengambil detail pesanan', 500);
  }
}

module.exports = {
  createOrder,
  getMyOrders,
  getOrderByCode,
};
