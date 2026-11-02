const express = require('express');
const subscriptionController = require('../controllers/subscriptionController');
const authenticate = require('../middleware/authenticate');

const router = express.Router();

router.use(authenticate);

router.get('/my-access', subscriptionController.getMyAccess);
router.get('/my-history', subscriptionController.getMySubscriptions);

module.exports = router;
