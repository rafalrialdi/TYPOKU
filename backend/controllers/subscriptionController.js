const db = require('../confiq/database');
const { sendSuccess, sendError } = require('../utils/response');

async function getMyAccess(req, res) {
  try {
    const userId = req.user.id;
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

    const hasAccess = subscriptions.length > 0;
    const activeSub = hasAccess ? subscriptions[0] : null;

    return res.status(200).json({
      status: 'success',
      hasAccess,
      package: activeSub ? activeSub.package_name : null,
      packageId: activeSub ? activeSub.package_id : null,
      startedAt: activeSub ? activeSub.started_at : null,
      expiredAt: activeSub ? activeSub.expired_at : null,
    });
  } catch (error) {
    console.error('getMyAccess error:', error);
    return sendError(res, 'Gagal memeriksa status akses langganan', 500);
  }
}

async function getMySubscriptions(req, res) {
  try {
    const userId = req.user.id;
    const [rows] = await db.query(
      `SELECT
          id,
          order_id,
          package_id,
          package_name,
          package_price,
          duration_days,
          started_at,
          expired_at,
          status,
          created_at
       FROM user_subscriptions
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [userId]
    );

    return sendSuccess(res, 'Riwayat langganan berhasil diambil', rows);
  } catch (error) {
    console.error('getMySubscriptions error:', error);
    return sendError(res, 'Gagal mengambil riwayat langganan', 500);
  }
}

module.exports = {
  getMyAccess,
  getMySubscriptions,
};
