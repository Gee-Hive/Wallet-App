const Wallet = require('../models/walletModel');
const Transaction = require('../models/transactionModel');
const WalletTransaction = require('../models/walletTransactionModel');

const validateUserWallet = async (userId, email) => {
  try {
    // check if user have a wallet, else create wallet
    const userWallet = await Wallet.findOne({ userId });

    // If user wallet doesn't exist, create a new one
    if (!userWallet) {
      // create wallet
      const wallet = await Wallet.create({
        userId: userId,
        email: email,
      });
      return wallet;
    }
    return userWallet;
  } catch (err) {
    return {
      status: false,
      statusCode: 404,
      message: ` Cannot validate user at this time. Error: ${err.message}`,
    };
  }
};

// Create Wallet Transaction
const createWalletTransaction = async (userId, status, currency, amount) => {
  try {
    // create wallet transaction
    const walletTransaction = await WalletTransaction.create({
      amount,
      userId,
      isInflow: true,
      currency,
      status,
    });
    return walletTransaction;
  } catch (error) {
    return {
      status: false,
      statusCode: 404,
      message: ` Cannot create wallet transaction at this time. Error: ${err.message}`,
    };
  }
};

// Create Transaction
const createTransaction = async (
  userId,
  id,
  status,
  currency,
  amount,
  customer
) => {
  try {
    // create transaction
    const transaction = await Transaction.create([
      {
        userId,
        transactionId: id,
        email: customer.email,
        phone: customer.phone_number,
        amount,
        currency,
        paymentStatus: status,
        paymentGateway: 'flutterwave',
      },
    ]);
    return transaction;
  } catch (error) {
    return {
      status: false,
      statusCode: 404,
      message: ` Cannot establish user transaction at this time. Error: ${err.message}`,
    };
  }
};

// Update wallet
const updateWallet = async (userId, amount) => {
  try {
    // update wallet
    const wallet = await Wallet.findOneAndUpdate(
      { userId },
      { $inc: { balance: amount } },
      { new: true }
    );
    return wallet;
  } catch (error) {
    return {
      status: false,
      statusCode: 404,
      message: ` Cannot update user at this time. Error: ${err.message}`,
    };
  }
};

module.exports = {
  validateUserWallet,
  createWalletTransaction,
  createTransaction,
  updateWallet,
};
