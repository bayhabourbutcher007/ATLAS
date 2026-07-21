// Skill Routes
const express = require('express');
const router = express.Router();
const skillController = require('../controllers/skillController');
const {
    skillSchema,
    practiceSchema,
    proficiencySchema,
    goalLevelSchema,
    evidenceSchema
} = require('../validation/skill.validation');
const validate = require('../middleware/validation');
const authMiddleware = require('../middleware/authMiddleware');

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Get skill snapshot for the authenticated user
router.get('/', skillController.getSkillSnapshot);

// Get skill list (optional)
router.get('/list', skillController.getSkillList);

// Create a new skill
router.post('/', validate(skillSchema), skillController.createSkill);

// Get a specific skill
router.get('/:skillId', skillController.getSkillById);

// Update a skill
router.put('/:skillId', skillController.updateSkill);

// Delete a skill
router.delete('/:skillId', skillController.removeSkill);

// Add evidence to a skill
router.post('/:skillId/evidence', validate(evidenceSchema), skillController.addEvidence);

// Remove evidence from a skill
router.delete('/:skillId/evidence/:evidenceId', skillController.removeEvidence);

// Log practice time for a skill
router.post('/:skillId/practice', validate(practiceSchema), skillController.logPractice);

// Set proficiency for a skill
router.post('/:skillId/proficiency', validate(proficiencySchema), skillController.setProficiency);

// Set goal level for a skill
router.post('/:skillId/goalLevel', skillController.setGoalLevel);

module.exports = router;