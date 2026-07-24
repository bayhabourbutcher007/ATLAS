// Snapshot Worker Service
const cron = require('node-cron');
const User = require('../models/User');
const UserSnapshot = require('../models/UserSnapshot');
const AcademicProgress = require('../models/AcademicProgress');
const AcademicSnapshot = require('../models/AcademicSnapshot');
const Finance = require('../models/Finance');
const FinanceSnapshot = require('../models/FinanceSnapshot');
const Skill = require('../models/Skill');
const SkillSnapshot = require('../models/SkillSnapshot');
const Health = require('../models/Health');
const HealthSnapshot = require('../models/HealthSnapshot');
const Career = require('../models/Career');
const CareerSnapshot = require('../models/CareerSnapshot');
const Time = require('../models/Time');
const TimeSnapshot = require('../models/TimeSnapshot');
const EmotionalState = require('../models/EmotionalState');
const config = require('../config/config');
const { ValidationError } = require('../utils/errors');

class SnapshotWorkerService {
    constructor() {
        this.scheduledJob = null;
        this.running = false;
    }

    /**
     * Start the snapshot worker
     * @returns {Promise<void>}
     */
    async start() {
        if (!config.snapshot.enabled) {
            console.log('Snapshot worker is disabled in configuration');
            return;
        }

        if (this.running) {
            console.log('Snapshot worker is already running');
            return;
        }

        try {
            // Schedule the job based on the cron expression from config
            this.scheduledJob = cron.schedule(config.snapshot.interval, async () => {
                console.log(`Snapshot worker started at ${new Date().toISOString()}`);
                await this.captureSnapshotsForAllUsers();
                console.log(`Snapshot worker completed at ${new Date().toISOString()}`);
            }, {
                // Run immediately on start for testing? No, wait for the schedule.
                // We can set to false to not run immediately.
                scheduled: true,
                timezone: null // Use local timezone
            });

            this.running = true;
            console.log(`Snapshot worker scheduled with expression: ${config.snapshot.interval}`);
        } catch (error) {
            console.error('Failed to start snapshot worker:', error);
            throw error;
        }
    }

    /**
     * Stop the snapshot worker
     * @returns {Promise<void>}
     */
    async stop() {
        if (!this.running) {
            console.log('Snapshot worker is not running');
            return;
        }

        if (this.scheduledJob) {
            this.scheduledJob.stop();
            this.scheduledJob = null;
            this.running = false;
            console.log('Snapshot worker stopped');
        }
    }

    /**
     * Capture snapshots for all users
     * @returns {Promise<void>}
     */
    async captureSnapshotsForAllUsers() {
        try {
            // Get all user IDs
            const users = await User.find({}, '_id').lean();
            const userIds = users.map(user => user._id);

            console.log(`Processing snapshots for ${userIds.length} users`);

            // Process each user
            for (const userId of userIds) {
                try {
                    await this.captureSnapshotsForUser(userId);
                } catch (userError) {
                    console.error(`Failed to capture snapshots for user ${userId}:`, userError.message);
                    // Continue with other users
                }
            }
        } catch (error) {
            console.error('Failed to fetch users for snapshot processing:', error);
            throw error;
        }
    }

