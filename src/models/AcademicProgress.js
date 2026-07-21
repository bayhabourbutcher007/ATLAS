// Academic Progress model
const mongoose = require('mongoose');

const academicProgressSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },

    // Academic term/semester information
    academicTerm: {
        term: {
            type: String,
            enum: ['Fall', 'Spring', 'Summer', 'Winter'],
            required: true
        },
        year: {
            type: Number,
            required: true,
            min: 2000,
            max: 2100
        }
    },

    // Courses information
    courses: [{
        courseId: {
            type: String,
            required: true,
            trim: true
        },
        courseName: {
            type: String,
            required: true,
            trim: true
        },
        courseCode: {
            type: String,
            trim: true,
            uppercase: true
        },
        credits: {
            type: Number,
            min: 0,
            max: 12
        },
        instructor: {
            type: String,
            trim: true
        },
        term: {
            type: String,
            enum: ['Fall', 'Spring', 'Summer', 'Winter']
        },
        year: {
            type: Number,
            min: 2000,
            max: 2100
        },
        grade: {
            type: String,
            enum: ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F', 'W', 'I', 'P', 'NP'],
            default: null
        },
        gradePoints: {
            type: Number,
            min: 0,
            max: 4.0
        },
        status: {
            type: String,
            enum: ['Enrolled', 'Completed', 'Dropped', 'Incomplete', 'Planned'],
            default: 'Enrolled'
        },
        // Course materials and resources
        materials: [{
            name: { type: String, trim: true },
            type: {
                type: String,
                enum: ['Syllabus', 'Lecture Notes', 'Assignment', 'Reading', 'Video', 'Other']
            },
            url: { type: String },
            uploadedAt: { type: Date, default: Date.now }
        }],
        // Meeting schedule
        schedule: [{
            dayOfWeek: {
                type: String,
                enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
            },
            startTime: { type: String }, // HH:MM format
            endTime: { type: String },   // HH:MM format
            location: { type: String, trim: true }
        }],
        // Custom fields for flexibility
        customFields: [{
            name: { type: String, trim: true },
            value: { type: String },
            type: {
                type: String,
                enum: ['text', 'number', 'date', 'boolean']
            }
        }]
    }],

    // Academic performance metrics
    performance: {
        gpa: {
            semester: { type: Number, min: 0, max: 4.0, default: 0 },
            cumulative: { type: Number, min: 0, max: 4.0, default: 0 }
        },
        totalCredits: {
            completed: { type: Number, default: 0 },
            inProgress: { type: Number, default: 0 },
            planned: { type: Number, default: 0 }
        },
        courseCount: {
            completed: { type: Number, default: 0 },
            inProgress: { type: Number, default: 0 },
            planned: { type: Number, default: 0 }
        }
    },

    // Study tracking
    studyHours: {
        total: { type: Number, default: 0 }, // Total minutes studied
        weekly: { type: Number, default: 0 }, // Minutes studied this week
        monthly: { type: Number, default: 0 }, // Minutes studied this month
        byCourse: [{
            courseId: { type: String },
            minutes: { type: Number, default: 0 }
        }],
        lastUpdated: { type: Date, default: Date.now }
    },

    // Academic goals
    goals: [{
        title: { type: String, required: true, trim: true },
        description: { type: String },
        type: {
            type: String,
            enum: ['GPA', 'Credits', 'StudyHours', 'CourseCompletion', 'SkillDevelopment', 'Other']
        },
        targetValue: { type: Number },
        currentValue: { type: Number, default: 0 },
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
    }],

    // Academic achievements and awards
    achievements: [{
        title: { type: String, required: true, trim: true },
        description: { type: String },
        date: { type: Date },
        issuer: { type: String, trim: true },
        certificateUrl: { type: String },
        category: {
            type: String,
            enum: ['Academic', 'Leadership', 'Sports', 'Arts', 'CommunityService', 'Other']
        }
    }],

    // Timestamps
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Indexes for better query performance
academicProgressSchema.index({ userId: 1, 'academicTerm.year': -1, 'academicTerm.term': 1 });
academicProgressSchema.index({ 'courses.courseId': 1 });
academicProgressSchema.index({ 'goals.status': 1 });

// Middleware to update the updatedAt timestamp
academicProgressSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Method to calculate GPA for a specific set of courses
academicProgressSchema.methods.calculateGPA = function(courses = this.courses) {
    let totalGradePoints = 0;
    let totalCredits = 0;

    const gradePointsMap = {
        'A+': 4.0, 'A': 4.0, 'A-': 3.7,
        'B+': 3.3, 'B': 3.0, 'B-': 2.7,
        'C+': 2.3, 'C': 2.0, 'C-': 1.7,
        'D+': 1.3, 'D': 1.0, 'D-': 0.7,
        'F': 0.0
    };

    courses.forEach(course => {
        if (course.grade && course.credits) {
            const gradePoints = gradePointsMap[course.grade] || 0;
            totalGradePoints += gradePoints * course.credits;
            totalCredits += course.credits;
        }
    });

    return totalCredits > 0 ? totalGradePoints / totalCredits : 0;
};

// Method to get completed courses
academicProgressSchema.methods.getCompletedCourses = function() {
    return this.courses.filter(course => course.status === 'Completed');
};

// Method to get in-progress courses
academicProgressSchema.methods.getInProgressCourses = function() {
    return this.courses.filter(course => course.status === 'Enrolled' || course.status === 'Incomplete');
};

// Method to get planned courses
academicProgressSchema.methods.getPlannedCourses = function() {
    return this.courses.filter(course => course.status === 'Planned');
};

module.exports = mongoose.model('AcademicProgress', academicProgressSchema);