const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    trnxType: {
      type: String,
      // required: true,
      enum: ['CR', 'DR'],
    },
    transactionId: {
      type: Number,
      trim: true,
    },
    purpose: {
      type: String,
      enum: ['deposit', 'transfer', 'reversal', 'withdrawal'],
      // required: true,
    },
    amount: {
      type: mongoose.Decimal128,
      // required: [true, 'amount is required'],
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
      // required: true
    },

    balanceBefore: {
      type: mongoose.Decimal128,
      // required: true,
    },
    balanceAfter: {
      type: mongoose.Decimal128,
      // required: true,
    },
    currency: {
      type: String,
      // required: [true, 'currency is required'],
      enum: ['NGN', 'USD', 'EUR', 'GBP'],
    },
    paymentStatus: {
      type: String,
      enum: ['successful', 'pending', 'failed'],
      default: 'pending',
    },
    paymentGateway: {
      type: String,
      // required: [true, 'payment gateway is required'],
      enum: ['flutterwave', 'paystack', 'stripe'],
    }, // Payment gateway might differs as the application grows
    summary: {
      type: String,
      // required: true
    },

    trnxSummary: {
      type: String,
      //  required: true
    },
  },
  { timestamps: true }
);

const Transactions = mongoose.model('Transactions', transactionSchema);
module.exports = Transactions;
