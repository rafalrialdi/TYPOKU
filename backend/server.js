require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const routes = require('./routes');
const { generalLimiter } = require('./middleware/rateLimiter');
const initExpireSubscriptionJob = require('./jobs/expireSubscription');
const initReconcilePaymentsJob = require('./jobs/reconcilePayments');

const app = express();
const PORT = process.env.PORT || 8000;

app.set('trust proxy', 1);

// CORS: hanya origin yang terdaftar di APP_URL yang diizinkan.
// Request tanpa header Origin (Postman, curl, webhook Midtrans) tetap lolos
// karena aturan CORS hanya ditegakkan oleh browser.
const allowedOrigins = (process.env.APP_URL || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim().replace(/\/$/, ''))
  .filter(Boolean);

app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        return callback(null, true);
      }

      return callback(null, allowedOrigins.includes(origin));
    },
  })
);
app.use(morgan('dev'));
app.use(generalLimiter);
app.use(express.json({ limit: '2mb' }));

app.get('/', (req, res) => {
  res.json({ status: 'Backend API Typoku Running!' });
});

app.use('/api', routes);

app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Endpoint tidak ditemukan',
  });
});

app.use((err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Terjadi kesalahan pada server';

  if (err.name === 'MulterError') {
    statusCode = 400;
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'Ukuran file melebihi batas maksimal 5 MB.';
    } else {
      message = `Gagal mengunggah berkas: ${err.message}`;
    }
  }

  res.status(statusCode).json({
    status: 'error',
    message,
  });
});

initExpireSubscriptionJob();
initReconcilePaymentsJob();

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
