// Health Validation Schemas using Joi
const Joi = require('joi');

// Vitals validation schema
const vitalsSchema = Joi.object({
    weight: Joi.number().min(0).allow(null),
    height: Joi.number().min(0).allow(null),
    bmi: Joi.number().min(0).allow(null),
    bloodPressure: Joi.object({
        systolic: Joi.number().min(0).allow(null),
        diastolic: Joi.number().min(0).allow(null)
    }).required(),
    restingHeartRate: Joi.number().min(0).allow(null)
});

// Activity validation schema
const activitySchema = Joi.object({
    steps: Joi.number().integer().min(0).required(),
    activeMinutes: Joi.number().integer().min(0).required(),
    workouts: Joi.array().items(Joi.object({
        type: Joi.string().trim().required(),
        durationMinutes: Joi.number().integer().min(0).required(),
        date: Joi.date().iso().required(),
        caloriesBurned: Joi.number().min(0).allow(null)
    })).default([])
});

// Workout validation schema (for adding a single workout)
const workoutSchema = Joi.object({
    type: Joi.string().trim().required(),
    durationMinutes: Joi.number().integer().min(0).required(),
    date: Joi.date().iso().required(),
    caloriesBurned: Joi.number().min(0).allow(null)
});

// Sleep validation schema
const sleepSchema = Joi.object({
    hoursPerNight: Joi.number().min(0).required(),
    quality: Joi.string().valid('poor', 'fair', 'good').allow(null, ''),
    consistency: Joi.number().min(0).max(1).required()
});

// Nutrition validation schema
const nutritionSchema = Joi.object({
    mealsPerDay: Joi.number().integer().min(0).required(),
    caloriesPerDay: Joi.number().min(0).required(),
    waterIntakeLiters: Joi.number().min(0).allow(null)
});

// ID validation schema (for goalId)
const idSchema = Joi.string().hex().length(24);

module.exports = {
    vitalsSchema,
    activitySchema,
    workoutSchema,
    sleepSchema,
    nutritionSchema,
    idSchema
};