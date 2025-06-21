const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create a new bin
exports.createBin = async (req, res) => {
  const { location, status, fillLevel, latitude, longitude } = req.body;

  try {
    const bin = await prisma.bin.create({
      data: {
        location,
        status,     // e.g., "empty", "full"
        fillLevel: fillLevel || 0,  // e.g., percentage
        latitude: latitude || -1.9441,  // Default to Kigali coordinates
        longitude: longitude || 30.0619
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
    // Normalize status
    const normalizedBins = bins.map(bin => ({
      ...bin,
      status: bin.status === 'PARTIAL' ? 'HALF_FULL' : (bin.status ? bin.status.toUpperCase() : bin.status)
    }));
    res.status(200).json({ bins: normalizedBins });
  } catch (error) {
    res.status(500).json({ message: "Error fetching bins", error });
  }
};

// Update bin fill level/status
exports.updateBin = async (req, res) => {
  const { id } = req.params;
  const { fillLevel, status, latitude, longitude } = req.body;

  try {
    const bin = await prisma.bin.update({
      where: { id: Number(id) },
      data: {
        fillLevel,
        status,
        latitude,
        longitude,
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
    // Normalize status
    const result = bins.map(bin => ({
      id: bin.id,
      location: bin.location,
      status: bin.status === 'PARTIAL' ? 'HALF_FULL' : (bin.status ? bin.status.toUpperCase() : bin.status),
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
            latitude: -1.9441,  // Kigali coordinates
            longitude: 30.0619,
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
    // Normalize status
    const result = bins.map(bin => ({
      id: bin.id,
      location: bin.location,
      status: bin.status === 'PARTIAL' ? 'HALF_FULL' : (bin.status ? bin.status.toUpperCase() : bin.status),
      latestFillLevel: bin.sensorLogs[0]?.fillLevel ?? bin.fillLevel,
    }));
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user bins", error });
  }
};

exports.alertCompany = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    // Check if a pending request already exists for this bin and user
    const existing = await prisma.collectionRequest.findFirst({
      where: {
        binId: Number(id),
        userId,
        status: 'PENDING',
      },
    });
    if (existing) {
      return res.status(400).json({ message: 'A pending collection request already exists for this bin.' });
    }
    // Create a new collection request
    await prisma.collectionRequest.create({
      data: {
        binId: Number(id),
        userId,
        status: 'PENDING',
      },
    });
    res.json({ message: 'Company has been alerted for collection.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to alert company', error });
  }
};

exports.getPendingCollectionRequest = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  try {
    const existing = await prisma.collectionRequest.findFirst({
      where: {
        binId: Number(id),
        userId,
        status: 'PENDING',
      },
    });
    res.json({ hasPending: !!existing });
  } catch (error) {
    res.status(500).json({ message: 'Failed to check pending request', error });
  }
};

// Update existing bins with proper coordinates
exports.updateBinCoordinates = async (req, res) => {
  try {
    // Find all bins with coordinates 0,0 or null
    const binsToUpdate = await prisma.bin.findMany({
      where: {
        OR: [
          { latitude: 0 },
          { longitude: 0 },
          { latitude: null },
          { longitude: null }
        ]
      }
    });

    const updatePromises = binsToUpdate.map((bin, index) => {
      // Spread bins around Kigali with slight offsets
      const offset = index * 0.01; // Small offset for each bin
      return prisma.bin.update({
        where: { id: bin.id },
        data: {
          latitude: -1.9441 + offset,
          longitude: 30.0619 + offset
        }
      });
    });

    const updatedBins = await Promise.all(updatePromises);

    res.status(200).json({
      message: `Updated ${updatedBins.length} bins with proper coordinates`,
      updatedBins
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating bin coordinates", error });
  }
};

// Debug endpoint to check bin statuses
exports.debugBinStatuses = async (req, res) => {
  try {
    const bins = await prisma.bin.findMany({
      select: {
        id: true,
        status: true,
        location: true,
        latitude: true,
        longitude: true,
        userId: true
      }
    });
    
    const statusCounts = bins.reduce((acc, bin) => {
      acc[bin.status] = (acc[bin.status] || 0) + 1;
      return acc;
    }, {});
    
    const binsWithCoordinates = bins.filter(bin => bin.latitude && bin.longitude);
    const binsWithoutCoordinates = bins.filter(bin => !bin.latitude || !bin.longitude);
    
    res.status(200).json({
      totalBins: bins.length,
      statusCounts,
      binsWithCoordinates: binsWithCoordinates.length,
      binsWithoutCoordinates: binsWithoutCoordinates.length,
      sampleBins: bins.slice(0, 5),
      fullBins: bins.filter(bin => bin.status === 'FULL'),
      partialBins: bins.filter(bin => bin.status === 'PARTIAL'),
      emptyBins: bins.filter(bin => bin.status === 'EMPTY')
    });
  } catch (error) {
    res.status(500).json({ message: "Error debugging bin statuses", error });
  }
};
