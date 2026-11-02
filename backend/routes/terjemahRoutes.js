const express = require('express');

const { terjemah } = require('../controllers/terjemahController');
const authenticate = require('../middleware/authenticate');
const checkSubscription = require('../middleware/checkSubscription');

const router = express.Router();

router.post('/', authenticate, checkSubscription, terjemah);

module.exports = router;
