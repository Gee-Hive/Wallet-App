const transaction = require('./../models/transaction');
const mongoose = require('mongoose');
const uuid = require('uuid');
const uuid4 = uuid.v4(); //create a unque identifier
const { creditAccount, debitAccount } = require('../utils/transactions');

//initiate a transfer
const transfer = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction; //initiate a database transaction

  try {
    const { toAccount, fromAccount, amount, reason } = req.body;
    const reference = uuid4;

    if (!toAccount && !fromAccount && !amount && !reason) {
      return res.status(400).json({
        status: false,
        message: 'please provide all required information',
      });
    }

    //transfer Result
    const transferResult = await Promise.all([
      debitAccount({
        amount,
        destinationAccount: fromAccount,
        operationPurpose: 'transfer',
        reference,
        reason,
        session,
      }),
      creditAccount({
        amount,
        destinationAccount: toAccount,
        operationPurpose: 'transfer',
        reference,
        reason,
        session,
      }),
    ]); //returns a single promise into array containing all results

    const failedTransactions = transferResult.filter((result) => {
      result.status !== true;
    }); //return a filtered result of failed transactions based on the status transfer result

    //below check if there is a failed transaction. abort session and return a status set to false to user and error message
    if (failedTransactions) {
      await session.abortTransaction();
      return res.status(400).json({
        status: false,
        message: failedTransactions.map((a) => a.message),
      });
    }

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      status: true,
      message: 'Successfully transferred',
    });
  } catch (err) {
    console.error(err);
    await session.abortTransaction();
    session.endSession();

    return res.status(500).json({
      status: false,
      message: `unable to transfer \n Error: ${err.message} `,
    });
  }
};

const withdrawal = async (req, res) => {};
module.exports = { transfer };
