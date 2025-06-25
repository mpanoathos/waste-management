const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticateToken, isAdmin } = require('../middleware/auth');

// All other payment routes require a logged-in user
router.use(authenticateToken);

// Initiate a new payment
router.post('/initiate', paymentController.initiatePayment);

// Get payment status by our internal payment ID
router.get('/status/:paymentId', paymentController.getPaymentStatus);

// Get the current user's payment history
router.get('/history', paymentController.getUserPayments);

// Get all payments for the current company
router.get('/company-history', paymentController.getCompanyPayments);

// Get upcoming payments (currently returns empty array as payments are on-demand)
router.get('/upcoming', async (req, res) => {
  try {
    // Since payments are made on-demand, there are no "upcoming" payments
    // Return empty array to match frontend expectations
    res.status(200).json([]);
  } catch (error) {
    console.error('Error fetching upcoming payments:', error);
    res.status(500).json({ 
      message: 'Failed to fetch upcoming payments',
      error: error.message 
    });
  }
});

// Initiate a new Payspack payment
router.post('/payspack/initiate', paymentController.initiatePayspackPayment);

// Admin payment report
router.get('/admin-report', authenticateToken, isAdmin, paymentController.getAdminPaymentReport);

module.exports = router; 