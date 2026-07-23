// Health Service
const Health = require('../models/Health');
const { ObjectId } = require('mongoose').Types;
const HealthSnapshot = require('../models/HealthSnapshot');

class HealthService {
    /**
     * Get health snapshot for a user - returns DTO matching HealthDTO format
     * @param {string} userId - User ID
     * @returns {Promise<Object>} Health DTO object
     */
    async getHealthSnapshot(userId) {
        let healthDoc = await Health.findOne({ userId });

        // If no health record exists, return empty DTO structure
        if (!healthDoc) {
            return this.getEmptyHealthDTO();
        }

        // Convert to plain object
        const obj = healthDoc.toObject();

        // Transform to match the exact DTO structure from CONTACT_SCHEMA.md
        const dto = {
            vitals: {
                weight: obj.vitals?.weight ?? null,
                height: obj.vitals?.height ?? null,
                bmi: obj.vitals?.bmi ?? null,
                bloodPressure: {
                    systolic: obj.vitals?.bloodPressure?.systolic ?? null,
                    diastolic: obj.vitals?.bloodPressure?.diastolic ?? null
                },
                restingHeartRate: obj.vitals?.restingHeartRate ?? null
            },
            activity: {
                steps: obj.activity?.steps ?? 0,
                activeMinutes: obj.activity?.activeMinutes ?? 0,
                workouts: (obj.activity?.workouts || []).map(workout => ({
                    type: workout.type ?? '',
                    durationMinutes: workout.durationMinutes ?? 0,
                    date: workout.date ? new Date(workout.date).toISOString() : null,
                    caloriesBurned: workout.caloriesBurned ?? null
                }))
            },
            sleep: {
                hoursPerNight: obj.sleep?.hoursPerNight ?? 0,
                quality: obj.sleep?.quality ?? null,
                consistency: obj.sleep?.consistency ?? 0
            },
            nutrition: {
                mealsPerDay: obj.nutrition?.mealsPerDay ?? 0,
                caloriesPerDay: obj.nutrition?.caloriesPerDay ?? 0,
                waterIntakeLiters: obj.nutrition?.waterIntakeLiters ?? null
            },
            goals: [] // Goals are referenced but would need to be populated from Goal model - for now return empty array
        };

        return dto;
    }

    /**
     * Get empty health DTO structure
     * @returns {Object} Empty health DTO
     */
    getEmptyHealthDTO() {
        return {
            vitals: {
                weight: null,
                height: null,
                bmi: null,
                bloodPressure: {
                    systolic: null,
                    diastolic: null
                },
                restingHeartRate: null
            },
            activity: {
                steps: 0,
                activeMinutes: 0,
                workouts: []
            },
            sleep: {
                hoursPerNight: 0,
                quality: null,
                consistency: 0
            },
            nutrition: {
                mealsPerDay: 0,
                caloriesPerDay: 0,
                waterIntakeLiters: null
            },
            goals: []
        };
    }

    /**
     * Get health document for a user
     * @param {string} userId - User ID
     * @returns {Promise<Object>} Health document (or null)
     */
    async getHealthDoc(userId) {
        return await Health.findOne({ userId });
    }

    /**
     * Update health vitals for a user
     * @param {string} userId - User ID
     * @param {Object} vitalsData - { weight, height, bmi, bloodPressure { systolic, diastolic }, restingHeartRate }
     * @returns {Promise<Object>} Updated health DTO
     */
    async updateVitals(userId, vitalsData) {
        const { weight, height, bmi, bloodPressure, restingHeartRate } = vitalsData;

        // Calculate BMI if weight and height are provided but bmi is not
        let calculatedBMI = bmi;
        if (calculatedBMI === null && weight !== null && height !== null) {
            const heightInMeters = height / 100; // convert cm to m
            calculatedBMI = weight / (heightInMeters * heightInMeters);
        }

        let healthDoc = await Health.findOneAndUpdate(
            { userId },
            {
                $set: {
                    'vitals.weight': weight,
                    'vitals.height': height,
                    'vitals.bmi': calculatedBMI,
                    'vitals.bloodPressure.systolic': bloodPressure?.systolic ?? null,
                    'vitals.bloodPressure.diastolic': bloodPressure?.diastolic ?? null,
                    'vitals.restingHeartRate': restingHeartRate,
                    'updatedAt': new Date()
                }
            },
            { new: true, upsert: true }
        );

        if (!healthDoc) {
            throw new Error('Health document not found');
        }

        return this.getHealthSnapshot(userId);
    }

