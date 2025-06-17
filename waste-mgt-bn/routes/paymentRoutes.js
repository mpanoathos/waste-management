const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticateToken } = require('../middleware/auth');
const momoConfig = require('../config/momo');

// Test endpoint to verify MoMo configuration
router.get('/test-config', (req, res) => {
    try {
        const config = {
            baseUrl: momoConfig.baseUrl,
            subscriptionKey: momoConfig.subscriptionKey ? '***exists***' : '***missing***',
            apiKey: momoConfig.apiKey ? '***exists***' : '***missing***',
            apiSecret: momoConfig.apiSecret ? '***exists***' : '***missing***',
            callbackHost: momoConfig.callbackHost,
            environment: momoConfig.environment
        };
        res.json({ 
            message: 'MoMo configuration check',
            config,
            status: 'success'
        });
    } catch (error) {
        res.status(500).json({
            message: 'Configuration check failed',
            error: error.message
        });
    }
});

// All payment routes require authentication
router.use(authenticateToken);

// Initiate a new payment
router.post('/initiate', paymentController.initiatePayment);

// Get payment status
router.get('/status/:paymentId', paymentController.getPaymentStatus);

// Get user's payment history
router.get('/history', paymentController.getUserPayments);

module.exports = router; 