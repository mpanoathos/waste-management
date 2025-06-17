const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth');

// Public routes
router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password', userController.resetPassword);

// Protected routes
router.get('/profile', authenticateToken, userController.getUserProfile);
router.get('/all', authenticateToken, userController.getAllUsers);
router.post('/:userId/collect', authenticateToken, userController.collectBin);
router.get('/collection-history', authenticateToken, userController.getUserCollectionHistory);

module.exports = router;
