// Time Service
const Time = require('../models/Time');
const { ObjectId } = require('mongoose').Types;

class TimeService {
    /**
     * Get time snapshot for a user - returns DTO matching TimeDTO format
     * @param {string} userId - User ID
     * @returns {Promise<Object>} Time DTO object
     */
    async getTimeSnapshot(userId) {
        let timeDoc = await Time.findOne({ userId });

        // If no time record exists, return empty DTO structure
        if (!timeDoc) {
            return this.getEmptyTimeDTO();
        }

        // Convert to plain object and return DTO
        return timeDoc.toDTO();
    }

    /**
     * Get empty time DTO structure
     * @returns {Object} Empty time DTO
     */
    getEmptyTimeDTO() {
        return {
            calendar: [],
            timeZones: { home: null, work: null },
            availability: { slots: [] }
        };
    }

    /**
     * Get time document for a user
     * @param {string} userId - User ID
     * @returns {Promise<Object>} Time document (or null)
     */
    async getTimeDoc(userId) {
        return await Time.findOne({ userId });
    }

    /**
     * Update time zones for a user
     * @param {string} userId - User ID
     * @param {Object} timeZonesData - { home: String, work: String } (partial updates allowed)
     * @returns {Promise<Object>} Updated time document
     */
    async updateTimeZones(userId, timeZonesData) {
        const timeDoc = await Time.findOneAndUpdate(
            { userId },
            { $set: { ...timeZonesData, updatedAt: new Date() } },
            { new: true, runValidators: true, upsert: true }
        );

        if (!timeDoc) {
            throw new Error('Time document not found');
        }

        return timeDoc;
    }

    /**
     * Add a calendar event for a user
     * @param {string} userId - User ID
     * @param {Object} eventData - { title, description, start, end, allDay, location, attendees, recurrence, category }
     * @returns {Promise<Object>} Updated time document
     */
    async addCalendarEvent(userId, eventData) {
        const { title, description, start, end, allDay, location, attendees, recurrence, category } = eventData;

        const timeDoc = await Time.findOneAndUpdate(
            { userId },
            {
                $push: {
                    calendar: {
                        title,
                        description: description ?? '',
                        start: new Date(start),
                        end: new Date(end),
                        allDay: allDay ?? false,
                        location: location ?? '',
                        attendees: attendees || [],
                        recurrence: recurrence ?? null,
                        category
                    }
                },
                $set: { updatedAt: new Date() }
            },
            { new: true, runValidators: true, upsert: true }
        );

        if (!timeDoc) {
            throw new Error('Time document not found');
        }

        return timeDoc;
    }

    /**
     * Update a calendar event for a user
     * @param {string} userId - User ID
     * @param {string} eventId - Event ID to update
     * @param {Object} eventData - Updated event data
     * @returns {Promise<Object>} Updated time document
     */
    async updateCalendarEvent(userId, eventId, eventData) {
        const timeDoc = await Time.findOne({ userId });
        if (!timeDoc) {
            throw new Error('Time document not found');
        }

        // Find the event index
        const eventIndex = timeDoc.calendar.findIndex(event => event._id.toString() === eventId);
        if (eventIndex === -1) {
            throw new Error('Event not found');
        }

        // Build update object
        const updateObj = {};
        if (eventData.title !== undefined) updateObj[`calendar.${eventIndex}.title`] = eventData.title;
        if (eventData.description !== undefined) updateObj[`calendar.${eventIndex}.description`] = eventData.description;
        if (eventData.start !== undefined) updateObj[`calendar.${eventIndex}.start`] = new Date(eventData.start);
        if (eventData.end !== undefined) updateObj[`calendar.${eventIndex}.end`] = new Date(eventData.end);
        if (eventData.allDay !== undefined) updateObj[`calendar.${eventIndex}.allDay`] = eventData.allDay;
        if (eventData.location !== undefined) updateObj[`calendar.${eventIndex}.location`] = eventData.location;
        if (eventData.attendees !== undefined) updateObj[`calendar.${eventIndex}.attendees`] = eventData.attendees;
        if (eventData.recurrence !== undefined) updateObj[`calendar.${eventIndex}.recurrence`] = eventData.recurrence;
        if (eventData.category !== undefined) updateObj[`calendar.${eventIndex}.category`] = eventData.category;

        if (Object.keys(updateObj).length === 0) {
            // Nothing to update
            return timeDoc;
        }

        await Time.updateOne(
            { userId },
            { $set: { ...updateObj, updatedAt: new Date() } }
        );

        return this.getTimeDoc(userId);
    }

    /**
     * Remove a calendar event from a user
     * @param {string} userId - User ID
     * @param {string} eventId - Event ID to remove
     * @returns {Promise<Object>} Updated time document
     */
    async removeCalendarEvent(userId, eventId) {
        const timeDoc = await Time.findOneAndUpdate(
            { userId },
            {
                $pull: { calendar: { _id: new ObjectId(eventId) } },
                $set: { updatedAt: new Date() }
            },
            { new: true }
        );

        if (!timeDoc) {
            throw new Error('Time document not found');
        }

        return timeDoc;
    }

    /**
     * Add an availability slot for a user
     * @param {string} userId - User ID
     * @param {Object} slotData - { start, end, type }
     * @returns {Promise<Object>} Updated time document
     */
    async addAvailabilitySlot(userId, slotData) {
        const { start, end, type } = slotData;

        const timeDoc = await Time.findOneAndUpdate(
            { userId },
            {
                $push: { 'availability.slots': { start: new Date(start), end: new Date(end), type } },
                $set: { updatedAt: new Date() }
            },
            { new: true, runValidators: true, upsert: true }
        );

        if (!timeDoc) {
            throw new Error('Time document not found');
        }

        return timeDoc;
    }

    /**
     * Update an availability slot for a user
     * @param {string} userId - User ID
     * @param {string} slotId - Slot ID to update
     * @param {Object} slotData - Updated slot data { start, end, type }
     * @returns {Promise<Object>} Updated time document
     */
    async updateAvailabilitySlot(userId, slotId, slotData) {
        const timeDoc = await Time.findOne({ userId });
        if (!timeDoc) {
            throw new Error('Time document not found');
        }

        // Find the slot index
        const slotIndex = timeDoc.availability.slots.findIndex(slot => slot._id.toString() === slotId);
        if (slotIndex === -1) {
            throw new Error('Slot not found');
        }

        // Build update object
        const updateObj = {};
        if (slotData.start !== undefined) updateObj[`availability.slots.${slotIndex}.start`] = new Date(slotData.start);
        if (slotData.end !== undefined) updateObj[`availability.slots.${slotIndex}.end`] = new Date(slotData.end);
        if (slotData.type !== undefined) updateObj[`availability.slots.${slotIndex}.type`] = slotData.type;

        if (Object.keys(updateObj).length === 0) {
            // Nothing to update
            return timeDoc;
        }

        await Time.updateOne(
            { userId },
            { $set: { ...updateObj, updatedAt: new Date() } }
        );

        return this.getTimeDoc(userId);
    }

    /**
     * Remove an availability slot from a user
     * @param {string} userId - User ID
     * @param {string} slotId - Slot ID to remove
     * @returns {Promise<Object>} Updated time document
     */
    async removeAvailabilitySlot(userId, slotId) {
        const timeDoc = await Time.findOneAndUpdate(
            { userId },
            {
                $pull: { 'availability.slots': { _id: new ObjectId(slotId) } },
                $set: { updatedAt: new Date() }
            },
            { new: true }
        );

        if (!timeDoc) {
            throw new Error('Time document not found');
        }

        return timeDoc;
    }
}

module.exports = new TimeService();