const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  transactionType: {
    type: String,
    required: true,
    enum: ['CR', 'DR'],
  },

  operationPurpose: {
    type: String,
    required: true,
    enum: ['deposit', 'withdrawal', 'transfer'],
  },

  amount: {
    type: mongoose.Decimal128,
    required: true,
    default: 0.0,
  },

  destinationAccount: {
    type: mongoose.Schema.ObjectId,
    ref: 'Account',
  },

  accountUsername: {
    type: String,
    ref: 'Account',
  },

  reference: {
    type: String,
    required: true,
  },

  reason: {
    type: String,
  },

  timeStamp: {
    type: Date,
    default: Date.now(),
  },
});
