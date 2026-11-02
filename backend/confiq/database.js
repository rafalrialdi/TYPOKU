const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

function isTruthy(value) {
  return ['1', 'true', 'yes', 'on'].includes(String(value || '').trim().toLowerCase());
}

function buildSslConfig() {
  if (!isTruthy(process.env.DB_SSL)) {
    return undefined;
  }

  const caPath = (process.env.DB_SSL_CA || 'ca.pem').trim();
  const resolvedPath = path.isAbsolute(caPath)
    ? caPath
    : path.resolve(__dirname, '..', caPath);

  let ca;
  try {
    ca = fs.readFileSync(resolvedPath);
  } catch (error) {
    const sslError = new Error(
      `File CA SSL database tidak ditemukan atau tidak dapat dibaca: ${resolvedPath}`
    );
    sslError.cause = error;
    throw sslError;
  }

  return {
    ca,
    rejectUnauthorized: true,
    minVersion: 'TLSv1.2',
  };
}

const pool = mysql.createPool({
  host: (process.env.DB_HOST || 'localhost').trim(),
  user: (process.env.DB_USER || 'root').trim(),
  password: (process.env.DB_PASSWORD || '').trim(),
  database: (process.env.DB_NAME || 'typoku').trim(),
  port: parseInt((process.env.DB_PORT || '3306').toString().trim(), 10),
  ssl: buildSslConfig(),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
});

module.exports = pool;
