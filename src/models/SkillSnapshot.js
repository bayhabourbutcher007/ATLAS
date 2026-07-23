// src/models/SkillSnapshot.js
const mongoose = require('mongoose');

const skillSnapshotSchema = new mongoose.Schema({
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
    skills: [{
        proficiency: { type: Number, min: 0, max: 100, default: 0 },
        goalLevel: { type: Number, min: 0, max: 100, default: null }
    }],
    learningHours: {
        total: { type: Number, min: 0, default: 0 },
        weekly: { type: Number, min: 0, default: 0 }
    }
}, {
    timestamps: true
});

// Compound unique index
skillSnapshotSchema.index({ userId: 1, timestamp: 1 }, { unique: true });

module.exports = mongoose.model('SkillSnapshot', skillSnapshotSchema);