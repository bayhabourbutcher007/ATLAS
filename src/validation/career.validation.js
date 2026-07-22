// Career Validation Schemas using Joi
const Joi = require('joi');

// Current position validation schema
const currentPositionSchema = Joi.object({
    title: Joi.string().trim().required(),
    company: Joi.string().trim().required(),
    startDate: Joi.date().iso().required(),
    employmentType: Joi.string().valid('full-time', 'part-time', 'contract', 'freelance', 'internship').required(),
    location: Joi.string().trim().required(),
    remote: Joi.boolean(),
    industry: Joi.string().trim().required(),
    salary: Joi.object({
        amount: Joi.number().min(0).required(),
        currency: Joi.string().uppercase().length(3).default('USD'),
        frequency: Joi.string().valid('monthly', 'annual').required()
    }).allow(null)
});

// Experience validation schema
const experienceSchema = Joi.object({
    title: Joi.string().trim().required(),
    company: Joi.string().trim().required(),
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().allow(null, ''),
    description: Joi.string().trim().allow('', null),
    skillsUsed: Joi.array().items(Joi.string().trim()).default([])
});

// Education validation schema
const educationSchema = Joi.object({
    institution: Joi.string().trim().required(),
    degree: Joi.string().trim().required(),
    fieldOfStudy: Joi.string().trim().required(),
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().allow(null, ''),
    gpa: Joi.number().min(0).max(4.0).allow(null, '')
});

// Certification validation schema
const certificationSchema = Joi.object({
    name: Joi.string().trim().required(),
    issuer: Joi.string().trim().required(),
    date: Joi.date().iso().required(),
    expiryDate: Joi.date().iso().allow(null, ''),
    credentialId: Joi.string().trim().allow('', null)
});

// Goal validation schema (same as in academic progress and finance)
const goalSchema = Joi.object({
    title: Joi.string().trim().min(1).max(200).required(),
    description: Joi.string().trim().max(1000).allow('', null),
    type: Joi.string().valid('Savings', 'Investment', 'DebtPayoff', 'Purchase', 'Other').required(),
    targetValue: Joi.number().min(0).required(),
    currentValue: Joi.number().min(0).default(0),
    startDate: Joi.date().iso().allow(null),
    targetDate: Joi.date().iso().allow(null),
    status: Joi.string().valid('NotStarted', 'InProgress', 'Completed', 'Paused', 'Cancelled').default('NotStarted'),
    priority: Joi.string().valid('Low', 'Medium', 'High').default('Medium'),
    completed: Joi.boolean().default(false)
});

module.exports = {
    currentPositionSchema,
    experienceSchema,
    educationSchema,
    certificationSchema,
    goalSchema
};