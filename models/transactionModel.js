const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    trnxType: {
      type: String,
      enum: ['CR', 'DR'],
    },
    transactionId: {
      type: Number,
      trim: true,
    },
    purpose: {
      type: String,
      enum: ['deposit', 'transfer', 'reversal', 'withdrawal'],
    },
    amount: {
      type: mongoose.Decimal128,
      required: [true, 'amount is required'],
      default: 0.0,
    },
    email: {
      type: String,
      ref: 'Users',
    },
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Users',
    },
    phone: {
      type: String,
    },
    walletUsername: {
      type: String,
      ref: 'Wallets',
    },

    reference: {
      type: String,
    },

    balanceBefore: {
      type: mongoose.Decimal128,
    },
    balanceAfter: {
      type: mongoose.Decimal128,
    },
    currency: {
      type: String,
      enum: ['NGN', 'USD', 'EUR', 'GBP'],
    },
    paymentStatus: {
      type: String,
      enum: ['successful', 'pending', 'failed'],
      default: 'pending',
    },
    paymentGateway: {
      type: String,
      enum: ['flutterwave', 'paystack', 'stripe'],
    },
    summary: {
      type: String,
    },

    trnxSummary: {
      type: String,
    },
  },
  { timestamps: true }
);

const Transactions = mongoose.model('Transactions', transactionSchema);
module.exports = Transactions;
