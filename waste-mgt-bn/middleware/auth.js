const jwt = require('jsonwebtoken');
const { AppError } = require('../utils/errorHandler');

const authenticateToken = (req, res, next) => {
    try {
        // Get the token from the Authorization header
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            throw new AppError('Authentication token is required', 401);
        }

        // Verify the token
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                if (err.name === 'TokenExpiredError') {
                    return next(new AppError('Token has expired', 401));
                }
                return next(new AppError('Invalid token', 401));
            }

            // Add the user info to the request object
            req.user = {
                id: decoded.userId,
                role: decoded.role
            };
            next();
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    authenticateToken
}; 