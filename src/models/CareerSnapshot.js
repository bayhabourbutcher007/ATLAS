// src/models/CareerSnapshot.js
const mongoose = require('mongoose');

const careerSnapshotSchema = new mongoose.Schema({
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
    currentPosition: {
        title: { type: String, trim: true, default: '' },
        company: { type: String, trim: true, default: '' },
        startDate: { type: Date, default: null }
    },
    experience: { type: Number, min: 0, default: 0 }, // count of experience entries
    education: { type: Number, min: 0, default: 0 }, // count of education entries
    certifications: { type: Number, min: 0, default: 0 }, // count of certification entries
    goals: { type: Number, min: 0, default: 0 } // count of goal entries
}, {
    timestamps: true
});

// Compound unique index
careerSnapshotSchema.index({ userId: 1, timestamp: 1 }, { unique: true });

module.exports = mongoose.model('CareerSnapshot', careerSnapshotSchema);