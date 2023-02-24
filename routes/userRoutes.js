const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');

router.post('/sign-up', userController.signup);

router.post('/login', userController.login);

router.patch('/de-activate', userController.activateUser);

router.patch('/re-activate', userController.activateUser);

module.exports = router;
