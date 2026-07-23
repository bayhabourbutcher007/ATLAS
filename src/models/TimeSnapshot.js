// src/models/TimeSnapshot.js
const mongoose = require('mongoose');

const timeSnapshotSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    timestamp: {
        type: Date,
        required: true,
        index: true
    },
    calendar: {
        count: { type: Number, min: 0, default: 0 },
        totalDurationMinutes: { type: Number, min: 0, default: 0 }
    },
    timeZones: {
        home: { type: String, default: null },
        work: { type: String, default: null }
    },
    availability: {
        slotsLength: { type: Number, min: 0, default: 0 }
    }
}, {
    timestamps: true
});

// Compound unique index
timeSnapshotSchema.index({ userId: 1, timestamp: 1 }, { unique: true });

module.exports = mongoose.model('TimeSnapshot', timeSnapshotSchema);