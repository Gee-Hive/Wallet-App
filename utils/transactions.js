const User = require('../models/userModel');
const Wallets = require('../models/walletModel');
const Transactions = require('../models/transactionModel');

const creditAccount = async ({
  amount,
  email,
  purpose,
  reference,
  summary,
  trnxSummary,
  session,
}) => {
  const user = await User.findOne({ email: email });

  const wallet = await Wallets.findOne({ userId: user._id });
  if (!wallet) {
    return {
      status: false,
      statusCode: 404,
      message: `User ${email} doesn\'t exist`,
    };
  }

  const updatedWallet = await Wallets.findOneAndUpdate(
    { userId: user._id },
    { $inc: { balance: amount } },
    { session }
  );

  const transaction = await Transactions.create(
    [
      {
        trnxType: 'CR',
        purpose,
        amount,
        email,
        reference,
        balanceBefore: Number(wallet.balance),
        balanceAfter: Number(wallet.balance) + Number(amount),
        summary,
        trnxSummary,
      },
    ],
    { session }
  );

  console.log(`Credit successful`);
  return {
    status: true,
    statusCode: 201,
    message: 'Credit successful',
    data: { updatedWallet, transaction },
  };
};

const debitAccount = async ({
  amount,
  email,
  purpose,
  reference,
  summary,
  trnxSummary,
  session,
}) => {
  const user = await User.findOne({ email: email });

  const wallet = await Wallets.findOne({ userId: user._id });
  if (!wallet) {
    return {
      status: false,
      statusCode: 404,
      message: `User ${wallet} doesn\'t exist`,
    };
  }

  if (Number(wallet.balance) < amount) {
    return {
      status: false,
      statusCode: 400,
      message: `User ${wallet} has insufficient balance`,
    };
  }

  const updatedWallet = await Wallets.findOneAndUpdate(
    { userId: user._id },
    { $inc: { balance: -amount } },
    { session }
  );
  const transaction = await Transactions.create(
    [
      {
        trnxType: 'DR',
        purpose,
        amount,
        email,
        reference,
        balanceBefore: Number(wallet.balance),
        balanceAfter: Number(wallet.balance) - Number(amount),
        summary,
        trnxSummary,
      },
    ],
    { session }
  );

  console.log(`Debit successful`);
  return {
    status: true,
    statusCode: 201,
    message: 'Debit successful',
    data: { updatedWallet, transaction },
  };
};

module.exports = {
  creditAccount,
  debitAccount,
};
