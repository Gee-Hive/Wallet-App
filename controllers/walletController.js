const Wallets = require('../models/wallets');

const createWallet = async (req, res) => {
  try {
    const { username } = req.body;

    const walletExists = await Wallets.findOne({ username });
    if (walletExists) {
      return res.status(409).json({
        status: false,
        message: 'Wallet already exists',
      });
    }

    const result = await Wallets.create({ username });
    console.log(result);
    return res.status(201).json({
      status: true,
      message: 'Wallets created successfully',
      data: result,
    });
  } catch (err) {
    return res.status(500).json({
      status: true,
      message: `Unable to create wallet. Please try again. \n Error: ${err}`,
    });
  }
};

module.exports = { createWallet };
// const { response } = require('express');
// const jwt = require('jsonwebtoken');
// const Account = require('../models/wallets');
// // const Wallet = require('../models/wallets');

// const signToken = (id) => {
//   return jwt.sign({ id }, process.env.JWT_SECRET, {
//     expiresIn: process.env.JWT_EXPIRES_IN,
//   });
// };

// const createAndSendToken = (user, statusCode, res) => {
//   const token = signToken({ id: user._id });
//   //prepare token to be sent via cookie
//   const cookieOptions = {
//     exp: new Date(
//       Date.now() + process.env.JWT_EXPIRES_COOKIE_IN * 24 * 60 * 60 * 1000
//     ),
//     secure: true,
//     httpOnly: true,
//   };

//   if (process.env.NODE_ENV === 'development') cookieOptions.secure = true;

//   res.cookie('jwt', token, cookieOptions);

//   user.password = undefined;

//   //send token
//   res.status(statusCode).json({
//     status: 'success',
//     token,
//     data: {
//       user,
//     },
//   });
// };

// //sign up
// exports.signUp = async (req, res, next) => {
//   const newAccount = await Account.create({
//     email: req.body.email,
//     firstName: req.body.firstName,
//     lastName: req.body.lastName,
//     username: req.body.username,
//     password: req.body.password,
//     passwordConfirm: req.body.passwordConfirm,
//   });

//   createAndSendToken(newAccount, 200, res);
// };

// exports.login = async (req, res, next) => {
//   const { email, password } = req.body;

//   //check if user already
//   if (!email || !password) {
//     return next(new Error('Invalid email or password', 401));
//   }

//   //check if user exists and password is correct
//   const account = await Account.findOne({ email }).select('+password');

//   if (
//     !account ||
//     !(await account.correctPassword(password, account.password))
//   ) {
//     return next(new Error('Invalid email or password', 401));
//   }

//   createAndSendToken(account, 200, res);
// };
