const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticateToken } = require('../middleware/auth');

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

// Initiate a new Payspack payment
router.post('/payspack/initiate', paymentController.initiatePayspackPayment);

module.exports = router; 