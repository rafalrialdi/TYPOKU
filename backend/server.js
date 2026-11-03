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

app.use(helmet());
app.use(
  cors({
    origin: (process.env.APP_URL || 'http://localhost:5173').trim(),
    credentials: true,
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
  const statusCode = err.name === 'MulterError' ? 400 : err.statusCode || 500;

  res.status(statusCode).json({
    status: 'error',
    message: err.message || 'Terjadi kesalahan pada server',
  });
});

initExpireSubscriptionJob();
initReconcilePaymentsJob();

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
