const express = require('express');

const { parafrase } = require('../controllers/parafraseController');
const authenticate = require('../middleware/authenticate');
const checkSubscription = require('../middleware/checkSubscription');

const router = express.Router();

router.post('/', authenticate, checkSubscription, parafrase);

module.exports = router;
