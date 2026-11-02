const db = require('../confiq/database');
const { sendError } = require('../utils/response');

async function checkSubscription(req, res, next) {
  try {
    const userId = req.user && req.user.id;
    if (!userId) {
      return sendError(res, 'Silakan login terlebih dahulu', 401);
    }

    const [subscriptions] = await db.query(
      `SELECT
          id,
          order_id,
          package_id,
          package_name,
          package_price,
          duration_days,
          started_at,
          expired_at,
          status
       FROM user_subscriptions
       WHERE user_id = ?
         AND status = 'active'
         AND expired_at > NOW()
       ORDER BY expired_at DESC
       LIMIT 1`,
      [userId]
    );

    if (!subscriptions || subscriptions.length === 0) {
      return res.status(403).json({
        status: 'error',
        hasAccess: false,
        message: 'Kamu belum memiliki paket aktif. Silakan pilih paket langganan untuk melanjutkan.',
      });
    }

    req.subscription = subscriptions[0];
    return next();
  } catch (error) {
    console.error('checkSubscription error:', error);
    return sendError(res, 'Gagal memeriksa status langganan', 500);
  }
}

module.exports = checkSubscription;
