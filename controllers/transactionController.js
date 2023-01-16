// controllers/transactions.js
const Transactions = require('../models/transactionModel');
const Wallets = require('../models/walletModel');
const mongoose = require('mongoose');
const { v4 } = require('uuid');
const { creditAccount, debitAccount } = require('../utils/transactions');

const transfer = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { toUsername, fromUsername, amount, summary } = req.body;
    const reference = v4();
    if (!toUsername && !fromUsername && !amount && !summary) {
      return res.status(400).json({
        status: false,
        message:
          'Please provide the following details: toUsername, fromUsername, amount, summary',
      });
    }

    const transferResult = await Promise.all([
      debitAccount({
        amount,
        username: fromUsername,
        purpose: 'transfer',
        reference,
        summary,
        trnxSummary: `TRFR TO: ${toUsername}. TRNX REF:${reference} `,
        session,
      }),
      creditAccount({
        amount,
        username: toUsername,
        purpose: 'transfer',
        reference,
        summary,
        trnxSummary: `TRFR FROM: ${fromUsername}. TRNX REF:${reference} `,
        session,
      }),
    ]);

    const failedTxns = transferResult.filter(
      (result) => result.status !== true
    );
    if (failedTxns.length) {
      const errors = failedTxns.map((a) => a.message);
      await session.abortTransaction();
      return res.status(400).json({
        status: false,
        message: errors,
      });
    }

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      status: true,
      message: 'Transfer successful',
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    return res.status(500).json({
      status: false,
      message: `Unable to find perform transfer. Please try again. \n Error: ${err}`,
    });
  }
};

const withdrawal = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    //1)get the wallet in the database
    const { username, amount, summary } = req.body;
    const wallet = await Wallets.findOne(username);
    const reference = v4();

    //2) create the checkout session for
    //a) information about the session itself
    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      success_url: `${req.protocol}://${req.get('host')}/?wallet=${
        req.params.username
      }&summary=${req.params.summary}&amount=${amount}`, //the query after the question mark is because "the result of the success object will be used for creating a new list of created and paid tours"
      cancel_url: `${req.protocol}://${req.get('host')}/deposit/${
        wallet.username
      }`,
      // customer_email: req.user.email,
      client_reference_id: reference, //allows us pass in some data about the session we are currently creating

      //below is the information about the product the user is about to purchase
      line_items: [
        {
          name: `${wallet.username} wallet`,
          summary: summary,
          amount: amount * 100,
          currency: 'usd',
        },
      ],
    });

    //3) return the checkout session to client
    res.status(200).json({
      status: 'success',
      session,
    });

    if (stripeSession.result.status === 'success') {
      await debitAccount({
        amount,
        username: fromUsername,
        purpose: 'withdraw',
        reference,
        summary: null,
        trnxSummary: `TRFR TO: ${toUsername}. TRNX REF:${reference} `,
        session,
      });
    }
  } catch (err) {
    console.log(err);
  }
};

const deposit = async (req, res) => {
  try {
    const paymentResponse = await paymentService.debitCard(
      req.body.card,
      req.body.amount
    );

    const transaction = new Transactions();
    transaction.amount = req.body.amount;
    transaction.operation = 'deposit';
    transaction.accountNumber = req.customer.accountNumber;
    transaction.reference = v4();
    const savedTransaction = await transaction.save();
    const savedUsername = await Wallets.findById(req.username._id);
    const response = {
      transaction: savedTransaction,
      customer: savedUsername,
    };
    res.json(response);
  } catch (error) {}
};
module.exports = { transfer };
