// Health model
const mongoose = require('mongoose');

// Workout schema
const workoutSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        trim: true
    },
    durationMinutes: {
        type: Number,
        required: true,
        min: 0
    },
    date: {
        type: Date,
        required: true
    },
    caloriesBurned: {
        type: Number,
        min: 0,
        default: null
    }
}, { _id: false });

// Vitals schema
const vitalsSchema = new mongoose.Schema({
    weight: {
        type: Number,
        min: 0,
        default: null
    },
    height: {
        type: Number,
        min: 0,
        default: null
    },
    bmi: {
        type: Number,
        min: 0,
        default: null
    },
    bloodPressure: {
        systolic: {
            type: Number,
            min: 0,
            default: null
        },
        diastolic: {
            type: Number,
            min: 0,
            default: null
        }
    },
    restingHeartRate: {
        type: Number,
        min: 0,
        default: null
    }
}, { _id: false });

// Activity schema
const activitySchema = new mongoose.Schema({
    steps: {
        type: Number,
        default: 0,
        min: 0
    },
    activeMinutes: {
        type: Number,
        default: 0,
        min: 0
    },
    workouts: [workoutSchema]
}, { _id: false });

// Sleep schema
const sleepSchema = new mongoose.Schema({
    hoursPerNight: {
        type: Number,
        default: 0,
        min: 0
    },
    quality: {
        type: String,
        enum: ['poor', 'fair', 'good'],
        default: null
    },
    consistency: {
        type: Number,
        min: 0,
        max: 1,
        default: 0
    }
}, { _id: false });

// Nutrition schema
const nutritionSchema = new mongoose.Schema({
    mealsPerDay: {
        type: Number,
        default: 0,
        min: 0
    },
    caloriesPerDay: {
        type: Number,
        default: 0,
        min: 0
    },
    waterIntakeLiters: {
        type: Number,
        min: 0,
        default: null
    }
}, { _id: false });

const healthSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    vitals: vitalsSchema,
    activity: activitySchema,
    sleep: sleepSchema,
    nutrition: nutritionSchema,
    goals: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Goal'
    }]
}, {
    timestamps: true
});

// Indexes
healthSchema.index({ userId: 1 });

// Method to calculate BMI if weight and height are present
healthSchema.methods.calculateBMI = function() {
    if (this.vitals.weight && this.vitals.height) {
        const heightInMeters = this.vitals.height / 100; // convert cm to m
        return this.vitals.weight / (heightInMeters * heightInMeters);
    }
    return null;
};

module.exports = mongoose.model('Health', healthSchema);