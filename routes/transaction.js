const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactions');

router.post('/transfer', transactionController.transfer);

module.exports = router;