    /**
     * Capture snapshots for a specific user
     * @param {string|ObjectId} userId - User ID
     * @returns {Promise<void>}
     */
    async captureSnapshotsForUser(userId) {
        const timestamp = new Date(); // Same timestamp for all snapshots in this cycle

        // We'll capture each domain's snapshot and store it
        const snapshots = [];

        // User snapshot
        try {
            const userDoc = await User.findById(userId).select('-password -__v').lean();
            if (userDoc) {
                const userSnapshot = new UserSnapshot({
                    userId: userDoc._id,
                    timestamp: timestamp,
                    role: userDoc.role,
                    firstName: userDoc.firstName ?? '',
                    lastName: userDoc.lastName ?? '',
                    preferences: {
                        theme: userDoc.preferences?.theme ?? 'system',
                        notifications: {
                            email: !!userDoc.preferences?.notifications?.email,
                            push: !!userDoc.preferences?.notifications?.push
                        },
                        language: userDoc.preferences?.language ?? 'en'
                    }
                });
                await userSnapshot.save();
                snapshots.push({ domain: 'user', success: true });
            } else {
                console.warn(`User not found: ${userId}`);
                snapshots.push({ domain: 'user', success: false, error: 'User not found' });
            }
        } catch (error) {
            console.error(`Error capturing user snapshot for ${userId}:`, error);
            snapshots.push({ domain: 'user', success: false, error: error.message });
        }

        // Academic snapshot
        try {
            const academicDoc = await AcademicProgress.findOne({ userId }).lean();
            const academicSnapshot = new AcademicSnapshot({
                userId,
                timestamp: timestamp,
                ...academicDoc
            });
            delete academicSnapshot._id;
            await academicSnapshot.save();
            snapshots.push({ domain: 'academics', success: true });
        } catch (error) {
            console.error(`Error capturing academic snapshot for ${userId}:`, error);
            snapshots.push({ domain: 'academics', success: false, error: error.message });
        }

        // Finance snapshot
        try {
            const financeDoc = await Finance.findOne({ userId }).lean();
            const financeSnapshot = new FinanceSnapshot({
                userId,
                timestamp: timestamp,
                ...financeDoc
            });
            delete financeSnapshot._id;
            await financeSnapshot.save();
            snapshots.push({ domain: 'finance', success: true });
        } catch (error) {
            console.error(`Error capturing finance snapshot for ${userId}:`, error);
            snapshots.push({ domain: 'finance', success: false, error: error.message });
        }

        // Skill snapshot
        try {
            const skillDoc = await Skill.findOne({ userId }).lean();
            const skillSnapshot = new SkillSnapshot({
                userId,
                timestamp: timestamp,
                ...skillDoc
            });
            delete skillSnapshot._id;
            await skillSnapshot.save();
            snapshots.push({ domain: 'skills', success: true });
        } catch (error) {
            console.error(`Error capturing skill snapshot for ${userId}:`, error);
            snapshots.push({ domain: 'skills', success: false, error: error.message });
        }

        // Health snapshot
        try {
            const healthDoc = await Health.findOne({ userId }).lean();
            const healthSnapshot = new HealthSnapshot({
                userId,
                timestamp: timestamp,
                ...healthDoc
            });
            delete healthSnapshot._id;
            await healthSnapshot.save();
            snapshots.push({ domain: 'health', success: true });
        } catch (error) {
            console.error(`Error capturing health snapshot for ${userId}:`, error);
            snapshots.push({ domain: 'health', success: false, error: error.message });
        }

        // Career snapshot
        try {
            const careerDoc = await Career.findOne({ userId }).lean();
            const careerSnapshot = new CareerSnapshot({
                userId,
                timestamp: timestamp,
                ...careerDoc
            });
            delete careerSnapshot._id;
            await careerSnapshot.save();
            snapshots.push({ domain: 'career', success: true });
        } catch (error) {
            console.error(`Error capturing career snapshot for ${userId}:`, error);
            snapshots.push({ domain: 'career', success: false, error: error.message });
        }

        // Time snapshot
        try {
            const timeDoc = await Time.findOne({ userId }).lean();
            const timeSnapshot = new TimeSnapshot({
                userId,
                timestamp: timestamp,
                ...timeDoc
            });
            delete timeSnapshot._id;
            await timeSnapshot.save();
            snapshots.push({ domain: 'time', success: true });
        } catch (error) {
            console.error(`Error capturing time snapshot for ${userId}:`, error);
            snapshots.push({ domain: 'time', success: false, error: error.message });
        }

        // Emotional state snapshot
        try {
            // Get the latest emotional state document for the user to copy its state
            const latestEmoDoc = await EmotionalState.findOne({ userId }).sort({ timestamp: -1 }).lean();

            // Create a new emotional state document for the snapshot
            const emoSnapshot = new EmotionalState({
                userId,
                timestamp: timestamp, // Override the timestamp to the snapshot time
                mood: latestEmoDoc ? {
                    value: latestEmoDoc.mood.value,
                    label: latestEmoDoc.mood.label
                } : { value: 0, label: 'neutral' },
                stress: latestEmoDoc ? latestEmoDoc.stress : 0,
                energy: latestEmoDoc ? latestEmoDoc.energy : 0,
                focus: latestEmoDoc ? latestEmoDoc.focus : 0,
                notes: latestEmoDoc ? latestEmoDoc.notes : '',
                tags: latestEmoDoc ? latestEmoDoc.tags : []
            });
            await emoSnapshot.save();
            snapshots.push({ domain: 'emotional_state', success: true });
        } catch (error) {
            console.error(`Error capturing emotional state snapshot for ${userId}:`, error);
            snapshots.push({ domain: 'emotional_state', success: false, error: error.message });
        }

        // Log summary for this user
        const successes = snapshots.filter(s => s.success).length;
        const failures = snapshots.length - successes;
        if (failures > 0) {
            console.warn(`User ${userId}: ${successes} snapshots succeeded, ${failures} failed`);
        } else {
            console.debug(`User ${userId}: All ${successes} snapshots succeeded`);
        }
    }
}

module.exports = new SnapshotWorkerService();