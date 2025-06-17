const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, isAdmin } = require('../middleware/auth');

// Public routes
router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);

// Protected routes
router.get('/profile', authenticateToken, userController.getUserProfile);
router.put('/profile', authenticateToken, userController.updateUserProfile);
router.get('/users', authenticateToken, userController.getAllUsers);
router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password', userController.resetPassword);

// Admin only routes
router.get('/pending-companies', authenticateToken, isAdmin, userController.getPendingCompanies);
router.post('/approve-company', authenticateToken, isAdmin, userController.approveCompany);

module.exports = router;
