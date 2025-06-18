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
router.get('/all', authenticateToken, userController.getAllUsers);
router.get('/bin-management', authenticateToken, userController.getUsersForBinManagement);
router.get('/user-management', authenticateToken, isAdmin, userController.getAllUsersWithRoles);
router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password', userController.resetPassword);

// Collection history routes
router.get('/collection-history', authenticateToken, userController.getUserCollectionHistory);
router.get('/company-collection-history', authenticateToken, userController.getCompanyCollectionHistory);
router.get('/all-collection-history', authenticateToken, isAdmin, userController.getCollectionHistory);
router.post('/collect-bin/:userId', authenticateToken, userController.collectBin);
router.post('/collect-user-bin/:userId', authenticateToken, userController.collectUserBin);

// Admin only routes
router.get('/pending-companies', authenticateToken, isAdmin, userController.getPendingCompanies);
router.post('/approve-company', authenticateToken, isAdmin, userController.approveCompany);
router.get('/companies', authenticateToken, isAdmin, userController.getAllCompanies);

module.exports = router;
