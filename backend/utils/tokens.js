const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const JWT_SECRET = (process.env.JWT_SECRET || 'typoku_default_secret_key_change_me').trim();
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || '7d').trim();

function generateAccessToken(payload) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

function verifyAccessToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

function generateRandomToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString('hex');
}

function hashToken(rawToken) {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}

module.exports = {
  generateAccessToken,
  verifyAccessToken,
  generateRandomToken,
  hashToken,
};
