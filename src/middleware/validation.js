// Joi Validation Middleware
const Joi = require('joi');

/**
 * Middleware for validating request data using Joi schemas
 * @param {Object} schema - Joi validation schema
 * @param {string} location - Where to validate ('body', 'query', 'params', 'headers')
 * @returns {Function} Express middleware function
 */
const validate = (schema, location = 'body') => {
    return (req, res, next) => {
        const options = {
            abortEarly: false, // Include all errors
            allowUnknown: true, // Ignore unknown props
            stripUnknown: true // Remove unknown props
        };

        const { error, value } = schema.validate(req[location], options);

        if (error) {
            const validationErrors = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message
            }));

            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validationErrors
            });
        }

        // Replace the validated data with cleaned version
        if (location === 'body') {
            req.body = value;
        } else if (location === 'query') {
            req.query = value;
        } else if (location === 'params') {
            req.params = value;
        } else if (location === 'headers') {
            req.headers = value;
        }

        next();
    };
};

module.exports = validate;