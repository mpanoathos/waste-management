const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authenticateToken } = require('../middleware/auth');

router.get('/company-analytics', authenticateToken, analyticsController.getCompanyAnalytics);

// System analytics report for admin dashboard
router.get('/report', analyticsController.getSystemReport);

// Dashboard analytics endpoint for frontend
router.get('/', authenticateToken, analyticsController.getDashboardAnalytics);

module.exports = router; 