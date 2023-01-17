const express = require('express');
const router = express.Router();

const Wallets = require('../controllers/walletController');

router.post('/create-wallet', Wallets.createWallet);

module.exports = router;
