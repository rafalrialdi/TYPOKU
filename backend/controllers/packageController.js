const db = require('../confiq/database');
const { sendSuccess, sendError } = require('../utils/response');

async function getPackages(req, res) {
  try {
    const [rows] = await db.query(
      `SELECT
          id,
          package_code,
          name,
          description,
          price,
          duration_days,
          billing_label,
          features,
          is_recommended,
          is_active
       FROM packages
       WHERE is_active = 1
       ORDER BY price ASC`
    );

    const packages = rows.map((pkg) => ({
      ...pkg,
      price: Number(pkg.price),
      features: typeof pkg.features === 'string' ? JSON.parse(pkg.features) : pkg.features,
      is_recommended: Boolean(pkg.is_recommended),
      is_active: Boolean(pkg.is_active),
    }));

    return sendSuccess(res, 'Daftar paket berhasil diambil', packages);
  } catch (error) {
    console.error('getPackages error:', error);
    return sendError(res, 'Gagal mengambil daftar paket', 500);
  }
}

module.exports = {
  getPackages,
};
