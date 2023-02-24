const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');

router.post('/sign-up', userController.signup);

router.post('/login', userController.login);

router.post('/logout', userController.logout);

router.use(userController.protectUser); //every route below this middleware is protected

router.patch('/de-activate', userController.deActivateUser);

router.patch('/re-activate', userController.activateUser);

router.patch('/update/user/:id', userController.updateUserDetails);

router.patch('/update-myPassword', userController.updateMyPassword);

router.use(userController.restrictTo('admin')); //only admin have access to the routes below this middleware

router.get('/', userController.getAllUsers);

router.get('/:id', userController.getUser);
module.exports = router;
