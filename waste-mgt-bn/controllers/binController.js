const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create a new bin
exports.createBin = async (req, res) => {
  const { location, status, fillLevel, type } = req.body;

  try {
    const bin = await prisma.bin.create({
      data: {
        location,
        status,     // e.g., "empty", "full"
        fillLevel:0,  // e.g., percentage
        type        // e.g., "recyclable" or "organic"
      },
    });
    res.status(201).json({ message: "Bin created successfully", bin });
  } catch (error) {
    res.status(500).json({ message: "Error creating bin", error });
  }
};

// Get all bins
exports.getBins = async (req, res) => {
  try {
    const bins = await prisma.bin.findMany();
    res.status(200).json(bins);
  } catch (error) {
    res.status(500).json({ message: "Error fetching bins", error });
  }
};

// Update bin fill level/status
exports.updateBin = async (req, res) => {
  const { id } = req.params;
  const { fillLevel, status } = req.body;

  try {
    const bin = await prisma.bin.update({
      where: { id: Number(id) },
      data: {
        fillLevel,
        status,
      },
    });
    res.status(200).json({ message: "Bin updated", bin });
  } catch (error) {
    res.status(500).json({ message: "Error updating bin", error });
  }
};

// Delete a bin
exports.deleteBin = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.bin.delete({
      where: { id: Number(id) },
    });
    res.status(200).json({ message: "Bin deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting bin", error });
  }
};

exports.getBinsWithLatestFillLevel = async (req, res) => {
  try {
    const bins = await prisma.bin.findMany({
      include: {
        sensorLogs: {
          orderBy: { recordedAt: 'desc' },
          take: 1,
        },
      },
    });

    // Map to include latest fill level
    const result = bins.map(bin => ({
      id: bin.id,
      location: bin.location,
      type: bin.type,
      status: bin.status,
      latestFillLevel: bin.sensorLogs[0]?.fillLevel ?? bin.fillLevel,
    }));

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: "Error fetching bins with fill level", error });
  }
};

// Ensure all users have bins
exports.ensureAllUsersHaveBins = async (req, res) => {
  try {
    // Get users excluding those with roles "company" and "admin"
    const users = await prisma.user.findMany({
      where: {
        NOT: {
          role: {
            in: ['company', 'admin']
          }
        }
      }
    });
    const results = [];

    // For each user, check if they have a bin and create one if they don't
    for (const user of users) {
      const existingBin = await prisma.bin.findFirst({
        where: { userId: user.id }
      });

      if (!existingBin) {
        const newBin = await prisma.bin.create({
          data: {
            location: 'Kigali',
            status: 'EMPTY',
            fillLevel: 0,
            type: 'ORGANIC',
            userId: user.id
          }
        });
        results.push({
          userId: user.id,
          userName: user.name,
          userRole: user.role,
          action: 'created',
          bin: newBin
        });
      } else {
        results.push({
          userId: user.id,
          userName: user.name,
          userRole: user.role,
          action: 'already_exists',
          bin: existingBin
        });
      }
    }

    res.status(200).json({
      message: "Ensured all non-company and non-admin users have bins",
      results
    });
  } catch (error) {
    res.status(500).json({ message: "Error ensuring users have bins", error });
  }
};

// Get bins for the authenticated user
exports.getUserBins = async (req, res) => {
  try {
    const userId = req.user.id; // Get user ID from the authenticated request

    const bins = await prisma.bin.findMany({
      where: {
        userId: userId
      },
      include: {
        sensorLogs: {
          orderBy: { recordedAt: 'desc' },
          take: 1,
        },
      },
    });

    // Map to include latest fill level
    const result = bins.map(bin => ({
      id: bin.id,
      location: bin.location,
      type: bin.type,
      status: bin.status,
      latestFillLevel: bin.sensorLogs[0]?.fillLevel ?? bin.fillLevel,
    }));

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user bins", error });
  }
};
