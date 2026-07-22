// Career Routes
const express = require('express');
const router = express.Router();
const careerController = require('../controllers/careerController');
const {
    currentPositionSchema,
    experienceSchema,
    educationSchema,
    certificationSchema,
    goalSchema
} = require('../validation/career.validation');
const validate = require('../middleware/validation');
const authMiddleware = require('../middleware/authMiddleware');

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Get career snapshot for the authenticated user
router.get('/', careerController.getCareerSnapshot);

// Update career for the authenticated user
router.put('/', careerController.updateCareer);

// Experience management routes
router.post('/experience', validate(experienceSchema), careerController.addExperience);
router.put('/experience/:experienceId', validate(experienceSchema), careerController.updateExperience);
router.delete('/experience/:experienceId', careerController.removeExperience);

// Education management routes
router.post('/education', validate(educationSchema), careerController.addEducation);
router.put('/education/:educationId', validate(educationSchema), careerController.updateEducation);
router.delete('/education/:educationId', careerController.removeEducation);

// Certification management routes
router.post('/certification', validate(certificationSchema), careerController.addCertification);
router.put('/certification/:certificationId', validate(certificationSchema), careerController.updateCertification);
router.delete('/certification/:certificationId', careerController.removeCertification);

// Goal management routes
router.post('/goals', validate(goalSchema), careerController.addGoal);
router.put('/goals/:goalId', validate(goalSchema), careerController.updateGoal);
router.delete('/goals/:goalId', careerController.removeGoal);

module.exports = router;