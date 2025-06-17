const express = require('express');
const router = express.Router();
const binController = require('../controllers/binController');
const { authenticateToken } = require('../middleware/auth');

// All bin routes require authentication
router.use(authenticateToken);

// Create a new bin
router.post('/', binController.createBin);

// Get all bins
router.get('/', binController.getBins);

// Get all bins with their latest fill level
router.get('/with-latest-fill', binController.getBinsWithLatestFillLevel);

// Get user's bins
router.get('/user-bins', binController.getUserBins);

// Ensure all users have bins
router.post('/ensure-all-users-have-bins', binController.ensureAllUsersHaveBins);

// Update a bin (e.g., fill level/status)
router.put('/:id', binController.updateBin);

// Delete a bin
router.delete('/:id', binController.deleteBin);

module.exports = router;
