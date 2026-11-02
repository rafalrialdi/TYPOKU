const express = require('express');

const typoRoutes = require('./typoRoutes');
const parafraseRoutes = require('./parafraseRoutes');
const terjemahRoutes = require('./terjemahRoutes');
const authRoutes = require('./authRoutes');
const packageRoutes = require('./packageRoutes');
const orderRoutes = require('./orderRoutes');
const paymentRoutes = require('./paymentRoutes');
const subscriptionRoutes = require('./subscriptionRoutes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/packages', packageRoutes);
router.use('/orders', orderRoutes);
router.use('/payments', paymentRoutes);
router.use('/subscriptions', subscriptionRoutes);
router.use('/cek-typo', typoRoutes);
router.use('/parafrase', parafraseRoutes);
router.use('/terjemah', terjemahRoutes);

module.exports = router;
