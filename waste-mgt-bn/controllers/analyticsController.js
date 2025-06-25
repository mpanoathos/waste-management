const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getSystemReport = async (req, res) => {
  try {
    const totalBins = await prisma.bin.count();
    const totalCollections = await prisma.collectionHistory.count();
    const totalUsers = await prisma.user.count();

    // Bins by status
    const binsByStatus = await prisma.bin.groupBy({
      by: ['status'],
      _count: { status: true }
    });

    // Average fill level
    const avgFillLevel = await prisma.bin.aggregate({
      _avg: { fillLevel: true }
    });

    // Collections in last 7 days
    const collectionsLast7Days = await prisma.collectionHistory.count({
      where: {
        collectedAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      }
    });

    // New users this month
    const now = new Date();
    const usersThisMonth = await prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(now.getFullYear(), now.getMonth(), 1)
        }
      }
    });

    // Users by role
    const usersByRole = await prisma.user.groupBy({
      by: ['role'],
      _count: { role: true }
    });

    // Most active collector
    const mostActiveCollectorGroup = await prisma.collectionHistory.groupBy({
      by: ['collectedById'],
      _count: { collectedById: true },
      orderBy: { _count: { collectedById: 'desc' } },
      take: 1
    });
    let mostActiveCollector = null;
    if (mostActiveCollectorGroup.length > 0) {
      mostActiveCollector = await prisma.user.findUnique({
        where: { id: mostActiveCollectorGroup[0].collectedById },
        select: { id: true, name: true, email: true }
      });
      mostActiveCollector.collections = mostActiveCollectorGroup[0]._count.collectedById;
    }

    // Fetch recent collections with delay calculation
    const recentCollectionsRaw = await prisma.collectionHistory.findMany({
      orderBy: { collectedAt: 'desc' },
      take: 10,
      include: { bin: true, collectedBy: true, collectionRequest: true }
    });

    // Calculate delay for each collection
    const recentCollections = await Promise.all(recentCollectionsRaw.map(async (col) => {
      let delayDays = null;
      let delayed = false;
      let requestCreatedAt = null;
      if (col.collectionRequest) {
        requestCreatedAt = col.collectionRequest.createdAt;
      } else {
        // Fallback: find the closest previous request for this bin
        const fallbackReq = await prisma.collectionRequest.findFirst({
          where: {
            binId: col.binId,
            createdAt: { lte: col.collectedAt },
            status: { in: ['PENDING', 'COMPLETED'] }
          },
          orderBy: { createdAt: 'desc' }
        });
        if (fallbackReq) requestCreatedAt = fallbackReq.createdAt;
      }
      if (requestCreatedAt) {
        const diffMs = col.collectedAt - requestCreatedAt;
        delayDays = diffMs / (1000 * 60 * 60 * 24);
        delayed = delayDays > 1;
      }
      return {
        ...col,
        delayed,
        delayDays: delayDays !== null ? Number(delayDays.toFixed(2)) : null
      };
    }));

    // Collections by day for the last 30 days (using raw SQL)
    const collectionsByDay = await prisma.$queryRaw`
      SELECT date_trunc('day', "collectedAt") as day, COUNT(*)::int as count
      FROM "CollectionHistory"
      WHERE "collectedAt" >= NOW() - INTERVAL '30 days'
      GROUP BY day
      ORDER BY day ASC
    `;

    // Count delayed collections in the last 30 days
    const allCollections = await prisma.collectionHistory.findMany({
      where: {
        collectedAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      },
      include: { collectionRequest: true }
    });
    let delayedCollections = 0;
    for (const col of allCollections) {
      let requestCreatedAt = null;
      if (col.collectionRequest) {
        requestCreatedAt = col.collectionRequest.createdAt;
      } else {
        const fallbackReq = await prisma.collectionRequest.findFirst({
          where: {
            binId: col.binId,
            createdAt: { lte: col.collectedAt },
            status: { in: ['PENDING', 'COMPLETED'] }
          },
          orderBy: { createdAt: 'desc' }
        });
        if (fallbackReq) requestCreatedAt = fallbackReq.createdAt;
      }
      if (requestCreatedAt) {
        const diffMs = col.collectedAt - requestCreatedAt;
        const delayDays = diffMs / (1000 * 60 * 60 * 24);
        if (delayDays > 1) delayedCollections++;
      }
    }

    res.json({
      totalBins,
      totalCollections,
      totalUsers,
      binsByStatus,
      avgFillLevel: avgFillLevel._avg.fillLevel,
      collectionsLast7Days,
      usersThisMonth,
      usersByRole,
      mostActiveCollector,
      recentCollections,
      collectionsByDay,
      delayedCollections
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate report', details: error });
  }
};

exports.getCompanyAnalytics = async (req, res) => {
  try {
    // Removed role check: allow any authenticated user
    const companyId = req.user.id;
    // Total bins managed by company (bins where userId = companyId)
    const totalBins = await prisma.bin.count({ where: { userId: companyId } });
    // Total collections performed by company
    const totalCollections = await prisma.collectionHistory.count({ where: { collectedById: companyId } });
    // Bins by status
    const binsByStatus = await prisma.bin.groupBy({
      by: ['status'],
      _count: { status: true },
      where: { userId: companyId }
    });
    // Recent collections (last 7 days)
    const recentCollections = await prisma.collectionHistory.findMany({
      where: {
        collectedById: companyId,
        collectedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      },
      orderBy: { collectedAt: 'desc' },
      take: 10,
      include: { bin: true }
    });
    res.json({
      totalBins,
      totalCollections,
      binsByStatus,
      recentCollections
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate company analytics', details: error.message });
  }
};

// Dashboard analytics endpoint for frontend
exports.getDashboardAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get daily collections for the last 7 days
    const dailyCollections = await prisma.$queryRaw`
      SELECT 
        DATE("collectedAt") as date,
        COUNT(*)::int as count
      FROM "CollectionHistory"
      WHERE "collectedAt" >= NOW() - INTERVAL '7 days'
        AND "binId" IN (
          SELECT id FROM "Bin" WHERE "userId" = ${userId}
        )
      GROUP BY DATE("collectedAt")
      ORDER BY date ASC
    `;

    // Get route efficiency (mock data for now since routes are not fully implemented)
    const routeEfficiency = [
      { route: 'Route A', efficiency: 85 },
      { route: 'Route B', efficiency: 92 },
      { route: 'Route C', efficiency: 78 }
    ];

    res.json({
      dailyCollections: dailyCollections || [],
      routeEfficiency: routeEfficiency
    });
  } catch (error) {
    console.error('Error fetching dashboard analytics:', error);
    res.status(500).json({ 
      error: 'Failed to fetch dashboard analytics', 
      details: error.message 
    });
  }
}; 