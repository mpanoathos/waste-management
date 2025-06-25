const express = require('express');
const router = express.Router();
const sensorController = require('../controllers/sensorController');
const { authenticateToken } = require('../middleware/auth');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// All sensor routes require authentication
router.use(authenticateToken);

// Route to log sensor data for a specific bin
router.post('/:binId/data', sensorController.logSensorData);

// Route to fetch sensor logs for a specific bin
router.get('/:binId/logs', sensorController.getSensorLogsForBin);

// Test endpoint to manually trigger sensor update (for testing real-time updates)
router.post('/test-update', async (req, res) => {
  try {
    const { fillLevel, binId } = req.body;
    
    let targetBin;
    
    if (binId) {
      // Use specific bin ID if provided
      targetBin = await prisma.bin.findUnique({
        where: { id: parseInt(binId) }
      });
    } else {
      // Use latest bin if no binId provided
      targetBin = await prisma.bin.findFirst({
        orderBy: { createdAt: 'desc' }
      });
    }
    
    if (!targetBin) {
      return res.status(404).json({ 
        message: binId ? `Bin ${binId} not found` : 'No bin found in database' 
      });
    }
    
    // Update the bin
    const updatedBin = await prisma.bin.update({
      where: { id: targetBin.id },
      data: {
        fillLevel: fillLevel,
        status: fillLevel > 80 ? 'FULL' : fillLevel > 50 ? 'PARTIAL' : 'EMPTY',
      },
    });
    
    // Create sensor log
    await prisma.sensorLog.create({
      data: {
        binId: targetBin.id,
        fillLevel: fillLevel,
      },
    });
    
    // Emit to frontend
    const { io } = require('../server');
    if (io) {
      io.emit('sensorUpdate', {
        binId: targetBin.id,
        fillLevel: fillLevel,
        timestamp: new Date(),
      });
    }
    
    res.status(200).json({ 
      message: 'Test sensor update successful',
      binId: targetBin.id,
      fillLevel: fillLevel,
      status: updatedBin.status
    });
  } catch (error) {
    console.error('Test sensor update error:', error);
    res.status(500).json({ message: 'Failed to update sensor', error: error.message });
  }
});

module.exports = router;