    /**
     * Update activity data for a user
     * @param {string} userId - User ID
     * @param {Object} activityData - { steps, activeMinutes, workouts[] }
     * @returns {Promise<Object>} Updated health DTO
     */
    async updateActivity(userId, activityData) {
        const { steps, activeMinutes, workouts } = activityData;

        let healthDoc = await Health.findOneAndUpdate(
            { userId },
            {
                $set: {
                    'activity.steps': steps,
                    'activity.activeMinutes': activeMinutes,
                    'activity.workouts': workouts || [],
                    'updatedAt': new Date()
                }
            },
            { new: true, upsert: true }
        );

        if (!healthDoc) {
            throw new Error('Health document not found');
        }

        return this.getHealthSnapshot(userId);
    }

    /**
     * Add a workout to user's activity
     * @param {string} userId - User ID
     * @param {Object} workoutData - { type, durationMinutes, date, caloriesBurned? }
     * @returns {Promise<Object>} Updated health DTO
     */
    async addWorkout(userId, workoutData) {
        const { type, durationMinutes, date, caloriesBurned } = workoutData;

        let healthDoc = await Health.findOne({ userId });
        if (!healthDoc) {
            // Create new health document if none exists
            let newHealth = new Health({
                userId,
                activity: {
                    workouts: [{
                        type,
                        durationMinutes,
                        date: new Date(date),
                        caloriesBurned: caloriesBurned ?? null
                    }]
                }
            });
            await newHealth.save();
            return this.getHealthSnapshot(userId);
        }

        // Add workout to existing workouts array
        healthDoc.activity.workouts.push({
            type,
            durationMinutes,
            date: new Date(date),
            caloriesBurned: caloriesBurned ?? null
        });

        await healthDoc.save();
        return this.getHealthSnapshot(userId);
    }

    /**
     * Update sleep data for a user
     * @param {string} userId - userId - User ID
     * @param {Object} sleepData - { hoursPerNight, quality, consistency }
     * @returns {Promise<Object>} Updated health DTO
     */
    async updateSleep(userId, sleepData) {
        const { hoursPerNight, quality, consistency } = sleepData;

        let healthDoc = await Health.findOneAndUpdate(
            { userId },
            {
                $set: {
                    'sleep.hoursPerNight': hoursPerNight,
                    'sleep.quality': quality,
                    'sleep.consistency': consistency ,
                    'updatedAt': new Date()
                }
            },
            { new: true, upsert: true }
        );

        if (!healthDoc) {
            throw new Error('Health document not found');
        }

        return this.getHealthSnapshot(userId);
    }

    /**
     * Update nutrition data for a user
     * @param {string} userId - User ID
     * @param {Object} nutritionData - { mealsPerDay, caloriesPerDay, waterIntakeLiters }
     * @returns {Promise<Object>} Updated health DTO
     */
    async updateNutrition(userId, nutritionData) {
        const { mealsPerDay, caloriesPerDay, waterIntakeLiters } = nutritionData;

        let healthDoc = await Health.findOneAndUpdate(
            { userId },
            {
                $set: {
                    'nutrition.mealsPerDay': mealsPerDay,
                    'nutrition.caloriesPerDay': caloriesPerDay,
                    'nutrition.waterIntakeLiters': waterIntakeLiters,
                    'updatedAt': new Date()
                }
            },
            { new: true, upsert: true }
        );

        if (!healthDoc) {
            throw new Error('Health document not found');
        }

        return this.getHealthSnapshot(userId);
    }

