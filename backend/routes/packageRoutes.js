const express = require('express');
const packageController = require('../controllers/packageController');

const router = express.Router();

router.get('/', packageController.getPackages);

module.exports = router;
