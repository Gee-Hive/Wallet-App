const mongoose = require('mongoose');

const validator = require('validator');

const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },

  lastName: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    unique: true,
    lowercase: true,
    required: true,

    validate: [validator.isEmail, 'Please input a valid Email '],
  },

  phoneNumber: {
    type: String,
  },

  password: {
    type: String,
    required: [true, 'A password is required'],
    minLength: 8,
    select: false,
  },
  role: {
    type: String,
    enum: ['user', 'admin'], // to indicate the list of options for this schema type
    default: 'user',
  },

  passwordConfirm: {
    type: String,
    required: [true, 'A password confirmation is required'],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: 'passwords are not the same',
    },
  },

  status: {
    type: String,
    default: 'active',
    enum: ['active', 'inactive'],
  },

  passwordResetToken: String,

  passwordResetExpires: Date,
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);

  this.passwordConfirm = undefined;

  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model('Users', userSchema);
module.exports = User;
