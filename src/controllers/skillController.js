// Skill Controller
const SkillService = require('../services/SkillService');
const {
    skillSchema,
    practiceSchema,
    proficiencySchema,
    goalLevelSchema,
    idSchema
} = require('../validation/skill.validation');
const validate = require('../middleware/validation');

class SkillController {
    /**
     * Get skill snapshot for the authenticated user
     */
    async getSkillSnapshot(req, res) {
        try {
            const userId = req.user.userId;
            const skillSnapshot = await SkillService.getSkillSnapshot(userId);

            res.status(200).json({
                success: true,
                message: 'Skill snapshot retrieved successfully',
                data: skillSnapshot
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve skill snapshot',
                error: error.message
            });
        }
    }

    /**
     * Get a list of skills (id, name, category, proficiency) for the authenticated user
     */
    async getSkillList(req, res) {
        try {
            const userId = req.user.userId;
            const snapshot = await SkillService.getSkillSnapshot(userId);
            const skillList = snapshot.skills.map(s => ({
                id: s.id,
                name: s.name,
                category: s.category,
                proficiency: s.proficiency
            }));

            res.status(200).json({
                success: true,
                message: 'Skill list retrieved successfully',
                data: skillList
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve skill list',
                error: error.message
            });
        }
    }

    /**
     * Create a new skill
     */
    async createSkill(req, res) {
        try {
            const userId = req.user.userId;
            // Validate request body
            await validate(req.body, skillSchema);

            const skillData = req.body;
            await SkillService.addSkill(userId, skillData);

            // Return the newly added skill (we could fetch again)
            const snapshot = await SkillService.getSkillSnapshot(userId);
            const newSkill = snapshot.skills.slice(-1)[0]; // last added

            res.status(201).json({
                success: true,
                message: 'Skill created successfully',
                data: newSkill
            });
        } catch (error) {
            if (error.name === 'ValidationError') {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    error: error.details ? error.details[0].message : error.message
                });
            }
            res.status(500).json({
                success: false,
                message: 'Failed to create skill',
                error: error.message
            });
        }
    }

    /**
     * Get a specific skill by ID
     */
    async getSkillById(req, res) {
        try {
            const userId = req.user.userId;
            const { skillId } = req.params;

            // Validate skillId
            await validate({ skillId }, { skillId: idSchema });

            const skill = await SkillService.getSkillById(userId, skillId);
            if (!skill) {
                return res.status(404).json({
                    success: false,
                    message: 'Skill not found',
                    error: 'SkillNotFound'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Skill retrieved successfully',
                data: skill
            });
        } catch (error) {
            if (error.name === 'ValidationError') {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    error: error.details ? error.details[0].message : error.message
                });
            }
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve skill',
                error: error.message
            });
        }
    }

    /**
     * Update a skill
     */
    async updateSkill(req, res) {
        try {
            const userId = req.user.userId;
            const { skillId } = req.params;

            // Validate skillId
            await validate({ skillId }, { skillId: idSchema });
            // Validate request body (allow partial updates)
            const updateSchema = Joi.object({
                name: Joi.string().trim().min(1),
                category: Joi.string().trim().allow('', null),
                proficiency: Joi.number().min(0).max(100),
                goalLevel: Joi.number().min(0).max(100).allow(null, '')
            });
            await validate(req.body, updateSchema);

            await SkillService.updateSkill(userId, skillId, req.body);

            const updatedSkill = await SkillService.getSkillById(userId, skillId);

            res.status(200).json({
                success: true,
                message: 'Skill updated successfully',
                data: updatedSkill
            });
        } catch (error) {
            if (error.name === 'ValidationError') {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    error: error.details ? error.details[0].message : error.message
                });
            }
            if (error.message === 'Skill not found') {
                return res.status(404).json({
                    success: false,
                    message: 'Skill not found',
                    error: 'SkillNotFound'
                });
            }
            res.status(500).json({
                success: false,
                message: 'Failed to update skill',
                error: error.message
            });
        }
    }

    /**
     * Remove a skill
     */
    async removeSkill(req, res) {
        try {
            const userId = req.user.userId;
            const { skillId } = req.params;

            // Validate skillId
            await validate({ skillId }, { skillId: idSchema });

            await SkillService.removeSkill(userId, skillId);

            res.status(200).json({
                success: true,
                message: 'Skill removed successfully',
                data: { skillId }
            });
        } catch (error) {
            if (error.name === 'ValidationError') {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    error: error.details ? error.details[0].message : error.message
                });
            }
            if (error.message === 'Skill not found' || error.message === 'Skill document not found') {
                return res.status(404).json({
                    success: false,
                    message: 'Skill not found',
                    error: 'SkillNotFound'
                });
            }
            res.status(500).json({
                success: false,
                message: 'Failed to remove skill',
                error: error.message
            });
        }
    }

    /**
     * Add evidence to a skill
     */
    async addEvidence(req, res) {
        try {
            const userId = req.user.userId;
            const { skillId } = req.params;

            // Validate skillId
            await validate({ skillId }, { skillId: idSchema });
            // Validate evidence
            await validate(req.body, evidenceSchema);

            await SkillService.addEvidence(userId, skillId, req.body);

            // Return updated skill
            const updatedSkill = await SkillService.getSkillById(userId, skillId);

            res.status(200).json({
                success: true,
                message: 'Evidence added successfully',
                data: updatedSkill
            });
        } catch (error) {
            if (error.name === 'ValidationError') {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    error: error.details ? error.details[0].message : error.message
                });
            }
            if (error.message === 'Skill not found' || error.message === 'Skill document not found') {
                return res.status(404).json({
                    success: false,
                    message: 'Skill not found',
                    error: 'SkillNotFound'
                });
            }
            res.status(500).json({
                success: false,
                message: 'Failed to add evidence',
                error: error.message
            });
        }
    }

    /**
     * Remove evidence from a skill
     */
    async removeEvidence(req, res) {
        try {
            const userId = req.user.userId;
            const { skillId, evidenceId } = req.params;

            // Validate IDs
            await validate({ skillId }, { skillId: idSchema });
            await validate({ evidenceId }, { evidenceId: idSchema });

            await SkillService.removeEvidence(userId, skillId, evidenceId);

            res.status(200).json({
                success: true,
                message: 'Evidence removed successfully',
                data: { skillId, evidenceId }
            });
        } catch (error) {
            if (error.name === 'ValidationError') {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    error: error.details ? error.details[0].message : error.message
                });
            }
            if (error.message === 'Skill not found' || error.message === 'Skill document not found') {
                return res.status(404).json({
                    success: false,
                    message: 'Skill not found',
                    error: 'SkillNotFound'
                });
            }
            res.status(500).json({
                success: false,
                message: 'Failed to remove evidence',
                error: error.message
            });
        }
    }

    /**
     * Log practice time for a skill
     */
    async logPractice(req, res) {
        try {
            const userId = req.user.userId;
            const { skillId } = req.params;

            // Validate skillId
            await validate({ skillId }, { skillId: idSchema });
            // Validate practice data
            await validate(req.body, practiceSchema);

            await SkillService.logPractice(userId, skillId, req.body.minutes);

            // Return updated skill (or just the updated learningHours?)
            const snapshot = await SkillService.getSkillSnapshot(userId);
            const updatedSkill = snapshot.skills.find(s => s.id === skillId) || {};

            res.status(200).json({
                success: true,
                message: 'Practice logged successfully',
                data: {
                    skillId,
                    practiceMinutes: req.body.minutes,
                    totalLearningHours: snapshot.learningHours.total,
                    weeklyLearningHours: snapshot.learningHours.weekly,
                    skillHours: 0 // placeholder; we could compute from bySkill but not needed for now
                }
            });
        } catch (error) {
            if (error.name === 'ValidationError') {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    error: error.details ? error.dates[0].message : error.message
                });
            }
            if (error.message === 'Skill not found' || error.message === 'Skill document not found') {
                return res.status(404).json({
                    success: false,
                    message: 'Skill not found',
                    error: 'SkillNotFound'
                });
            }
            res.status(500).json({
                success: false,
                message: 'Failed to log practice',
                error: error.message
            });
        }
    }

    /**
     * Set proficiency for a skill
     */
    async setProficiency(req, res) {
        try {
            const userId = req.user.userId;
            const { skillId } = req.params;

            // Validate skillId
            await validate({ skillId }, { skillId: idSchema });
            // Validate proficiency
            await validate(req.body, proficiencySchema);

            await SkillService.setProficiency(userId, skillId, req.body);

            const updatedSkill = await SkillService.getSkillById(userId, skillId);

            res.status(200).json({
                success: true,
                message: 'Proficiency updated successfully',
                data: updatedSkill
            });
        } catch (error) {
            if (error.name === 'ValidationError') {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    error: error.details ? error.details[0].message : error.message
                });
            }
            if (error.message === 'Skill not found' || error.message === 'Skill document not found') {
                return res.status(404).json({
                    success: false,
                    message: 'Skill not found',
                    error: 'SkillNotFound'
                });
            }
            res.status(500).json({
                success: false,
                message: 'Failed to update proficiency',
                error: error.message
            });
        }
    }

    /**
     * Set goal level for a skill
     */
    async setGoalLevel(req, res) {
        try {
            const userId = req.user.userId;
            const { skillId } = req.params;

            // Validate skillId
            await validate({ skillId }, { skillId: idSchema });
            // Validate goal level (allow null)
            await validate(req.body, goalLevelSchema);

            const goalLevel = req.body.goalLevel;
            await SkillService.setGoalLevel(userId, skillId, goalLevel);

            const updatedSkill = await SkillService.getSkillById(userId, skillId);

            res.status(200).json({
                success: true,
                message: 'Goal level updated successfully',
                data: updatedSkill
            });
        } catch (error) {
            if (error.name === 'ValidationError') {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    error: error.details ? error.details[0].message : error.message
                });
            }
            if (error.message === 'Skill not found' || error.message === 'Skill document not found') {
                return res.status(404).json({
                    success: false,
                    message: 'Skill not found',
                    error: 'SkillNotFound'
                });
            }
            res.status(500).json({
                success: false,
                message: 'Failed to update goal level',
                error: error.message
            });
        }
    }
}

module.exports = new SkillController();