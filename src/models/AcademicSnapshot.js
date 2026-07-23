// src/models/AcademicSnapshot.js
const mongoose = require('mongoose');

const academicSnapshotSchema = new mongoose.Schema({
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
    gpa: {
        cumulative: { type: Number, min: 0, max: 4, default: null },
        semester: { type: Number, min: 0, max: 4, default: null }
    },
    credits: {
        completed: { type: Number, min: 0, default: 0 },
        inProgress: { type: Number, min: 0, default: 0 },
        planned: { type: Number, min: 0, default: 0 }
    },
    studyHours: {
        total: { type: Number, min: 0, default: 0 },
        weekly: { type: Number, min: 0, default: 0 },
        monthly: { type: Number, min: 0, default: 0 }
    }
}, {
    timestamps: true
});

// Compound unique index
academicSnapshotSchema.index({ userId: 1, timestamp: 1 }, { unique: true });

module.exports = mongoose.model('AcademicSnapshot', academicSnapshotSchema);