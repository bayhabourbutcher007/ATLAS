// Skill model
const mongoose = require('mongoose');

const evidenceSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['course', 'project', 'certification', 'self-assessment'],
        required: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    date: {
        type: Date,
        required: true
    },
    url: {
        type: String,
        trim: true,
        // Validate as URI? We'll rely on Joi validation; store as string.
        default: ''
    }
}, { _id: false }); // we don't need separate _id for evidence; we'll use _id automatically

const skillSchema = new mongoose.Schema({
    // _id is added automatically by mongoose
    name: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        trim: true,
        default: ''
    },
    proficiency: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    evidence: [evidenceSchema],
    lastPracticed: {
        type: Date,
        default: null
    },
    goalLevel: {
        type: Number,
        min: 0,
        max: 100,
        default: null
    }
}, { _id: true, id: false }); // we'll keep _id and also have a virtual id? We'll map _id to string in DTO.

const learningHoursSchema = new mongoose.Schema({
    total: {
        type: Number,
        default: 0,
        min: 0
    },
    weekly: {
        type: Number,
        default: 0,
        min: 0
    },
    bySkill: [{
        skillId: {
            type: String,
            required: true
        },
        minutes: {
            type: Number,
            required: true,
            min: 0
        }
    }],
    lastUpdated: {
        type: Date,
        default: null
    }
}, { _id: false });

const skillSchemaMain = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    skills: [skillSchema],
    learningHours: {
        type: learningHoursSchema,
        default: () => ({
            total: 0,
            weekly: 0,
            bySkill: [],
            lastUpdated: null
        })
    }
}, {
    timestamps: true
});

// Indexes
skillSchemaMain.index({ userId: 1 });
skillSchemaMain.index({ 'skills._id': 1 });

// Method to get a skill by its _id (string)
skillSchemaMain.methods.getSkillById = function(skillId) {
    return this.sessions.id(skillId); // Actually we need to find in skills array
    // We'll implement in service instead.
};

module.exports = mongoose.model('Skill', skillSchemaMain);