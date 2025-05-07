const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Routes
router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.get('/profile', userController.getUserProfile);
router.get('/all',userController.getAllUsers);
router.put('/forgot-password',userController.forgotPassword);
router.put('/resetpassword/:id',userController.resetPassword);
module.exports = router;
