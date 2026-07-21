// User Validation Schemas using Joi
const Joi = require('joi');

// User ID validation schema (MongoDB ObjectId)
const userIdSchema = Joi.object({
    id: Joi.string()
        .regex(/^[0-9a-fA-F]{24}$/)
        .message('Invalid user ID format')
});

// User creation validation schema
const createUserSchema = Joi.object({
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
        .message('Last name cannot exceed 50 characters'),

    role: Joi.string()
        .valid('student', 'teacher', 'admin')
        .default('student'),

    preferences: Joi.object({
        theme: Joi.string().valid('light', 'dark', 'system'),
        notifications: Joi.object({
            email: Joi.boolean(),
            push: Joi.boolean()
        }),
        language: Joi.string()
    }).default(),

    profile: Joi.object({
        bio: Joi.string().max(500).allow(''),
        avatarUrl: Joi.string().allow(''),
        institution: Joi.string().max(100).allow(''),
        major: Joi.string().max(100).allow(''),
        graduationYear: Joi.number().integer().min(1900).max(2100).allow(null)
    }).default()
});

// User update validation schema (partial update)
const updateUserSchema = Joi.object({
    username: Joi.string()
        .trim()
        .min(3)
        .max(30)
        .pattern(/^[a-zA-Z0-9_-]+$/)
        .message('Username must be between 3 and 30 characters and can only contain letters, numbers, underscores, and hyphens'),

    email: Joi.string()
        .trim()
        .email()
        .normalizeEmail()
        .message('Please provide a valid email address'),

    password: Joi.string()
        .min(6)
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
        .message('Last name cannot exceed 50 characters'),

    role: Joi.string()
        .valid('student', 'teacher', 'admin'),

    preferences: Joi.object({
        theme: Joi.string().valid('light', 'dark', 'system'),
        notifications: Joi.object({
            email: Joi.boolean(),
            push: Joi.boolean()
        }),
        language: Joi.string()
    }),

    profile: Joi.object({
        bio: Joi.string().max(500).allow(''),
        avatarUrl: Joi.string().allow(''),
        institution: Joi.string().max(100).allow(''),
        major: Joi.string().max(100).allow(''),
        graduationYear: Joi.number().integer().min(1900).max(2100).allow(null)
    })
});

// Export schemas
module.exports = {
    userIdSchema,
    createUserSchema,
    updateUserSchema
};