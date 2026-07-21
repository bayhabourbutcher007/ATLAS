// Validation middleware using express-validator
const { body, validationResult } = require('express-validator');

// Validation rules for user registration
const validateRegistration = [
    body('username')
        .trim()
        .isLength({ min: 3, max: 30 })
        .withMessage('Username must be between 3 and 30 characters')
        .matches(/^[a-zA-Z0-9_-]+$/)
        .withMessage('Username can only contain letters, numbers, underscores, and hyphens'),

    body('email')
        .trim()
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),

    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
        .matches(/\d/)
        .withMessage('Password must contain at least one number'),

    body('firstName')
        .optional()
        .trim()
        .isLength({ max: 50 })
        .withMessage('First name cannot exceed 50 characters'),

    body('lastName')
        .optional()
        .trim()
        .isLength({ max: 50 })
        .withMessage('Last name cannot exceed 50 characters')
];

// Validation rules for user login
const validateLogin = [
    body('email')
        .trim()
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),

    body('password')
        .exists()
        .withMessage('Password is required')
];

// Middleware to handle validation errors
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array().map(err => ({
                field: err.param,
                message: err.msg
            }))
        });
    }
    next();
};

module.exports = {
    validateRegistration,
    validateLogin,
    validate
};