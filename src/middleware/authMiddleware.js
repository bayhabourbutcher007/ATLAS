// Authentication middleware
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/config');

const authMiddleware = (req, res, next) => {
    // Get token from header
    const authHeader = req.headers.authorization;

    // Check if token exists
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            message: 'Access denied. No token provided.'
        });
    }

    // Extract token
    const token = authHeader.split(' ')[1];

    // Verify token
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        // Attach user info to request object
        req.user = {
            userId: decoded.userId,
            username: decoded.username,
            email: decoded.email
        };
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token has expired'
            });
        }

        return res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }
};

module.exports = authMiddleware;