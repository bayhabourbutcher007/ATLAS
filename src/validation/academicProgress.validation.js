// Academic Progress Validation Schemas using Joi
const Joi = require('joi');

// Academic term validation schema
const academicTermSchema = Joi.object({
    term: Joi.string().valid('Fall', 'Spring', 'Summer', 'Winter').required(),
    year: Joi.integer().min(2000).max(2100).required()
});

// Course validation schema
const courseSchema = Joi.object({
    courseId: Joi.string().trim().min(1).required(),
    courseName: Joi.string().trim().min(1).required(),
    courseCode: Joi.string().trim().uppercase().max(20).allow('', null),
    credits: Joi.integer().min(0).max(12).allow(null, ''),
    instructor: Joi.string().trim().max(100).allow('', null),
    term: Joi.string().valid('Fall', 'Spring', 'Summer', 'Winter').allow(null, ''),
    year: Joi.integer().min(2000).max(2100).allow(null, ''),
    grade: Joi.string().valid('A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F', 'W', 'I', 'P', 'NP').allow(null),
    gradePoints: Joi.number().min(0).max(4.0).allow(null),
    status: Joi.string().valid('Enrolled', 'Completed', 'Dropped', 'Incomplete', 'Planned').default('Enrolled'),
    materials: Joi.array().items(Joi.object({
        name: Joi.string().trim().max(100).allow('', null),
        type: Joi.string().valid('Syllabus', 'Lecture Notes', 'Assignment', 'Reading', 'Video', 'Other').allow(null),
        url: Joi.string().uri().allow('', null)
    })).default([]),
    schedule: Joi.array().items(Joi.object({
        dayOfWeek: Joi.string().valid('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday').allow(null),
        startTime: Joi.string().pattern(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/).allow(null),
        endTime: Joi.string().pattern(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/).allow(null),
        location: Joi.string().trim().max(100).allow('', null)
    })).default([]),
    customFields: Joi.array().items(Joi.object({
        name: Joi.string().trim().required(),
        value: Joi.any().required(),
        type: Joi.string().valid('text', 'number', 'date', 'boolean').required()
    })).default([])
});

// Study hours validation schema
const studyHoursSchema = Joi.object({
    courseId: Joi.string().trim().min(1).required(),
    minutes: Joi.integer().min(1).required()
});

// Goal validation schema
const goalSchema = Joi.object({
    title: Joi.string().trim().min(1).max(200).required(),
    description: Joi.string().trim().max(1000).allow('', null),
    type: Joi.string().valid('GPA', 'Credits', 'StudyHours', 'CourseCompletion', 'SkillDevelopment', 'Other').required(),
    targetValue: Joi.number().min(0).allow(null),
    startDate: Joi.date().iso().allow(null),
    targetDate: Joi.date().iso().allow(null),
    status: Joi.string().valid('NotStarted', 'InProgress', 'Completed', 'Paused', 'Cancelled').default('NotStarted'),
    priority: Joi.string().valid('Low', 'Medium', 'High').default('Medium'),
    completed: Joi.boolean().default(false)
});

// Achievement validation schema
const achievementSchema = Joi.object({
    title: Joi.string().trim().min(1).max(200).required(),
    description: Joi.string().trim().max(1000).allow('', null),
    date: Joi.date().iso().allow(null),
    issuer: Joi.string().trim().max(100).allow('', null),
    certificateUrl: Joi.string().uri().allow('', null),
    category: Joi.string().valid('Academic', 'Leadership', 'Sports', 'Arts', 'CommunityService', 'Other').required()
});

// Academic progress update schema (partial update)
const academicProgressUpdateSchema = Joi.object({
    academicTerm: academicTermSchema,
    performance: Joi.object({
        gpa: Joi.object({
            semester: Joi.number().min(0).max(4.0),
            cumulative: Joi.number().min(0).max(4.0)
        }),
        totalCredits: Joi.object({
            completed: Joi.number().min(0),
            inProgress: Joi.number().min(0),
            planned: Joi.number().min(0)
        }),
        courseCount: Joi.object({
            completed: Joi.number().min(0),
            inProgress: Joi.number().min(0),
            planned: Joi.number().min(0)
        })
    }).allow(null),
    studyHours: Joi.object({
        total: Joi.number().min(0),
        weekly: Joi.number().min(0),
        monthly: Joi.number().min(0),
        byCourse: Joi.array().items(Joi.object({
            courseId: Joi.string(),
            minutes: Joi.number().min(0)
        })).default([]),
        lastUpdated: Joi.date()
    }).allow(null),
    goals: Joi.array().items(goalSchema).default([]),
    achievements: Joi.array().items(achievementSchema).default([])
});

module.exports = {
    academicTermSchema,
    courseSchema,
    studyHoursSchema,
    goalSchema,
    achievementSchema,
    academicProgressUpdateSchema
};