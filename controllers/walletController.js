const Wallets = require('../models/walletModel');
const User = require('../models/userModel');

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
      status: true,
      message: `Unable to create wallet. Please create account `,
    });
  }
};

module.exports = { createWallet };
