const express = require('express');
const router = express.Router();

const Transactions = require('../controllers/transactionController');

router.post('/transfer', Transactions.transfer);

router.get('/response', Transactions.getPayResponse);

router.get('/wallet/:userId/balance', Transactions.getBalance);

router.post('/withdraw', Transactions.withdraw);

router.post('/pay-bills', Transactions.payBills);

module.exports = router;
