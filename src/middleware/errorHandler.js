// Centralized Error Handling Middleware
const {
    ValidationError,
    AuthenticationError,
    AuthorizationError,
    NotFoundError,
    ConflictError,
    RateLimitError
} = require('../utils/errors');

const errorHandler = (err, req, res, next) => {
    // Log the error for debugging
    console.error(`[${new Date().toISOString()}] Error:`, {
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
        url: req.originalUrl,
        method: req.method,
        ip: req.ip
    });

    // If headers already sent, delegate to Express's default error handler
    if (res.headersSent) {
        return next(err);
    }

    // Handle Joi validation errors
    if (err.isJoi) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: err.details.map(detail => ({
                field: detail.path.join('.'),
                message: message.replace(/['"]/g, '') // Remove quotes from message
            }))
        });
    }

    // Handle custom application errors
    if (err instanceof ValidationError) {
        return res.status(400).json({
            success: false,
            message: err.message,
            errors: err.errors || []
        });
    }

    if (err instanceof AuthenticationError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message
        });
    }

    if (err instanceof AuthorizationError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message
        });
    }

    if (err instanceof NotFoundError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message
        });
    }

    if (err instanceof ConflictError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message
        });
    }

    if (err instanceof RateLimitError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message
        });
    }

    // Handle Mongoose validation errors
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: Object.values(err.errors).map(error => ({
                field: error.path,
                message: error.message
            }))
        });
    }

    // Handle Mongoose duplicate key errors
    if (err.code && err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        return res.status(409).json({
            success: false,
            message: `Duplicate value for ${field}`,
            errors: [{
                field,
                message: 'Must be unique'
            }]
        });
    }

    // Handle Mongoose cast errors
    if (err.name === 'CastError') {
        return res.status(400).json({
            success: false,
            message: 'Invalid input',
            errors: [{
                field: err.path,
                message: `${err.value} is not a valid ${err.path}`
            }]
        });
    }

    // Handle JWT authentication errors
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token'
        });
    }

    // Handle file upload errors (if using multer)
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
            success: false,
            message: 'File too large',
            errors: [{
                field: 'file',
                message: 'File size exceeds the allowed limit'
            }]
        });
    }

    // Handle all other errors (500 - Internal Server Error)
    return res.status(500).json({
        success: false,
        message: 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && {
            error: err.message,
            stack: err.stack
        })
    });
};

module.exports = errorHandler;