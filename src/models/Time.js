// Time model
const mongoose = require('mongoose');

// Recurrence schema (embedded in calendar event)
const recurrenceSchema = new mongoose.Schema({
    frequency: {
        type: String,
        enum: ['daily', 'weekly', 'monthly', 'yearly'],
        required: true
    },
    interval: {
        type: Number,
        min: 1,
        default: 1
    },
    until: {
        type: Date,
        default: null
    },
    byday: [{
        type: String,
        enum: ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA']
    }]
}, { _id: false });

// Calendar event schema
const calendarEventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true,
        default: ''
    },
    start: {
        type: Date,
        required: true
    },
    end: {
        type: Date,
        required: true
    },
    allDay: {
        type: Boolean,
        default: false
    },
    location: {
        type: String,
        trim: true,
        default: ''
    },
    attendees: [{
        type: String,
        trim: true
    }],
    recurrence: recurrenceSchema,
    category: {
        type: String,
        enum: ['work', 'personal', 'health', 'finance', 'learning', 'social'],
        required: true
    }
}, { _id: true, timestamps: false }); // We'll use MongoDB's _id as the event ID

// Availability slot schema
const availabilitySlotSchema = new mongoose.Schema({
    start: {
        type: Date,
        required: true
    },
    end: {
        type: Date,
        required: true
    },
    type: {
        type: String,
        enum: ['focus', 'meeting', 'break', 'person'],
        required: true
    }
}, { _id: true }); // Now we give it an _id

// TimeZone schema (not an array, just an object)
const timeZoneSchema = new mongoose.Schema({
    home: {
        type: String,
        default: null // IANA timezone string
    },
    work: {
        type: String,
        default: null // IANA timezone string
    }
}, { _id: false });

const timeSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    calendar: [calendarEventSchema],
    timeZones: timeZoneSchema,
    availability: {
        slots: [availabilitySlotSchema]
    }
}, {
    timestamps: true
});

// Indexes
timeSchema.index({ userId: 1 });
timeSchema.index({ 'calendar.start': 1 });
timeSchema.index({ 'availability.slots.start': 1 });

// Method to convert to DTO (matching TimeDTO from CONTEXT_SCHEMA.md)
timeSchema.methods.toDTO = function() {
    const obj = this.toObject();

    const dto = {
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
                start: slot.start ? new Date(start).toISOString() : null,
                end: slot.end ? new Date(end).toISOString() : null,
                type: slot.type
            }))
        }
    };

    return dto;
};

module.exports = mongoose.model('Time', timeSchema);