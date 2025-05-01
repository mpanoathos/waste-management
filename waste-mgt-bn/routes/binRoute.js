const express = require('express');
const router = express.Router();
const binController = require('../controllers/binController');

// Create a new bin
router.post('/', binController.createBin);

// Get all bins
router.get('/', binController.getBins);

// Update a bin (e.g., fill level/status)
router.put('/:id', binController.updateBin);

// Delete a bin
router.delete('/:id', binController.deleteBin);

module.exports = router;
