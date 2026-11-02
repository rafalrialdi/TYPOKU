const { verifyAccessToken } = require('../utils/tokens');
const { sendError } = require('../utils/response');

function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'Silakan login terlebih dahulu', 401);
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return sendError(res, 'Silakan login terlebih dahulu', 401);
    }

    const decoded = verifyAccessToken(token);
    req.user = decoded;
    return next();
  } catch (error) {
    return sendError(res, 'Token tidak valid atau sudah kedaluwarsa', 401);
  }
}

module.exports = authenticate;
