// Authentication Validation Schemas using Joi
const Joi = require('joi');

// Registration validation schema
const registerSchema = Joi.object({
    username: Joi.string()
        .trim()
        .min(3)
        .max(30)
        .required()
        .pattern(/^[a-zA-Z0-9_-]+$/)
        .message('Username must be between 3 and 30 characters and can only contain letters, numbers, underscores, and hyphens'),

    email: Joi.string()
        .trim()
        .email()
        .normalizeEmail()
        .required()
        .message('Please provide a valid email address'),

    password: Joi.string()
        .min(6)
        .required()
        .pattern(/\d/)
        .message('Password must be at least 6 characters long and contain at least one number'),

    firstName: Joi.string()
        .optional()
        .trim()
        .max(50)
        .allow('')
        .message('First name cannot exceed 50 characters'),

    lastName: Joi.string()
        .optional()
        .trim()
        .max(50)
        .allow('')
        .message('Last name cannot exceed 50 characters')
});

// Login validation schema
const loginSchema = Joi.object({
    email: Joi.string()
        .trim()
        .email()
        .normalizeEmail()
        .required()
        .message('Please provide a valid email address'),

    password: Joi.string()
        .required()
        .message('Password is required')
});

module.exports = {
    registerSchema,
    loginSchema
};