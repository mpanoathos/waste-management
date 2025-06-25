const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, isAdmin } = require('../middleware/auth');
const fetch = require('node-fetch');

// Public routes
router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);

// Protected routes
router.get('/profile', authenticateToken, userController.getUserProfile);
router.put('/profile',authenticateToken, userController.updateUserProfile);
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
router.delete('/delete/:userId', authenticateToken, isAdmin, userController.deleteUser);

// Test email configuration route
router.get('/test-email', async (req, res) => {
  try {
    const { testEmailConfig } = require('../utils/emailService');
    const isWorking = await testEmailConfig();
    
    if (isWorking) {
      res.json({ 
        success: true, 
        message: 'Email configuration is working correctly!' 
      });
    } else {
      res.status(500).json({ 
        success: false, 
        message: 'Email configuration test failed. Check the console for details.' 
      });
    }
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Email test failed', 
      error: error.message 
    });
  }
});

// Geocode address via backend proxy
router.post('/geocode', async (req, res) => {
  const { address } = req.body;
  if (!address) {
    return res.status(400).json({ message: 'Address is required' });
  }
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`;
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'waste-mgt-app/1.0' }
    });
    if (!response.ok) {
      return res.status(response.status).json({ message: 'Geocoding failed' });
    }
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Geocoding error', error: err.message });
  }
});

module.exports = router;
