// EmotionalState Controller
const EmotionalStateService = require('../services/EmotionalStateService');

class EmotionalStateController {
    /**
     * Get emotional state snapshot for the authenticated user
     */
    async getEmotionalStateSnapshot(req, res) {
        try {
            const userId = req.user.userId;
            const emotionalStateSnapshot = await EmotionalStateService.getEmotionalStateSnapshot(userId);

            res.status(200).json({
                success: true,
                message: 'Emotional state snapshot retrieved successfully',
                data: emotionalStateSnapshot
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve emotional state snapshot',
                error: error.message
            });
        }
    }

    /**
     * Create a new emotional state entry for the authenticated user
     */
    async createEmotionalState(req, res) {
        try {
            const userId = req.user.userId;
            const emotionalStateData = req.body;

            const emotionalState = await EmotionalStateService.createEmotionalState(userId, emotionalStateData);

            res.status(201).json({
                success: true,
                message: 'Emotional state created successfully',
                data: emotionalState
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to create emotional state',
                error: error.message
            });
        }
    }

    /**
     * Get emotional state history for the authenticated user
     */
    async getEmotionalStateHistory(req, res) {
        try {
            const userId = req.user.userId;
            const { limit, startDate, endDate } = req.query;

            const options = {};
            if (limit) options.limit = parseInt(limit);
            if (startDate) options.startDate = startDate;
            if (endDate) options.endDate = endDate;

            const emotionalStateHistory = await EmotionalStateService.getEmotionalStateHistory(userId, options);

            res.status(200).json({
                success: true,
                message: 'Emotional state history retrieved successfully',
                data: emotionalStateHistory
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve emotional state history',
                error: error.message
            });
        }
    }
}

module.exports = new EmotionalStateController();