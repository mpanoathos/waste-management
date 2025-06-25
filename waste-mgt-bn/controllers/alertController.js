const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get alerts for a company (optionally filter by status)
exports.getCompanyAlerts = async (req, res) => {
  try {
    const isAdmin = req.user && req.user.role === 'ADMIN';
    const companyId = req.user.companyId || req.query.companyId;
    const status = req.query.status;
    const where = {};

    if (companyId) where.companyId = Number(companyId);
    if (status) where.status = status;

    // If not admin and no companyId, return 400
    if (!isAdmin && !companyId) {
      return res.status(400).json({ message: 'Missing companyId' });
    }

    const alerts = await prisma.alert.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { bin: true }
    });
    res.json({ alerts });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Failed to fetch alerts', error: err.message });
  }
};

// Mark alert as resolved
exports.resolveAlert = async (req, res) => {
  try {
    const { alertId } = req.params;
    const alert = await prisma.alert.update({
      where: { id: Number(alertId) },
      data: { status: 'RESOLVED' }
    });
    res.json({ alert });
  } catch (err) {
    res.status(500).json({ message: 'Failed to resolve alert', error: err.message });
  }
}; 