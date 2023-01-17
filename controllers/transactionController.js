// controllers/transactions.js
const axios = require('axios');
const Transaction = require('../models/transactionModel');
const Wallet = require('../models/walletModel');
const mongoose = require('mongoose');
const User = require('../models/userModel');
const { v4 } = require('uuid');
const { creditAccount, debitAccount } = require('../utils/transactions');
const {
  validateUserWallet,
  createWalletTransaction,
  createTransaction,
  updateWallet,
} = require('../utils/wallet');

//transfer method is going to be doing wallet to wallet transactions
const transfer = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { toUser, fromUser, amount, summary } = req.body;
    const reference = v4();
    if (!toUser && !fromUser && !amount && !summary) {
      return res.status(400).json({
        status: false,
        message:
          'Please provide the following details: toUsername, fromUsername, amount, summary',
      });
    }

    const transferResult = await Promise.all([
      debitAccount({
        amount,
        email: fromUser,
        purpose: 'transfer',
        reference,
        summary,
        trnxSummary: `TRFR TO: ${toUser}. TRNX REF:${reference} `,
        session,
      }),
      creditAccount({
        amount,
        email: toUser,
        purpose: 'transfer',
        reference,
        summary,
        trnxSummary: `TRFR FROM: ${fromUser}. TRNX REF:${reference} `,
        session,
      }),
    ]);

    const failedTxns = transferResult.filter(
      (result) => result.status !== true
    );
    if (failedTxns.length) {
      const errors = failedTxns.map((a) => a.message);
      await session.abortTransaction();
      return res.status(400).json({
        status: false,
        message: errors,
      });
    }

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      status: true,
      message: 'Transfer successful',
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    return res.status(500).json({
      status: false,
      message: `Unable to find perform transfer. Please try again. \n Error: ${err}`,
    });
  }
};

const getPayResponse = async (req, res) => {
  const { transaction_id } = req.query;

  // URL with transaction ID from flutterwave will be used to confirm transaction status
  const url = `https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`;

  // Network call to confirm transaction status
  const response = await axios({
    url,
    method: 'get',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `${process.env.FLUTTERWAVE_V3_SECRET_KEY}`,
    },
  });

  console.log();
  const { status, currency, id, amount, customer } = response.data.data;

  // check if transaction id already exist
  const transactionExist = await Transaction.findOne({ transactionId: id });

  if (transactionExist) {
    return res.status(409).send('Transaction Already Exist');
  }

  // check if customer exist in our database
  const user = await User.findOne({ email: customer.email });

  // check if user have a wallet, else create wallet
  const wallet = await validateUserWallet(user._id, user.email);

  // create wallet transaction
  await createWalletTransaction(user._id, status, currency, amount);

  // create transaction
  await createTransaction(user._id, id, status, currency, amount, customer);

  await updateWallet(user._id, amount);

  return res.status(200).json({
    response: 'wallet funded successfully',
    data: wallet,
  });
};

const getBalance = async (req, res) => {
  try {
    const { userId } = req.params;

    const wallet = await Wallet.findOne({ userId });
    // user
    res.status(200).json(wallet.balance);
  } catch (err) {
    console.log(err);
  }
};

module.exports = { transfer, getPayResponse, getBalance };
