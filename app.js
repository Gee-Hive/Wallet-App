const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();

const userRoutes = require('./routes/userRoutes');
const walletRoutes = require('./routes/walletRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.get('/pay', (req, res) => {
  res.sendFile(path.join(__dirname + '/index.html'));
  //__dirname : It will resolve to project folder.
});

app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true, limit: '10kb' })); //to parse data from an urluserEncoded form

//base routes
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/wallets', walletRoutes);
app.use('/api/v1/transactions', transactionRoutes);

app.all('*', (req, res, next) => {
  next(new Error(`cannot find ${req.originalUrl} on this server`, 404));
});
module.exports = app;
