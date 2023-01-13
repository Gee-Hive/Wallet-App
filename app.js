const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const app = express();

const accountRoutes = require('./routes/account');
const transactionRoutes = require('./routes/transaction');
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true, limit: '10kb' })); //to parse data from an urluserEncoded form

//base routes
app.use('/api/v1/accounts', accountRoutes);
app.use('api/v1/transactions', transactionRoutes);

app.all('*', (req, res, next) => {
  next(new Error(`cannot find ${req.originalUrl} on this server`, 404));
});
module.exports = app;
