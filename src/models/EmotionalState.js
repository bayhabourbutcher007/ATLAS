// EmotionalState model
const mongoose = require('mongoose');

// Emotional state schema
const emotionalStateSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    timestamp: {
        type: Date,
        default: Date.now,
        index: true
    },
    mood: {
        value: {
            type: Number,
            min: -5,
            max: 5,
            required: true
        },
        label: {
            type: String,
            enum: ['very_sad', 'sad', 'neutral', 'happy', 'very_happy'],
            required: true
        }
    },
    stress: {
        type: Number,
        min: 0,
        max: 100,
        required: true
    },
    energy: {
        type: Number,
        min: 0,
        max: 100,
        required: true
    },
    focus: {
        type: Number,
        min: 0,
        max: 100,
        required: true
    },
    notes: {
        type: String,
        trim: true,
        default: ''
    },
    tags: [{
        type: String,
        trim: true
    }]
}, {
    timestamps: true // createdAt, updatedAt
});

// Indexes for querying
emotionalStateSchema.index({ userId: 1, timestamp: -1 });

// Method to convert to DTO (matching EmotionalStateDTO from CONTEXT_SCHEMA.md)
emotionalStateSchema.methods.toDTO = function() {
    const obj = this.toObject();

    const dto = {
        timestamp: obj.timestamp ? new Date(obj.timestamp).toISOString() : new Date().toISOString(),
        mood: {
            value: obj.mood.value,
            label: obj.mood.label
        },
        stress: obj.stress,
        energy: obj.energy,
        focus: obj.focus,
        notes: obj.notes || '',
        tags: obj.tags || []
    };

    return dto;
};

module.exports = mongoose.model('EmotionalState', emotionalStateSchema);