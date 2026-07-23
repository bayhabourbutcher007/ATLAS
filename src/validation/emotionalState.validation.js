// EmotionalState Validation Schemas using Joi
const Joi = require('joi');

// Emotional state validation schema matching EmotionalStateDTO structure
const emotionalStateSchema = Joi.object({
    mood: Joi.object({
        value: Joi.number().integer().min(-5).max(5).required(),
        label: Joi.string().valid('very_sad', 'sad', 'neutral', 'happy', 'very_happy').required()
    }).required(),
    stress: Joi.number().integer().min(0).max(100).required(),
    energy: Joi.number().integer().min(0).max(100).required(),
    focus: Joi.number().integer().min(0).max(100).required(),
    notes: Joi.string().trim().allow('', null),
    tags: Joi.array().items(Joi.string().trim())
});

// Emotional state history query validation schema
const emotionalStateHistorySchema = Joi.object({
    limit: Joi.number().integer().min(1).max(100).default(50),
    offset: Joi.number().integer().min(0).default(0),
    startDate: Joi.date().iso(),
    endDate: Joi.date().iso()
});

module.exports = {
    emotionalStateSchema,
    emotionalStateHistorySchema
};