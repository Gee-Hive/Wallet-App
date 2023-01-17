const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      ref: 'Users',
    },
    username: {
      type: String,
      trim: true,
      immutable: true,
      unique: true,
    },
    balance: {
      type: mongoose.Decimal128,
      required: true,
      default: 0.0,
    },
    userId: {
      type: mongoose.Schema.ObjectId,
      required: true,
      ref: 'Users',
    },
  },
  { timestamps: true }
);

const Wallets = mongoose.model('Wallets', walletSchema);
module.exports = Wallets;
