const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { AppError } = require('../utils/errorHandler');

const authenticateToken = async (req, res, next) => {
    try {
        // Get the token from the Authorization header
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            console.warn('Auth Middleware: No token provided');
            return res.status(403).json({ message: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        // Add the user info to the request object
        req.user = user;
        next();
    } catch (error) {
        console.warn('Auth Middleware: Invalid or expired token', error.message);
        return res.status(403).json({ message: 'Invalid or expired token' });
    }
};

const isAdmin = (req, res, next) => {
    if (req.user.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Access denied. Admin only.' });
    }
    next();
};

module.exports = {
    authenticateToken,
    isAdmin
}; 