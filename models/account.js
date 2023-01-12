const mongoose = require('mongoose');
const validator = require('validator');
const bycrypt = require('bcryptjs');

const accountSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please enter a valid email address'],
  },

  firstName: {
    type: String,
    required: true,
  },

  lastName: {
    type: String,
    required: true,
  },

  userName: {
    type: String,
    required: true,
    unique: true,
  },

  password: {
    type: String,
    required: [true, 'A password is required'],
    min: 8,
    select: false,
  },

  passwordConfirm: {
    type: String,
    required: [true, 'A password is required'],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords do not match',
    },
  },

  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },

  balance: {
    type: Number,
    required: true,
    default: 0,
  },

  createdAt: {
    type: Date,
    default: Date.now(),
    select: false,
  },

  active: {
    type: Boolean,
    default: false,
    select: false,
  },
});

accountSchema.pre('save', async (next) => {
  if (!this.isModified('password')) return next();

  this.password = await bycrypt.hash(this.password, 12);

  this.passwordConfirm = undefined;

  next();
});

accountSchema.methods.correctPassword = async (inputPassword, userPassword) => {
  return await bycrypt.compare(inputPassword, userPassword);
};

const Account = mongoose.model('Account', accountSchema);

module.exports = Account;
