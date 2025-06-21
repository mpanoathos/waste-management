const express = require('express');
const router = express.Router();
const routeController = require('../controllers/routeController');
const { authenticateToken, isAdmin } = require('../middleware/auth');

// Get all routes
router.get('/', authenticateToken, isAdmin, routeController.getAllRoutes);

// Get all unassigned routes
router.get('/unassigned', authenticateToken, isAdmin, routeController.getUnassignedRoutes);

// Get all routes for a specific company (admin)
router.get('/company/:companyId', authenticateToken, isAdmin, routeController.getCompanyRoutes);

// Get routes for the authenticated company
router.get('/my', authenticateToken, routeController.getMyRoutes);

// Create a new route
router.post('/', authenticateToken, isAdmin, routeController.createRoute);

// Update a route
router.put('/:id', authenticateToken, isAdmin, routeController.updateRoute);

// Delete a route
router.delete('/:id', authenticateToken, isAdmin, routeController.deleteRoute);

// Assign a route to a company
router.post('/assign', authenticateToken, isAdmin, routeController.assignRouteToCompany);

// Get route statistics
router.get('/statistics', authenticateToken, isAdmin, routeController.getRouteStatistics);

module.exports = router; 