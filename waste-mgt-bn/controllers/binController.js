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
