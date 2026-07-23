// src/models/HealthSnapshot.js
const mongoose = require('mongoose');

const healthSnapshotSchema = new mongoose.Schema({
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
    vitals: {
        weight: { type: Number, min: 0, default: null }, // kg
        height: { type: Number, min: 0, default: null }, // cm
        bloodPressure: {
            systolic: { type: Number, min: 0, max: 300, default: null },
            diastolic: { type: Number, min: 0, max: 200, default: null }
        },
        restingHeartRate: { type: Number, min: 0, max: 220, default: null }
    },
    sleep: {
        hoursPerNight: { type: Number, min: 0, max: 24, default: 0 },
        quality: { type: String, enum: ['poor', 'fair', 'good'], default: null },
        consistency: { type: Number, min: 0, max: 1, default: 0 }
    },
    nutrition: {
        mealsPerDay: { type: Number, min: 0, default: 0 },
        caloriesPerDay: { type: Number, min: 0, default: 0 },
        waterIntakeLiters: { type: Number, min: 0, default: null }
    }
}, {
    timestamps: true
});

// Compound unique index
healthSnapshotSchema.index({ userId: 1, timestamp: 1 }, { unique: true });

module.exports = mongoose.model('HealthSnapshot', healthSnapshotSchema);