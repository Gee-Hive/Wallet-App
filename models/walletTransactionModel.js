const mongoose = require('mongoose');

const walletTransactionSchema = new mongoose.Schema(
  {
    amount: {
      type: mongoose.Decimal128,
      required: true,
      default: 0.0,
    },

    userId: {
      type: String,
      ref: 'users',
      required: true,
    },

    isInflow: { type: Boolean },

    paymentMethod: {
      type: String,
      enum: ['flutterwave', 'paystack', 'stripe'],
      default: 'flutterwave',
    },

    currency: {
      type: String,
      required: [true, 'currency is required'],
      enum: ['NGN', 'USD', 'EUR', 'GBP'],
    },

    status: {
      type: String,
      required: [true, 'payment status is required'],
      enum: ['successful', 'pending', 'failed'],
    },
    totalTRNX: {
      type: {
        number: Number,
      },
    },
  },
  { timestamp: true }
);

const walletTrnxModel = mongoose.model(
  'walletTransaction',
  walletTransactionSchema
);
module.exports = walletTrnxModel;
