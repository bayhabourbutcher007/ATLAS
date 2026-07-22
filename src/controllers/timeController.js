// Time Controller
const TimeService = require('../services/TimeService');

class TimeController {
    /**
     * Get time snapshot for the authenticated user
     */
    async getTimeSnapshot(req, res) {
        try {
            const userId = req.user.userId;
            const timeSnapshot = await TimeService.getTimeSnapshot(userId);

            res.status(200).json({
                success: true,
                message: 'Time snapshot retrieved successfully',
                data: timeSnapshot
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve time snapshot',
                error: error.message
            });
        }
    }

    /**
     * Update time for the authenticated user
     */
    async updateTime(req, res) {
        try {
            const userId = req.user.userId;
            const updates = req.body;

            const time = await TimeService.updateTime(userId, updates);

            res.status(200).json({
                success: true,
                message: 'Time updated successfully',
                data: time
            });
        } catch (error) {
            if (error.message === 'Time document not found') {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }
            res.status(500).json({
                success: false,
                message: 'Failed to update time',
                error: error.message
            });
        }
    }

    /**
     * Add a calendar event for the authenticated user
     */
    async addCalendarEvent(req, res) {
        try {
            const userId = req.user.userId;
            const eventData = req.body;

            const time = await TimeService.addCalendarEvent(userId, eventData);

            res.status(201).json({
                success: true,
                message: 'Calendar event added successfully',
                data: time
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to add calendar event',
                error: error.message
            });
        }
    }

    /**
     * Update a calendar event for the authenticated user
     */
    async updateCalendarEvent(req, res) {
        try {
            const userId = req.user.userId;
            const { eventId } = req.params;
            const eventData = req.body;

            const time = await TimeService.updateCalendarEvent(userId, eventId, eventData);

            res.status(200).json({
                success: true,
                message: 'Calendar event updated successfully',
                data: time
            });
        } catch (error) {
            if (error.message === 'Time document not found' ||
                error.message === 'Event not found') {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }
            res.status(500).json({
                success: false,
                message: 'Failed to update calendar event',
                error: error.message
            });
        }
    }

    /**
     * Remove a calendar event from the authenticated user
     */
    async removeCalendarEvent(req, res) {
        try {
            const userId = req.user.userId;
            const { eventId } = req.params;

            const time = await TimeService.removeCalendarEvent(userId, eventId);

            res.status(200).json({
                success: true,
                message: 'Calendar event removed successfully',
                data: time
            });
        } catch (error) {
            if (error.message === 'Time document not found') {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }
            res.status(500).json({
                success: false,
                message: 'Failed to remove calendar event',
                error: error.message
            });
        }
    }

    /**
     * Add an availability slot for the authenticated user
     */
    async addAvailabilitySlot(req, res) {
        try {
            const userId = req.user.userId;
            const slotData = req.body;

            const time = await TimeService.addAvailabilitySlot(userId, slotData);

            res.status(201).json({
                success: true,
                message: 'Availability slot added successfully',
                data: time
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to add availability slot',
                error: error.message
            });
        }
    }

    /**
     * Update an availability slot for the authenticated user
     */
    async updateAvailabilitySlot(req, res) {
        try {
            const userId = req.user.userId;
            const { slotId } = req.params;
            const slotData = req.body;

            const time = await TimeService.updateAvailabilitySlot(userId, slotId, slotData);

            res.status(200).json({
                success: true,
                message: 'Availability slot updated successfully',
                data: time
            });
        } catch (error) {
            if (error.message === 'Time document not found' ||
                error.message === 'Slot not found') {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }
            res.status(500).json({
                success: false,
                message: 'Failed to update availability slot',
                error: error.message
            });
        }
    }

    /**
     * Remove an availability slot from the authenticated user
     */
    async removeAvailabilitySlot(req, res) {
        try {
            const userId = req.user.userId;
            const { slotId } = req.params;

            const time = await TimeService.removeAvailabilitySlot(userId, slotId);

            res.status(200).json({
                success: true,
                message: 'Availability slot removed successfully',
                data: time
            });
        } catch (error) {
            if (error.message === 'Time document not found') {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }
            res.status(500).json({
                success: false,
                message: 'Failed to remove availability slot',
                error: error.message
            });
        }
    }
}

module.exports = new TimeController();