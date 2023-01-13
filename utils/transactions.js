const Accounts = require('./../models/account');
const Transactions = require('./../models/transactions');

const creditAccount = async ({
  amount,
  destinationAccount,
  operationPurpose,
  reference,
  reason,
  session,
}) => {
  //find the account associated
  const account = await Accounts.findOne({ destinationAccount });

  if (!account) {
    return {
      status: false,
      statusCode: 404,
      message: `Account ${destinationAccount} does not exist`,
    };
  }
  //update the account with amount
  const updateAccount = await Accounts.findOneAndUpdate(
    { destinationAccount },
    { $inc: { balance: amount } },
    { session }
  );

  //creat a transaction ins
  const transaction = await Transactions.create(
    [
      {
        transactionType: 'CR',
        operationPurpose,
        amount,
        destinationAccount,
        reference,
        reason,
      },
    ],
    { session }
  );

  console.log('Credit Successful');
  //return updatedWallet and transaction data
  return {
    status: true,
    statusCode: 200,
    message: 'Credit Successful',
    data: { updateAccount, transaction },
  };
};

const debitAccount = async (
  amount,
  destinationAccount,
  operationPurpose,
  reference,
  reason,
  session
) => {
  const account = await Accounts.findOne({ destinationAccount });
  if (!account) {
    return {
      status: false,
      statusCode: 404,
      message: `Account ${destinationAccount} does not exist`,
    };
  }

  if (Number(account.balance) < amount) {
    return {
      status: false,
      statusCode: 404,
      message: `Account ${destinationAccount} has insufficient balance`,
    };
  }

  const updateAccount = await Accounts.findOneAndUpdate(
    { destinationAccount },
    { $inc: { balance: -amount } },
    { session }
  );
  const transaction = await Transactions.create(
    [
      {
        transactionType: 'DR',
        operationPurpose,
        amount,
        destinationAccount,
        reference,
        reason,
      },
    ],
    { session }
  );
  console.log('Debit successful');

  return {
    status: true,
    statusCode: 200,
    message: `Debit Successful`,
    data: { updateAccount, transaction },
  };
};

module.exports = {
  creditAccount,
  debitAccount,
};
