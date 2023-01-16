const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

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
  //cookie code stops here

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
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });
  //send token with above made function
  createAndSendToken(newUser, 201, res);
};

//for login
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // i) check if email and password exists

  if (!email || !password) {
    return next(new Error('please pass in the right params'), 401);
  }

  //ii) check if user exists && password is correct

  const user = await User.findOne({ email }).select('+password');

  //iii) check if everything is fine , then send token to user
  //implement function in model file

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new Error('invalid password or email', 401));
  }
  createAndSendToken(user, 200, res);
});
