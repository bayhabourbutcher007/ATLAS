// Career model
const mongoose = require('mongoose');

// Experience schema
const experienceSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    company: {
        type: String,
        required: true,
        trim: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        default: null
    },
    description: {
        type: String,
        trim: true,
        default: ''
    },
    skillsUsed: [{
        type: String,
        trim: true
    }]
}, { _id: false });

// Education schema
const educationSchema = new mongoose.Schema({
    institution: {
        type: String,
        required: true,
        trim: true
    },
    degree: {
        type: String,
        required: true,
        trim: true
    },
    fieldOfStudy: {
        type: String,
        required: true,
        trim: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        default: null
    },
    gpa: {
        type: Number,
        min: 0,
        max: 4.0,
        default: null
    }
}, { _id: false });

// Certification schema
const certificationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    issuer: {
        type: String,
        required: true,
        trim: true
    },
    date: {
        type: Date,
        required: true
    },
    expiryDate: {
        type: Date,
        default: null
    },
    credentialId: {
        type: String,
        trim: true,
        default: ''
    }
}, { _id: false });

// Salary schema
const salarySchema = new mongoose.Schema({
    amount: {
        type: Number,
        min: 0,
        required: true
    },
    currency: {
        type: String,
        uppercase: true,
        default: 'USD'
    },
    frequency: {
        type: String,
        enum: ['monthly', 'annual'],
        required: true
    }
}, { _id: false });

// Current position schema
const currentPositionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    company: {
        type: String,
        required: true,
        trim: true
    },
    startDate: {
        type: Date,
        required: true
    },
    employmentType: {
        type: String,
        enum: ['full-time', 'part-time', 'contract', 'freelance', 'internship'],
        required: true
    },
    location: {
        type: String,
        trim: true,
        required: true
    },
    remote: {
        type: Boolean,
        default: false
    },
    industry: {
        type: String,
        trim: true,
        required: true
    },
    salary: salarySchema
}, { _id: false });

// Goals schema (following the same pattern as AcademicProgress and Finance)
const goalSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    type: {
        type: String,
        enum: ['Savings', 'Investment', 'DebtPayoff', 'Purchase', 'Other'],
        required: true
    },
    targetValue: { type: Number, required: true, min: 0 },
    currentValue: { type: Number, default: 0, min: 0 },
    startDate: { type: Date },
    targetDate: { type: Date },
    status: {
        type: String,
        enum: ['NotStarted', 'InProgress', 'Completed', 'Paused', 'Cancelled'],
        default: 'NotStarted'
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        default: 'Medium'
    },
    completed: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, { _id: false });

const careerSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    currentPosition: currentPositionSchema,
    experience: [experienceSchema],
    education: [educationSchema],
    certifications: [certificationSchema],
    goals: [goalSchema]
}, {
    timestamps: true
});

// Indexes
careerSchema.index({ userId: 1 });
careerSchema.index({ 'experience._id': 1 });
careerSchema.index({ 'education._id': 1 });
careerSchema.index({ 'certifications._id': 1 });
careerSchema.index({ 'goals._id': 1 });

// Method to calculate years of experience
careerSchema.methods.getTotalExperience = function() {
    let totalMonths = 0;

    this.experience.forEach(exp => {
        const endDate = exp.endDate || new Date(); // Use current date if still employed
        const startDate = exp.startDate;
        const diffTime = Math.abs(endDate - startDate);
        const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30.44)); // Approximate months per day
        totalMonths += diffMonths;
    });

    return Math.floor(totalMonths / 12); // Return years
};

module.exports = mongoose.model('Career', careerSchema);