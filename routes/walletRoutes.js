const express = require('express');
const router = express.Router();

const Wallets = require('../controllers/walletController');

router.post('/create-wallet', Wallets.createWallet);

router.patch('/lock-wallet/', Wallets.lockWallet);

router.patch('/unlock-wallet/', Wallets.unlockWallet);
module.exports = router;
