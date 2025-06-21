const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all routes
exports.getAllRoutes = async (req, res) => {
  try {
    const routes = await prisma.route.findMany({
      include: {
        company: {
          select: {
            id: true,
            name: true,
            companyName: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.status(200).json({
      success: true,
      routes
    });
  } catch (error) {
    console.error('Error fetching routes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch routes',
      error: error.message
    });
  }
};

// Get routes for a specific company
exports.getCompanyRoutes = async (req, res) => {
  try {
    const { companyId } = req.params;

    const routes = await prisma.route.findMany({
      where: {
        companyId: parseInt(companyId)
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            companyName: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.status(200).json({
      success: true,
      routes
    });
  } catch (error) {
    console.error('Error fetching company routes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch company routes',
      error: error.message
    });
  }
};

// Get routes for the authenticated company
exports.getMyRoutes = async (req, res) => {
  try {
    const companyId = req.user.id;

    const routes = await prisma.route.findMany({
      where: {
        companyId: companyId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.status(200).json({
      success: true,
      routes
    });
  } catch (error) {
    console.error('Error fetching my routes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch your routes',
      error: error.message
    });
  }
};

// Create a new route
exports.createRoute = async (req, res) => {
  try {
    const { name, coordinates, companyId } = req.body;

    // Validate required fields
    if (!name || !coordinates) {
      return res.status(400).json({
        success: false,
        message: 'Route name and coordinates are required'
      });
    }

    // Validate coordinates format
    if (!Array.isArray(coordinates) || coordinates.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Coordinates must be an array with at least 2 points'
      });
    }

    // Validate each coordinate has lat and lng
    for (const coord of coordinates) {
      if (typeof coord.lat !== 'number' || typeof coord.lng !== 'number') {
        return res.status(400).json({
          success: false,
          message: 'Each coordinate must have lat and lng as numbers'
        });
      }
    }

    // If companyId is provided, verify the company exists and is approved
    if (companyId) {
      const company = await prisma.user.findFirst({
        where: {
          id: parseInt(companyId),
          role: 'COMPANY',
          approvalStatus: 'APPROVED'
        }
      });

      if (!company) {
        return res.status(400).json({
          success: false,
          message: 'Invalid company ID or company not approved'
        });
      }
    }

    const route = await prisma.route.create({
      data: {
        name,
        coordinates,
        companyId: companyId ? parseInt(companyId) : null
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            companyName: true,
            email: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Route created successfully',
      route
    });
  } catch (error) {
    console.error('Error creating route:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create route',
      error: error.message
    });
  }
};

// Update a route
exports.updateRoute = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, coordinates, companyId } = req.body;

    // Check if route exists
    const existingRoute = await prisma.route.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingRoute) {
      return res.status(404).json({
        success: false,
        message: 'Route not found'
      });
    }

    // Validate coordinates if provided
    if (coordinates) {
      if (!Array.isArray(coordinates) || coordinates.length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Coordinates must be an array with at least 2 points'
        });
      }

      for (const coord of coordinates) {
        if (typeof coord.lat !== 'number' || typeof coord.lng !== 'number') {
          return res.status(400).json({
            success: false,
            message: 'Each coordinate must have lat and lng as numbers'
          });
        }
      }
    }

    // If companyId is provided, verify the company exists and is approved
    if (companyId) {
      const company = await prisma.user.findFirst({
        where: {
          id: parseInt(companyId),
          role: 'COMPANY',
          approvalStatus: 'APPROVED'
        }
      });

      if (!company) {
        return res.status(400).json({
          success: false,
          message: 'Invalid company ID or company not approved'
        });
      }
    }

    const updatedRoute = await prisma.route.update({
      where: { id: parseInt(id) },
      data: {
        ...(name && { name }),
        ...(coordinates && { coordinates }),
        ...(companyId && { companyId: parseInt(companyId) })
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            companyName: true,
            email: true
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      message: 'Route updated successfully',
      route: updatedRoute
    });
  } catch (error) {
    console.error('Error updating route:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update route',
      error: error.message
    });
  }
};

// Delete a route
exports.deleteRoute = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if route exists
    const existingRoute = await prisma.route.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingRoute) {
      return res.status(404).json({
        success: false,
        message: 'Route not found'
      });
    }

    await prisma.route.delete({
      where: { id: parseInt(id) }
    });

    res.status(200).json({
      success: true,
      message: 'Route deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting route:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete route',
      error: error.message
    });
  }
};

// Assign route to company
exports.assignRouteToCompany = async (req, res) => {
  try {
    const { routeId, companyId } = req.body;

    if (!routeId || !companyId) {
      return res.status(400).json({
        success: false,
        message: 'Route ID and Company ID are required'
      });
    }

    // Check if route exists
    const route = await prisma.route.findUnique({
      where: { id: parseInt(routeId) }
    });

    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Route not found'
      });
    }

    // Check if company exists and is approved
    const company = await prisma.user.findFirst({
      where: {
        id: parseInt(companyId),
        role: 'COMPANY',
        approvalStatus: 'APPROVED'
      }
    });

    if (!company) {
      return res.status(400).json({
        success: false,
        message: 'Invalid company ID or company not approved'
      });
    }

    // Update route with company assignment
    const updatedRoute = await prisma.route.update({
      where: { id: parseInt(routeId) },
      data: {
        companyId: parseInt(companyId)
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            companyName: true,
            email: true
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      message: 'Route assigned to company successfully',
      route: updatedRoute
    });
  } catch (error) {
    console.error('Error assigning route to company:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign route to company',
      error: error.message
    });
  }
};

// Get unassigned routes
exports.getUnassignedRoutes = async (req, res) => {
  try {
    const routes = await prisma.route.findMany({
      where: {
        companyId: null
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.status(200).json({
      success: true,
      routes
    });
  } catch (error) {
    console.error('Error fetching unassigned routes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch unassigned routes',
      error: error.message
    });
  }
};

// Get route statistics
exports.getRouteStatistics = async (req, res) => {
  try {
    const totalRoutes = await prisma.route.count();
    const assignedRoutes = await prisma.route.count({
      where: {
        companyId: {
          not: null
        }
      }
    });
    const unassignedRoutes = totalRoutes - assignedRoutes;

    const routesByCompany = await prisma.route.groupBy({
      by: ['companyId'],
      _count: {
        id: true
      },
      where: {
        companyId: {
          not: null
        }
      }
    });

    res.status(200).json({
      success: true,
      statistics: {
        totalRoutes,
        assignedRoutes,
        unassignedRoutes,
        routesByCompany
      }
    });
  } catch (error) {
    console.error('Error fetching route statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch route statistics',
      error: error.message
    });
  }
}; 