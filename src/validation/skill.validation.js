// Skill Validation Schemas using Joi
const Joi = require('joi');

// Evidence validation schema
const evidenceSchema = Joi.object({
    type: Joi.string().valid('course', 'project', 'certification', 'self-assessment').required(),
    description: Joi.string().trim().required(),
    date: Joi.date().iso().required(),
    url: Joi.string().uri().allow('', null)
});

// Skill validation schema (for creating/updating a skill)
const skillSchema = Joi.object({
    name: Joi.string().trim().min(1).required(),
    category: Joi.string().trim().allow('', null),
    proficiency: Joi.number().min(0).max(100).required(),
    goalLevel: Joi.number().min(0).max(100).allow(null, ''),
    evidence: Joi.array().items(evidenceSchema).default([]),
    lastPracticed: Joi.date().iso().allow(null, '')
});

// Practice log validation schema
const practiceSchema = Joi.object({
    minutes: Joi.number().integer().min(1).required()
});

// Proficiency validation schema
const proficiencySchema = Joi.number().min(0).max(100).required();

// Goal level validation schema (allows null to clear)
const goalLevelSchema = Joi.number().min(0).max(100).allow(null, '');

// ID validation schema (for skillId, evidenceId)
const idSchema = Joi.string().hex().length(24);

module.exports = {
    evidenceSchema,
    skillSchema,
    practiceSchema,
    proficiencySchema,
    goalLevelSchema,
    idSchema
};