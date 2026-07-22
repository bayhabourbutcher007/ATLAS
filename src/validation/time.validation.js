// Time Validation Schemas using Joi
const Joi = require('joi');

// Calendar event validation schema matching TimeDTO structure
const calendarEventSchema = Joi.object({
    title: Joi.string().trim().required(),
    description: Joi.string().trim().allow('', null),
    start: Joi.date().iso().required(),
    end: Joi.date().iso().required(),
    allDay: Joi.boolean(),
    location: Joi.string().trim().allow('', null),
    attendees: Joi.array().items(Joi.string().trim()),
    recurrence: Joi.object({
        frequency: Joi.string().valid('daily', 'weekly', 'monthly', 'yearly'),
        interval: Joi.number().integer().min(1),
        until: Joi.date().iso().allow(null),
        byday: Joi.array().items(Joi.string().valid('SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'))
    }),
    category: Joi.string().valid('work', 'personal', 'health', 'finance', 'learning', 'social').required()
});

// Availability slot validation schema matching TimeDTO structure
const availabilitySlotSchema = Joi.object({
    start: Joi.date().iso().required(),
    end: Joi.date().iso().required(),
    type: Joi.string().valid('focus', 'meeting', 'break', 'personal').required()
});

// Time zone validation schema (for updates)
const timeZoneSchema = Joi.object({
    home: Joi.string().allow(null),
    work: Joi.string().allow(null)
});

module.exports = {
    calendarEventSchema,
    availabilitySlotSchema,
    timeZoneSchema
};