const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      immutable: true,
      unique: true,
      ref: 'users',
    },
    balance: {
      type: mongoose.Decimal128,
      required: true,
      default: 0.0,
    },
    userId: {
      type: mongoose.Schema.ObjectId,
      required: true,
      ref: 'users',
    },
  },
  { timestamps: true }
);

const Wallets = mongoose.model('Wallets', walletSchema);
module.exports = Wallets;
