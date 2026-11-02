const express = require('express');
const { param } = require('express-validator');
const paymentController = require('../controllers/paymentController');
const authenticate = require('../middleware/authenticate');
const validate = require('../middleware/validate');

const router = express.Router();

// Webhook notifikasi Midtrans (Publik)
router.post('/notification', paymentController.handleMidtransNotification);

// Status pembayaran untuk frontend (Perlu Login)
router.get(
  '/status/:orderCode',
  authenticate,
  [param('orderCode').trim().notEmpty().withMessage('orderCode wajib disertakan')],
  validate,
  paymentController.getPaymentStatus
);

module.exports = router;
