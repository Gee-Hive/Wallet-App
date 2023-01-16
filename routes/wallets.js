const express = require('express');
const router = express.Router();

const Wallets = require('../controllers/wallets');

router.post('/home', Wallets.createWallet);

module.exports = router;
