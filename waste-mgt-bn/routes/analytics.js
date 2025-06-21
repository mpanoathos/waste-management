const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authenticateToken } = require('../middleware/auth');

router.get('/company-analytics', authenticateToken, analyticsController.getCompanyAnalytics);
 
module.exports = router; 