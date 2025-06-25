const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');

const prisma = new PrismaClient();

// Get recent collections for the authenticated user
router.get('/recent', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const collections = await prisma.collectionHistory.findMany({
      where: {
        bin: {
          userId: userId
        }
      },
      include: {
        bin: {
          select: {
            id: true,
            location: true
          }
        }
      },
      orderBy: {
        collectedAt: 'desc'
      },
      take: 10 // Limit to 10 most recent collections
    });

    // Transform the data to match frontend expectations
    const transformedCollections = collections.map(collection => ({
      id: collection.id,
      binId: collection.binId,
      collectedAt: collection.collectedAt,
      location: collection.bin.location,
      notes: collection.notes
    }));

    res.status(200).json(transformedCollections);
  } catch (error) {
    console.error('Error fetching recent collections:', error);
    res.status(500).json({ 
      message: 'Failed to fetch recent collections',
      error: error.message 
    });
  }
});

module.exports = router; 