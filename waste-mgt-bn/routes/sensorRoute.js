const express = require('express');
const router = express.Router();
const sensorController = require('../controllers/sensorController');

// Route to log sensor data for a specific bin
router.post('/:binId/data', sensorController.logSensorData);

// Route to fetch sensor logs for a specific bin
router.get('/:binId/logs', sensorController.getSensorLogsForBin);

// Route to get recent logs across all bins
router.get('/recent', sensorController.getRecentSensorLogs);

module.exports = router;
