const Wallets = require('../models/walletModel');
const User = require('../models/userModel');
const { updateWallet } = require('../utils/wallet');

const createWallet = async (req, res) => {
  try {
    const { email, username } = req.body;

    const user = await User.findOne({ email: email });

    const walletExists = await Wallets.findOne({ email: user.email });
    if (walletExists) {
      return res.status(409).json({
        status: false,
        message: 'Wallet already exists',
      });
    }

    const result = await Wallets.create({
      email: user.email,
      username: username,
      userId: user._id,
    });

    return res.status(201).json({
      status: true,
      message: 'Wallets created successfully',
      data: result,
    });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: `Unable to create wallet. Please create account `,
    });
  }
};

const lockWallet = async (req, res) => {
  const { email } = req.body;
  try {
    //check if user exists
    const user = await User.findOne({ email: email });

    console.log(user);
    // if user exists, use user_email to find user wallet
    const walletExists = await Wallets.findOne({ userId: user._id });

    console.log(walletExists);
    //check for error when getting user wallet
    if (!walletExists || walletExists.lock === true) {
      return res.status(404).json({
        status: false,
        message: `User ${walletExists} does not exist or is locked`,
      });
    }

    //now if wallets exists, update the wallet status to lock.....
    const walletUpdated = await Wallets.findOneAndUpdate(
      { userId: user._id },
      { status: 'locked', lock: true, unlock: false }
    );

    console.log(walletUpdated);
    return res.status(200).json({
      status: true,
      message: 'Wallet locked successfully',
    });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: `Unable to lock wallet at this time. ${err}`,
    });
  }
};

const unlockWallet = async (req, res) => {
  //recieve wallet email from req body
  const { email } = req.body;

  try {
    //find if user exists first
    const user = await User.findOne({ email: email });

    console.log(user);
    //check if wallet id exists in db and its locked
    const userWallet = await Wallets.findOne({ userId: user._id });

    console.log(userWallet);
    if (!userWallet) {
      return res.status(404).json({
        status: false,
        message: `User ${userWallet} does not exist or is not locked`,
      });
    }

    //if wallet id exists and its locked, update the wallet status to unlocked

    const updateWallet = await Wallets.findOneAndUpdate(
      { userId: user._id },
      { status: 'Unlocked', lock: false, unlock: true }
    );

    return res.status(200).json({
      status: true,
      message: 'wallet unlocked successfully',
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: false,
      message: `Wallet unlock failed \n Error: ${err}`,
    });
  }
};
module.exports = { createWallet, lockWallet, unlockWallet };
