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

    const recentCollections = await prisma.collectionHistory.findMany({
      orderBy: { collectedAt: 'desc' },
      take: 10,
      include: { bin: true, collectedBy: true }
    });

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
      recentCollections
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