const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const Wallet = require('../models/walletModel');

const signToken = function (id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createAndSendToken = function (user, statusCode, res) {
  const token = signToken({ id: user._id });
  //to send token via cookie to the server or client
  const cookieOptions = {
    exp: new Date(
      Date.now() + process.env.JWT_EXPIRES_COOKIE_IN * 24 * 60 * 60 * 1000
    ),
    secure: true,
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'development') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  user.password = undefined;

  //send token
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

//for signup
exports.signup = async (req, res, next) => {
  const newUser = await User.create({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });
  //create wallet for new user upon sign up
  await (
    await Wallet.create({ email: newUser.email, userId: newUser._id })
  ).save();
  //send token with above made function
  createAndSendToken(newUser, 201, res);
};

//for login
exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  // i) check if email and password exists

  if (!email || !password) {
    return next(new Error('please pass in the right params'), 401);
  }

  //ii) check if user exists && password is correct

  const user = await User.findOne({ email }).select('+password');

  //iii) check if everything is fine , then send token to user

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new Error('invalid password or email', 401));
  }
  createAndSendToken(user, 200, res);
};

// to de-activate a user account
exports.deActivateUser = async (req, res, next) => {
  try {
    //get the user from the database and see if it exists using req body

    const user = await User.findOne({ email: req.body.email });

    //check for error if user doesnt exists in database
    if (!user) {
      return next(new Error('user not found', 401));
    }
    //if user exists, update the user status to inactive

    const updateUserStatus = await User.findOneAndUpdate(
      { _id: user._id },
      { status: 'inactive' }
    );

    return res.status(204).json({
      status: true,
      message: 'User has been de-activated successfully',
    });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: err.message,
    });
  }
};

//to re-activate a user account
exports.activateUser = async (req, res, next) => {
  try {
    //get user from body params
    const { email } = req.body;
    //check for error if user doesnt exist in database
    if (!email) {
      return res.status(404).json({
        status: false,
        message: 'please provide the following details: email',
      });
    }
    //check if the user exists now
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(400).json({
        status: false,
        message: 'deactivated user does not exist ',
      });
    }
    //if user exists, update the user status to active, with narration(if you want)
    const updateUserStatus = await User.findOneAndUpdate(
      { _id: user._id },
      { status: 'active' }
    );

    return res.status(200).json({
      status: true,
      message: 'user re-activated successfully',
    });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: `Unable to activate user. please try again \n Error: ${err}`,
    });
  }
};

//for admin users/roles. implement middleware for this

//get all users
exports.getAllUsers = async (req, res, next) => {
  const allUsers = await User.find();
  //send response
  res.status(200).json({
    status: 'success',
    result: allUsers.length,
    data: allUsers,
  });
};

//get user
exports.getUser = async (req, res, next) => {
  const getUser = await User.findById(req.params.id);

  if (!getUser) {
    return res.status(404).json({
      status: 'false',
      message: 'User not found',
    });
  }

  res.status(200).json({
    status: 'success',
    message: 'User found',
    data: getUser,
  });
};

// can not use this to update user password
exports.updateUserDetails = async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    return res.status(404).json({
      status: false,
      message: `user ${user} does not exist.`,
    });
  }

  res.status(200).json({
    status: 'success',
    message: 'User updated successfully',
    data: user,
  });
};

//use this to update user password
exports.updateMyPassword = async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findById({ _id: req.user.id }).select('+password'); // since the user is already logged in

  if (!(await user.correctPassword(password, user.password))) {
    throw new Error('invalid password', 401);
  }

  //update user password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  //log user in with updated password
  createAndSendToken(user, 200, res);
};
//helper function to check users
exports.protectUser = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
    //check for cookies token if there is none in the auth header
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return res.status(401).json({
      status: false,
      message: 'user not logged in. please login to gain access, invalid token',
    });
  }

  //verification check(if one manipulated the token or maybe it expired)
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  //check if user still exists
  const currentUser = User.findById(decoded.id);

  if (!currentUser) {
    return res.status(401).json({
      status: false,
      message: 'sorry this token doesnt belong to this user',
    });
  }

  // Grant user access to routes
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
};

exports.restrictTo = function (...roles) {
  return function (req, res, next) {
    if (!roles.includes(req.user.role)) {
      throw new Error('Sorry you do not have access', 403);
    }
    next();
  };
};
exports.logout = (req, res, next) => {
  res.cookie('jwt', 'logout', {
    exp: new Date(date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.statusCode(200).json({ status: 'success' });
};
