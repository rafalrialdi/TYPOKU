const express = require('express');
const { body, param } = require('express-validator');
const orderController = require('../controllers/orderController');
const authenticate = require('../middleware/authenticate');
const validate = require('../middleware/validate');
const { orderLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.use(authenticate);

router.post(
  '/',
  orderLimiter,
  [
    body('packageId')
      .notEmpty()
      .withMessage('packageId wajib diisi')
      .isInt({ min: 1 })
      .withMessage('packageId harus berupa angka bulat positif'),
    body('paymentMethod')
      .trim()
      .notEmpty()
      .withMessage('Metode pembayaran wajib diisi'),
  ],
  validate,
  orderController.createOrder
);

router.get('/my', orderController.getMyOrders);

router.get(
  '/:orderCode',
  [param('orderCode').trim().notEmpty().withMessage('orderCode wajib diisi')],
  validate,
  orderController.getOrderByCode
);

module.exports = router;
