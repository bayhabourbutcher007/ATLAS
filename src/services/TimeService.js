// Time Service
const Time = require('../models/Time');
const { ObjectId } = require('mongoose').Types;
const TimeSnapshot = require('../models/TimeSnapshot');

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
     * Update time document for a user
     * @param {string} userId - User ID
     * @param {Object} updates - Data to update (e.g., { timeZones: { home: 'America/New_York' } })
     * @returns {Promise<Object>} Updated time document
     */
    async updateTime(userId, updates) {
        let timeDoc = await Time.findOneAndUpdate(
            { userId },
            { $set: { ...updates, updatedAt: new Date() } },
            { new: true, runValidators: true, upsert: true }
        );

        if (!timeDoc) {
            throw new Error('Time document not found');
        }

        return timeDoc;
    }

    /**
     * Add a calendar event for a user
     * =   {string} userId - User ID
     * @param {Object} eventData - { title, description, start, end, allDay, location, attendees, recurrence, category }
     * @returns {Promise<Object>} Updated time document
     */
    async addCalendarEvent(userId, eventData) {
        const { title, description, start, end, allDay, location, attendees, recurrence, category } = eventData;

        let timeDoc = await Time.findOneAndUpdate(
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
     * =   {string} userId - User ID
     * @param {Object} eventData - Updated event data
     * @returns {Promise<Object>} Updated time document
     */
    async updateCalendarEvent(userId, eventId, eventData) {
        let timeDoc = await Time.findOne({ userId });
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
     * =   {string} userId - User ID
     * @param {string} eventId - Event ID to remove
     * @returns {Promise<Object>} Updated time document
     */
    async removeCalendarEvent(userId, eventId) {
        let timeDoc = await Time.findOneAndUpdate(
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
     * =   {string} userId - User ID
     * @param {Object} slotData - { start, end, type }
     * @returns {Promise<Object>} Updated time document
     */
    async addAvailabilitySlot(userId, slotData) {
        const { start, end, type } = slotData;

        let timeDoc = await Time.findOneAndUpdate(
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
     * @param {string}userId - User ID
     * @param {string} slotId - Slot ID to update
     * @param {Object} slotData - Updated slot data { start, end, type }
     * @returns {Promise<Object>} Updated time document
     */
    async updateAvailabilitySlot(userId, slotId, slotData) {
        let timeDoc = await Time.findOne({ userId });
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
     * =   {string} userId - User ID
     * @param {string} slotId - Slot ID to remove
     * @returns {Promise<Object>} Updated time document
     */
    async removeAvailabilitySlot(userId, slotId) {
        let timeDoc = await Time.findOneAndUpdate(
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

    /**
     * Get time history for a user - returns array of time DTOs
     * @param {string} userId - User ID
     * @param {Object} options - { startDate, endDate, interval, aggregation }
//Note: In Phase 3A, we only support raw interval (no aggregation)
     * @returns {Promise<Array>} Array of time DTO objects
     */
    async getTimeHistory(userId, options = {}) {
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
        const snapshots = await TimeSnapshot.find(query).sort({ timestamp: 1 });

        // Build DTO for each snapshot (mirroring Time.toDTO logic)
        return snapshots.map(snap => {
            const obj = snap.toObject();
            return {
                calendar: (obj.calendar || []).map(event => ({
                    id: event._id.toString(),
                    title: event.title,
                    description: event.description,
                    start: event.start ? new Date(event.start).toISOString() : null,
                    end: event.end ? new Date(event.end).toISOString() : null,
                    allDay: event.allDay,
                    location: event.location,
                    attendees: event.attendees,
                    recurrence: event.recurrence ? {
                        frequency: event.recurrence.frequency,
                        interval: event.recurrence.interval,
                        until: event.recurrence.until ? new Date(event.recurrence.until).toISOString() : null,
                        byday: event.recurrence.byday || []
                    } : null,
                    category: event.category
                })),
                timeZones: {
                    home: obj.timeZones?.home ?? null,
                    work: obj.timeZones?.work ?? null
                },
                availability: {
                    slots: (obj.availability?.slots || []).map(slot => ({
                        id: slot._id.toString(),
                        start: slot.start ? new Date(slot.start).toISOString() : null,
                        end: slot.end ? new Date(slot.end).toISOString() : null,
                        type: slot.type
                    }))
                }
            };
        });
    }
}

module.exports = new TimeService();