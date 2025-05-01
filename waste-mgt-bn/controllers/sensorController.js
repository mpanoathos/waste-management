const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// POST /sensors/:binId/data
exports.logSensorData = async (req, res) => {
  const { binId } = req.params;
  const { fillLevel, temperature, humidity, wasteType } = req.body;

  try {
    const bin = await prisma.bin.findUnique({ where: { id: parseInt(binId) } });
    if (!bin) return res.status(404).json({ message: 'Bin not found' });

    const sensorLog = await prisma.sensorLog.create({
      data: {
        binId: parseInt(binId),
        fillLevel,
        temperature,
        humidity,
        wasteType
      }
    });

    // Optional: Alert if bin is full
    if (fillLevel >= 90) {
      console.log(`⚠️ Bin ${binId} is almost full.`);
      // TODO: Notify user or waste manager
    }

    res.status(201).json({ message: 'Sensor data logged', data: sensorLog });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to log sensor data', error });
  }
};

// GET /sensors/:binId/logs
exports.getSensorLogsForBin = async (req, res) => {
  const { binId } = req.params;

  try {
    const logs = await prisma.sensorLog.findMany({
      where: { binId: parseInt(binId) },
      orderBy: { timestamp: 'desc' },
    });

    res.status(200).json({ message: 'Logs retrieved', data: logs });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to retrieve logs', error });
  }
};

// GET /sensors/recent
exports.getRecentSensorLogs = async (req, res) => {
  try {
    const recentLogs = await prisma.sensorLog.findMany({
      take: 10,
      orderBy: { timestamp: 'desc' },
      include: {
        bin: true
      }
    });

    res.status(200).json({ message: 'Recent sensor logs', data: recentLogs });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch recent logs', error });
  }
};
