// Academic Progress Validation Middleware
const { body, validationResult } = require('express-validator');

// Validation rules for academic term
const validateAcademicTerm = [
    body('academicTerm.term')
        .isIn(['Fall', 'Spring', 'Summer', 'Winter'])
        .withMessage('Term must be Fall, Spring, Summer, or Winter'),

    body('academicTerm.year')
        .isInt({ min: 2000, max: 2100 })
        .withMessage('Year must be between 2000 and 2100')
];

// Validation rules for course operations
const validateCourse = [
    body('courseId')
        .trim()
        .isLength({ min: 1 })
        .withMessage('Course ID is required'),

    body('courseName')
        .trim()
        .isLength({ min: 1 })
        .withMessage('Course name is required'),

    body('courseCode')
        .optional()
        .trim()
        .isLength({ max: 20 })
        .withMessage('Course code cannot exceed 20 characters'),

    body('credits')
        .optional()
        .isInt({ min: 0, max: 12 })
        .withMessage('Credits must be between 0 and 12'),

    body('instructor')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Instructor name cannot exceed 100 characters'),

    body('term')
    .optional()
    .isIn(['Fall', 'Spring', 'Summer', 'Winter'])
    .withMessage('Term must be Fall, Spring, Summer, or Winter'),

    body('year')
    .optional()
    .isInt({ min: 2000, max: 2100 })
    .withMessage('Year must be between 2000 and 2100'),

    body('grade')
    .optional()
    .isIn(['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F', 'W', 'I', 'P', 'NP'])
    .withMessage('Invalid grade'),

    body('gradePoints')
    .optional()
    .isFloat({ min: 0, max: 4.0 })
    .withMessage('Grade points must be between 0 and 4.0'),

    body('status')
    .optional()
    .isIn(['Enrolled', 'Completed', 'Dropped', 'Incomplete', 'Planned'])
    .withMessage('Invalid course status'),

    body('materials')
    .optional()
    .isArray()
    .withMessage('Materials must be an array'),

    body('materials.*.name')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Material name cannot exceed 100 characters'),

    body('materials.*.type')
    .optional()
    .isIn(['Syllabus', 'Lecture Notes', 'Assignment', 'Reading', 'Video', 'Other'])
    .withMessage('Invalid material type'),

    body('materials.*.url')
    .optional()
    .trim()
    .isURL()
    .withMessage('Material URL must be a valid URL'),

    body('schedule')
    .optional()
    .isArray()
    .withMessage('Schedule must be an array'),

    body('schedule.*.dayOfWeek')
    .optional()
    .isIn(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'])
    .withMessage('Invalid day of week'),

    body('schedule.*.startTime')
    .optional()
    .matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Start time must be in HH:MM format'),

    body('schedule.*.endTime')
    .optional()
    .matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('End time must be in HH:MM format'),

    body('schedule.*.location')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Location cannot exceed 100 characters')
];

// Validation rules for study hours
const validateStudyHours = [
    body('courseId')
        .trim()
        .isLength({ min: 1 })
        .withMessage('Course ID is required'),

    body('minutes')
        .isInt({ min: 1 })
        .withMessage('Study minutes must be at least 1')
];

// Validation rules for academic goals
const validateGoal = [
    body('title')
        .trim()
        .isLength({ min: 1, max: 200 })
        .withMessage('Goal title must be between 1 and 200 characters'),

    body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Goal description cannot exceed 1000 characters'),

    body('type')
    .isIn(['GPA', 'Credits', 'StudyHours', 'CourseCompletion', 'SkillDevelopment', 'Other'])
    .withMessage('Invalid goal type'),

    body('targetValue')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Target value must be a positive number'),

    body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),

    body('targetDate')
    .optional()
    .isISO8601()
    .withMessage('Target date must be a valid date'),

    body('status')
    .optional()
    .isIn(['NotStarted', 'InProgress', 'Completed', 'Paused', 'Cancelled'])
    .withMessage('Invalid goal status'),

    body('priority')
    .optional()
    .isIn(['Low', 'Medium', 'High'])
    .withMessage('Invalid priority level'),

    body('completed')
    .optional()
    .isBoolean()
    .withMessage('Completed must be a boolean value')
];

// Validation rules for academic achievements
const validateAchievement = [
    body('title')
        .trim()
        .isLength({ min: 1, max: 200 })
        .withMessage('Achievement title must be between 1 and 200 characters'),

    body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Achievement description cannot exceed 1000 characters'),

    body('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be a valid date'),

    body('issuer')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Issuer cannot exceed 100 characters'),

    body('certificateUrl')
    .optional()
    .trim()
    .isURL()
    .withMessage('Certificate URL must be a valid URL'),

    body('category')
    .isIn(['Academic', 'Leadership', 'Sports', 'Arts', 'CommunityService', 'Other'])
    .withMessage('Invalid achievement category')
];

// Middleware to handle validation errors
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array().map(err => ({
                field: err.param,
                message: err.msg
            }))
        });
    }
    next();
};

module.exports = {
    validateAcademicTerm,
    validateCourse,
    validateStudyHours,
    validateGoal,
    validateAchievement,
    validate
};