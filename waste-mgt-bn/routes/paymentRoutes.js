const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticateToken } = require('../middleware/auth');

// All payment routes require authentication
router.use(authenticateToken);

// Initiate a new payment
router.post('/initiate', paymentController.initiatePayment);

// Get payment status
router.get('/status/:paymentId', paymentController.getPaymentStatus);

// Get user's payment history
router.get('/history', paymentController.getUserPayments);

module.exports = router; 