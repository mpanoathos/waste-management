const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const db = require('../db');

// Get analytics data
router.get('/', authenticateToken, async (req, res) => {
  try {
    // Get daily collections for the last 7 days
    const dailyCollections = await db.query(`
      SELECT DATE(collection_time) as date, COUNT(*) as count
      FROM collections
      WHERE collection_time >= NOW() - INTERVAL '7 days'
      GROUP BY DATE(collection_time)
      ORDER BY date
    `);

    // Get bin status distribution
    const binStatus = await db.query(`
      SELECT status, COUNT(*) as count
      FROM bins
      GROUP BY status
    `);

    // Calculate collection efficiency (percentage of bins collected on time)
    const collectionEfficiency = await db.query(`
      SELECT 
        ROUND(
          (COUNT(CASE WHEN collection_time <= scheduled_time THEN 1 END)::float / 
          COUNT(*)::float) * 100
        ) as efficiency
      FROM collections
      WHERE collection_time >= NOW() - INTERVAL '30 days'
    `);

    // Get total waste collected
    const totalWaste = await db.query(`
      SELECT SUM(weight) as total
      FROM collections
      WHERE collection_time >= NOW() - INTERVAL '30 days'
    `);

    // Calculate average collection time
    const avgCollectionTime = await db.query(`
      SELECT ROUND(AVG(EXTRACT(EPOCH FROM (collection_time - scheduled_time))/60)) as avg_time
      FROM collections
      WHERE collection_time >= NOW() - INTERVAL '30 days'
    `);

    // Get route efficiency scores
    const routeEfficiency = await db.query(`
      SELECT 
        r.name,
        ROUND(
          (COUNT(CASE WHEN c.collection_time <= c.scheduled_time THEN 1 END)::float / 
          COUNT(*)::float) * 100
        ) as efficiency
      FROM routes r
      LEFT JOIN collections c ON c.route_id = r.id
      WHERE c.collection_time >= NOW() - INTERVAL '30 days'
      GROUP BY r.id, r.name
    `);

    res.json({
      dailyCollections: dailyCollections.rows,
      binStatus: binStatus.rows.reduce((acc, row) => {
        acc[row.status] = parseInt(row.count);
        return acc;
      }, {}),
      collectionEfficiency: parseInt(collectionEfficiency.rows[0]?.efficiency || 0),
      totalWasteCollected: parseFloat(totalWaste.rows[0]?.total || 0),
      averageCollectionTime: parseInt(avgCollectionTime.rows[0]?.avg_time || 0),
      routeEfficiency: routeEfficiency.rows
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics data' });
  }
});

module.exports = router; 