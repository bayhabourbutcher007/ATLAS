// Academic Progress Routes
const express = require('express');
const router = express.Router();
const academicProgressController = require('../controllers/academicProgressController');
const {
    academicTermSchema,
    courseSchema,
    studyHoursSchema,
    goalSchema,
    achievementSchema,
    academicProgressUpdateSchema
} = require('../validation/academicProgress.validation');
const validate = require('../middleware/validation');
const authMiddleware = require('../middleware/authMiddleware');

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Get academic progress for the authenticated user
router.get('/', academicProgressController.getAcademicProgress);

// Update academic progress for the authenticated user
router.put('/', validate(academicProgressUpdateSchema), academicProgressController.updateAcademicProgress);

// Course management routes
router.post('/courses', validate(courseSchema), academicProgressController.addCourse);
router.put('/courses/:courseId', validate(courseSchema), academicProgressController.updateCourse);
router.delete('/courses/:courseId', academicProgressController.removeCourse);

// Study hours tracking
router.post('/study-hours', validate(studyHoursSchema), academicProgressController.addStudyHours);

// Goal management routes
router.post('/goals', validate(goalSchema), academicProgressController.addGoal);
router.put('/goals/:goalId', validate(goalSchema), academicProgressController.updateGoal);
router.delete('/goals/:goalId', academicProgressController.removeGoal);

// Achievement management routes
router.post('/achievements', validate(achievementSchema), academicProgressController.addAchievement);

// Performance summary
router.get('/summary', academicProgressController.getPerformanceSummary);

module.exports = router;