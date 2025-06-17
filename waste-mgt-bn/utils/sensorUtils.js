const { SerialPort, ReadlineParser } = require('serialport');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function setupSensor(io) {
  const serialPort = new SerialPort({ path: 'COM3', baudRate: 9600 });
  const parser = serialPort.pipe(new ReadlineParser({ delimiter: '\n' }));

  parser.on('data', async (data) => {
    const value = parseFloat(data.trim());
    if (isNaN(value)) return;

    try {
      const latestBin = await prisma.bin.findFirst({
        orderBy: { createdAt: 'desc' },
      });

      if (!latestBin) {
        console.error('No bin found in the database.');
        return;
      }

      await prisma.bin.update({
        where: { id: latestBin.id },
        data: {
          fillLevel: Math.round(value),
          status: value > 80 ? 'FULL' : 'EMPTY',
        },
      });

      await prisma.sensorLog.create({
        data: {
          binId: latestBin.id,
          fillLevel: Math.round(value),
        },
      });

      // Emit to front end
      io.emit('sensorUpdate', {
        binId: latestBin.id,
        fillLevel: Math.round(value),
        timestamp: new Date(),
      });

    } catch (err) {
      console.error('Error updating bin or saving SensorLog:', err);
    }
  });
}

module.exports = setupSensor;
