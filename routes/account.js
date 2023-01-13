const express = require('express');

const accountController = require('./../controllers/authController');

const router = express.Router();

router.post('/signup', accountController.signUp);
router.post('/login', accountController.login);
