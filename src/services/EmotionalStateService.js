// EmotionalState Service
const EmotionalState = require('../models/EmotionalState');
const { ObjectId } = require('mongoose').Types;

class EmotionalStateService {
    /**
     * Get emotional state snapshot for a user - returns DTO matching EmotionalStateDTO format
     * @param {string} userId - User ID
     * @returns {Promise<Object>} EmotionalState DTO object
     */
    async getEmotionalStateSnapshot(userId) {
        let emotionalStateDoc = await EmotionalState.findOne({ userId }).sort({ timestamp: -1 });

        // If no emotional state record exists, return empty DTO structure
        if (!emotionalStateDoc) {
            return this.getEmptyEmotionalStateDTO();
        }

        // Convert to plain object and return DTO
        return emotionalStateDoc.toDTO();
    }

    /**
     * Get empty emotional state DTO structure
     * @returns {Object} Empty emotional state DTO
     */
    getEmptyEmotionalStateDTO() {
        return {
            timestamp: new Date().toISOString(),
            mood: { value: 0, label: 'neutral' },
            stress: 0,
            energy: 0,
            focus: 0,
            notes: '',
            tags: []
        };
    }

    /**
     * Get emotional state document for a user (most recent)
     * @param {string} userId - User ID
     * @returns {Promise<Object>} Emotional state document (or null)
     */
    async getEmotionalStateDoc(userId) {
        return await EmotionalState.findOne({ userId }).sort({ timestamp: -1 });
    }

    /**
     * Create a new emotional state entry for a user
     * @param {string} userId - User ID
     * @param {Object} emotionalStateData - { mood: { value, label }, stress, energy, focus, notes, tags }
     * @returns {Promise<Object>} Created emotional state document
     */
    async createEmotionalState(userId, emotionalStateData) {
        const { mood, stress, energy, focus, notes, tags } = emotionalStateData;

        const emotionalState = new EmotionalState({
            userId,
            mood: {
                value: mood.value,
                label: mood.label
            },
            stress,
            energy,
            focus,
            notes: notes || '',
            tags: tags || []
        });

        return await emotionalState.save();
    }

    /**
     * Get emotional state history for a user
     * @param {string} userId - User ID
     * @param {Object} options - { limit, startDate, endDate, endDate } - Optional filters
     * @returns {Promise<Array>} Array of emotional state documents
     */
    async getEmotionalStateHistory(userId, options = {}) {
        const query = { userId };

        // Add date filtering if provided
        if (options.startDate || options.endDate) {
            query.timestamp = {};
            if (options.startDate) query.timestamp.$gte = new Date(options.startDate);
            if (options.endDate) query.timestamp.$lte = new Date(options.endDate);
        }

        const sort = { timestamp: -1 };
        const limit = options.limit || 0; // 0 means no limit

        let queryBuilder = EmotionalState.find(query).sort(sort);
        if (limit > 0) {
            queryBuilder = queryBuilder.limit(limit);
        }

        return await queryBuilder.exec();
    }

    /**
     * Delete all emotional state records for a user (useful for testing or account deletion)
     * @param {string} userId - User ID
     * @returns {Promise<Object>} Delete result
     */
    async deleteAllEmotionalStateForUser(userId) {
        return await EmotionalState.deleteMany({ userId });
    }
}

module.exports = new EmotionalStateService();