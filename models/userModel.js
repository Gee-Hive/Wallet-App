const mongoose = require('mongoose');

const validator = require('validator');

const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    default: null,
  },
  lastName: {
    type: String,
    default: null,
  },
  email: {
    type: String,
    unique: true,
    lowercase: true,

    validate: [validator.isEmail, 'Please input a valid Email '],
  },
  password: {
    type: String,
    required: [true, 'A password is required'],
    minLength: 8,
    select: false,
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
module.exports = mongoose.model('Users', userSchema);
