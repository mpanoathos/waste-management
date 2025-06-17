const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { authenticateToken, isAdmin } = require('../middleware/auth');

// Get all pending companies
router.get('/pending-companies', authenticateToken, isAdmin, async (req, res) => {
    try {
        // Find all companies with PENDING status
        const pendingCompanies = await prisma.user.findMany({
            where: {
                role: 'COMPANY',
                approvalStatus: 'PENDING'
            },
            select: {
                id: true,
                email: true,
                companyName: true,
                createdAt: true,
                role: true,
                approvalStatus: true
            }
        });

        res.json(pendingCompanies);
    } catch (error) {
        console.error('Error fetching pending companies:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Approve a company
router.post('/approve-company/:companyId', authenticateToken, isAdmin, async (req, res) => {
    try {
        const companyId = parseInt(req.params.companyId);
        
        if (isNaN(companyId)) {
            return res.status(400).json({ message: 'Invalid company ID' });
        }

        const company = await prisma.user.findUnique({
            where: {
                id: companyId
            }
        });
        
        if (!company) {
            return res.status(404).json({ message: 'Company not found' });
        }

        if (company.role !== 'COMPANY') {
            return res.status(400).json({ message: 'User is not a company' });
        }

        // Update company status to APPROVED
        const updatedCompany = await prisma.user.update({
            where: {
                id: companyId
            },
            data: {
                approvalStatus: 'APPROVED'
            }
        });

        res.json({ message: 'Company approved successfully', company: updatedCompany });
    } catch (error) {
        console.error('Error approving company:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 