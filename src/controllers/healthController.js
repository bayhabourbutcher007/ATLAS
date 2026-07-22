// Health Controller
const HealthService = require('../services/HealthService');
const {
    vitalsSchema,
    activitySchema,
    workoutSchema,
    sleepSchema,
    nutritionSchema,
    idSchema
} = require('../validation/health.validation');
const validate = require('../middleware/validation');

class HealthController {
    /**
     * Get health snapshot for the authenticated user
     */
    async getHealthSnapshot(req, res) {
        try {
            const userId = req.user.userId;
            const healthSnapshot = await HealthService.getHealthSnapshot(userId);

            res.status(200).json({
                success: true,
                message: 'Health snapshot retrieved successfully',
                data: healthSnapshot
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve health snapshot',
                error: error.message
            });
        }
    }

    /**
     * Update health vitals for the authenticated user
     */
    async updateVitals(req, res) {
        try {
            const userId = req.user.userId;
            // Validate request body
            await validate(req.body, vitalsSchema);

            const vitalsData = req.body;
            await HealthService.updateVitals(userId, vitalsData);

            res.status(200).json({
                success: true,
                message: 'Vitals updated successfully'
            });
        } catch (error) {
            if (error.name === 'ValidationError') {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    error: error.details ? error.details[0].message : error.message
                });
            }
            res.status(500).json({
                success: false,
                message: 'Failed to update vitals',
                error: error.message
            });
        }
    }

    /**
     * Update activity data for the authenticated user
     */
    async updateActivity(req, res) {
        try {
            const userId = req.user.userId;
            // Validate request body
            await validate(req.body, activitySchema);

            const activityData = req.body;
            await HealthService.updateActivity(userId, activityData);

            res.status(200).json({
                success: true,
                message: 'Activity data updated successfully'
            });
        } catch (error) {
            if (error.name === 'ValidationError') {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    error: error.details ? error.details[0].message : error.message
                });
            }
            res.status(500).json({
                success: false,
                message: 'Failed to update activity data',
                error: error.message
            });
        }
    }

    /**
     * Add a workout to the authenticated user's activity
     */
    async addWorkout(req, res) {
        try {
            const userId = req.user.userId;
            const { workoutData } = req.body;

            // Validate workout data
            await validate(workoutData, workoutSchema);

            await HealthService.addWorkout(userId, workoutData);

            res.status(200).json({
                success: true,
                message: 'Workout added successfully'
            });
        } catch (error) {
            if (error.name === 'ValidationError') {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    error: error.details ? error.details[0].message : error.message
                });
            }
            res.status(500).json({
                success: false,
                message: 'Failed to add workout',
                error: error.message
            });
        }
    }

    /**
     * Update sleep data for the authenticated user
     */
    async updateSleep(req, res) {
        try {
            const userId = req.user.userId;
            // Validate request body
            await validate(req.body, sleepSchema);

            const sleepData = req.body;
            await HealthService.updateSleep(userId, sleepData);

            res.status(200).json({
                success: true,
                message: 'Sleep data updated successfully'
            });
        } catch (error) {
            if (error.name === 'ValidationError') {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    error: error.details ? error.details[0].message : error.message
                });
            }
            res.status(500).json({
                success: false,
                message: 'Failed to update sleep data',
                error: error.message
            });
        }
    }

    /**
     * Update nutrition data for the authenticated user
     */
    async updateNutrition(req, res) {
        try {
            const userId = req.user.userId;
            // Validate request body
            await validate(req.body, nutritionSchema);

            const nutritionData = req.body;
            await HealthService.updateNutrition(userId, nutritionData);

            res.status(200).json({
                success: true,
                message: 'Nutrition data updated successfully'
            });
        } catch (error) {
            if (error.name === 'ValidationError') {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    error: error.details ? error.details[0].message : error.message
                });
            }
            res.status(500).json({
                success: false,
                message: 'Failed to update nutrition data',
                error: error.message
            });
        }
    }

    /**
     * Add a health goal for the authenticated user
     */
    async addGoal(req, res) {
        try {
            const userId = req.user.userId;
            const { goalId } = req.params;

            // Validate goalId
            await validate({ goalId }, { goalId: idSchema });

            await HealthService.addGoal(userId, goalId);

            res.status(200).json({
                success: true,
                message: 'Health goal added successfully'
            });
        } catch (error) {
            if (error.name === 'ValidationError') {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    error: error.details ? error.details[0].message : error.message
                });
            }
            res.status(500).json({
                success: false,
                message: 'Failed to add health goal',
                error: error.message
            });
        }
    }

    /**
     * Remove a health goal for the authenticated user
     */
    async removeGoal(req, res) {
        try {
            const userId = req.user.userId;
            const { goalId } = req.params;

            // Validate goalId
            await validate({ goalId }, { goalId: idSchema });

            await HealthService.removeGoal(userId, goalId);

            res.status(200).json({
                success: true,
                message: 'Health goal removed successfully'
            });
        } catch (error) {
            if (error.name === 'ValidationError') {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    error: error.details ? error.details[0].message : error.message
                });
            }
            res.status(500).json({
                success: false,
                message: 'Failed to remove health goal',
                error: error.message
            });
        }
    }
}

module.exports = new HealthController();