    /**
     * Add a health goal for a user (references Goal model)
     * @param {string} userId - User ID
     * @param {string} goalId - Goal ID to reference
     * @returns {Promise<Object>} Updated health DTO
     */
    async addGoal(userId, goalId) {
        let healthDoc = await Health.findOneAndUpdate(
            { userId },
            {
                $addToSet: { goals: goalId }, // Add to set to avoid duplicates
                $set: { updatedAt: new Date() }
            },
            { new: true, upsert: true }
        );

        if (!healthDoc) {
            throw new Error('Health document not found');
        }

        return this.getHealthSnapshot(userId);
    }

    /**
     * Remove a health goal for a user
     * @param {string} userId - User ID
     * @param {string} goalId - Goal ID to remove
     * @returns {Promise<Object>} Updated health DTO
     */
    async removeGoal(userId, goalId) {
        let healthDoc = await Health.findOneAndUpdate(
            { userId },
            {
                $pull: { goals: goalId },
                $set: { updatedAt: new Date() }
            },
            { new: true }
        );

        if (!healthDoc) {
            throw new Error('Health document not found');
        }

        return this.getHealthSnapshot(userId);
    }

    /**
     * Get health history for a user - returns array of health DTOs
     * @param {string} userId - User ID
     * @param {Object} options - { startDate, endDate, interval, aggregation }
//Note: In Phase 3A, we only support raw interval (no aggregation)
     * @returns {Promise<Array>} Array of health DTO objects
     */
    async getHealthHistory(userId, options = {}) {
        const startDate = options.startDate ? new Date(options.startDate) : undefined;
        const endDate = options.endDate ? new Date(options.endDate) : new Date();
        let start = startDate;
        let end = endDate;
        if (!start) {
            start = new Date(end);
        }
        if (start.getTime() > end.getTime()) {
            const temp = start;
            start = end;
            end = temp;
        }
        // We only support raw interval in Phase 3A
        const query = {
            userId,
            timestamp: {
                $gte: start,
                $lte: end
            }
        };
        // Sort by timestamp ascending
        const snapshots = await HealthSnapshot.find(query).sort({ timestamp: 1 });

        // Build DTO for each snapshot (mirroring getHealthSnapshot logic)
        return snapshots.map(snap => {
            const obj = snap.toObject();
            return {
                vitals: {
                    weight: obj.vitals?.weight ?? null,
                    height: obj.vitals?.height ?? null,
                    bmi: obj.vitals?.bmi ?? null,
                    bloodPressure: {
                        systolic: obj.vitals?.bloodPressure?.systolic ?? null,
                        diastolic: obj.vitals?.bloodPressure?.diastolic ?? null
                    },
                    restingHeartRate: obj.vitals?.restingHeartRate ?? null
                },
                activity: {
                    steps: obj.activity?.steps ?? 0,
                    activeMinutes: obj.activity?.activeMinutes ?? 0,
                    workouts: (obj.activity?.workouts || []).map(workout => ({
                        type: workout.type ?? '',
                        durationMinutes: workout.durationMinutes ?? 0,
                        date: workout.date ? new Date(workout.date).toISOString() : null,
                        caloriesBurned: workout.caloriesBurned ?? null
                    }))
                },
                sleep: {
                    hoursPerNight: obj.sleep?.hoursPerNight ?? 0,
                    quality: obj.sleep?.quality ?? null,
                    consistency: obj.sleep?.consistency ?? 0
                },
                nutrition: {
                    mealsPerDay: obj.nutrition?.mealsPerDay ?? 0,
                    caloriesPerDay: obj.nutrition?.caloriesPerDay ?? 0,
                    waterIntakeLiters: obj.nutrition?.waterIntakeLiters ?? null
                },
                goals: [] // Goals are referenced but would need to be populated from Goal model - for now return empty array
            };
        });
    }
}

module.exports = new HealthService();