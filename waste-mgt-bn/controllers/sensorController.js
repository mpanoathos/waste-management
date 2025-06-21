const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// POST /sensors/:binId/data
exports.logSensorData = async (req, res) => {
  const { binId } = req.params;
  const { fillLevel, temperature, humidity, wasteType } = req.body;

  try {
    const bin = await prisma.bin.findUnique({ 
      where: { id: parseInt(binId) }
    });
    
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

    // Update bin status based on fill level
    let newStatus = 'EMPTY';
    if (fillLevel >= 80) newStatus = 'FULL';
    else if (fillLevel >= 50) newStatus = 'PARTIAL';

    await prisma.bin.update({
      where: { id: parseInt(binId) },
      data: { 
        status: newStatus,
        fillLevel: fillLevel
      }
    });

    res.status(201).json({ 
      message: 'Sensor data logged', 
      data: sensorLog,
      binStatus: newStatus
    });
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
