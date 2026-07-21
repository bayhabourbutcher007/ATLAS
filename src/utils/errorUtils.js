// Custom Error Classes
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

class ValidationError extends AppError {
    constructor(message, errors) {
        super(message || 'Validation failed', 400);
        this.errors = errors;
    }
}

class AuthenticationError extends AppError {
    constructor(message) {
        super(message || 'Authentication failed', 401);
    }
}

class AuthorizationError extends AppError {
    constructor(message) {
        super(message || 'Authorization failed', 403);
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

class ValidationError extends AppError {
    constructor(message, errors) {
        super(message || 'Validation failed', 400);
        this.errors = errors;
    }
}

module.exports = {
    AppError,
    ValidationError,
    AuthenticationError,
    AuthorizationError,
    NotFoundError,
    ConflictError
};