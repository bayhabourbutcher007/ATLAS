// Health Routes
const express = require('express');
const router = express.Router();
const healthController = require('../controllers/healthController');
const {
    vitalsSchema,
    activitySchema,
    workoutSchema,
    sleepSchema,
    nutritionSchema
} = require('../validation/health.validation');
const validate = require('../middleware/validation');
const authMiddleware = require('../middleware/authMiddleware');

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Get health snapshot for the authenticated user
router.get('/', healthController.getHealthSnapshot);

// Update health vitals
router.put('/vitals', validate(vitalsSchema), healthController.updateVitals);

// Update activity data
router.put('/activity', validate(activitySchema), healthController.updateActivity);

// Add a workout
router.post('/activity/workout', validate(workoutSchema), healthController.addWorkout);

// Update sleep data
router.put('/sleep', validate(sleepSchema), healthController.updateSleep);

// Update nutrition data
router.put('/nutrition', validate(nutritionSchema), healthController.updateNutrition);

// Add a health goal (references Goal model)
router.post('/goals/:goalId', healthController.addGoal);

// Remove a health goal
router.delete('/goals/:goalId', healthController.removeGoal);

module.exports = router;