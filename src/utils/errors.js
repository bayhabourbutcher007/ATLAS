// Centralized Error Definitions
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;

        // Maintain proper stack trace (only available on V8)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

class ValidationError extends AppError {
    constructor(message, errors = []) {
        super(message || 'Validation failed', 400);
        this.errors = Array.isArray(errors) ? errors : [errors];
    }
}

class AuthenticationError extends AppError {
    constructor(message) {
        super(message || 'Authentication failed', 401);
    }
}

class AuthorizationError extends AppError {
    constructor(message) {
        super(message || 'Authorization denied', 403);
    }
}

class NotFoundError extends AppError {
    constructor(message) {
        super(message || 'Resource not found', 404);
    }
}

class ConflictError extends AppError {
    constructor(message) {
        super(message || 'Resource conflict', 409);
    }
}

class RateLimitError extends AppError {
    constructor(message) {
        super(message || 'Rate limit exceeded', 429);
    }
}

module.exports = {
    AppError,
    ValidationError,
    AuthenticationError,
    AuthorizationError,
    NotFoundError,
    ConflictError,
    RateLimitError
};