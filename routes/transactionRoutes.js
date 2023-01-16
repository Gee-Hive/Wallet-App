const express = require('express');
const router = express.Router();

const Transactions = require('../controllers/transactionController');

router.post('/transfer', Transactions.transfer);

module.exports = router;
