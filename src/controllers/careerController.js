// Career Controller
const CareerService = require('../services/CareerService');

class CareerController {
    /**
     * Get career snapshot for the authenticated user
     */
    async getCareerSnapshot(req, res) {
        try {
            const userId = req.user.userId;
            const careerSnapshot = await CareerService.getCareerSnapshot(userId);

            res.status(200).json({
                success: true,
                message: 'Career snapshot retrieved successfully',
                data: careerSnapshot
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve career snapshot',
                error: error.message
            });
        }
    }

    /**
     * Update career for the authenticated user
     */
    async updateCareer(req, res) {
        try {
            const userId = req.user.userId;
            const updates = req.body;

            const career = await CareerService.updateCareer(userId, updates);

            res.status(200).json({
                success: true,
                message: 'Career updated successfully',
                data: career
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to update career',
                error: error.message
            });
        }
    }

    /**
     * Add experience to career
     */
    async addExperience(req, res) {
        try {
            const userId = req.user.userId;
            const experienceData = req.body;

            const career = await CareerService.addExperience(userId, experienceData);

            res.status(201).json({
                success: true,
                message: 'Experience added successfully',
                data: career.experience[career.experience.length - 1] // Return the newly added experience
            });
        } catch (error) {
            if (error.message === 'Career record not found') {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }
            res.status(500).json({
                success: false,
                message: 'Failed to add experience',
                error: error.message
            });
        }
    }

    /**
     * Update experience in career
     */
    async updateExperience(req, res) {
        try {
            const userId = req.user.userId;
            const { experienceId } = req.params;
            const experienceData = req.body;

            const updatedExperience = await CareerService.updateExperience(userId, experienceId, experienceData);

            res.status(200).json({
                success: true,
                message: 'Experience updated successfully',
                data: updatedExperience
            });
        } catch (error) {
            if (error.message === 'Career record not found' ||
                error.message === 'Experience not found') {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }
            res.status(500).json({
                success: false,
                message: 'Failed to update experience',
                error: error.message
            });
        }
    }

    /**
     * Remove experience from career
     */
    async removeExperience(req, res) {
        try {
            const userId = req.user.userId;
            const { experienceId } = req.params;

            const career = await CareerService.removeExperience(userId, experienceId);

            res.status(200).json({
                success: true,
                message: 'Experience removed successfully',
                data: career
            });
        } catch (error) {
            if (error.message === 'Career record not found') {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }
            res.status(500).json({
                success: false,
                message: 'Failed to remove experience',
                error: error.message
            });
        }
    }

    /**
     * Add education to career
     */
    async addEducation(req, res) {
        try {
            const userId = req.user.userId;
            const educationData = req.body;

            const career = await CareerService.addEducation(userId, educationData);

            res.status(201).json({
                success: true,
                message: 'Education added successfully',
                data: career.education[career.education.length - 1] // Return the newly added education
            });
        } catch (error) {
            if (error.message === 'Career record not found') {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }
            res.status(500).json({
                success: false,
                message: 'Failed to add education',
                error: error.message
            });
        }
    }

    /**
     * Update education in career
     */
    async updateEducation(req, res) {
        try {
            const userId = req.user.userId;
            const { educationId } = req.params;
            const educationData = req.body;

            const updatedEducation = await CareerService.updateEducation(userId, educationId, educationData);

            res.status(200).json({
                success: true,
                message: 'Education updated successfully',
                data: updatedEducation
            });
        } catch (error) {
            if (error.message === 'Career record not found' ||
                error.message === 'Education not found') {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }
            res.status(500).json({
                success: false,
                message: 'Failed to update education',
                error: error.message
            });
        }
    }

    /**
     * Remove education from career
     */
    async removeEducation(req, res) {
        try {
            const userId = req.user.userId;
            const { educationId } = req.params;

            const career = await CareerService.removeEducation(userId, educationId);

            res.status(200).json({
                success: true,
                message: 'Education removed successfully',
                data: career
            });
        } catch (error) {
            if (error.message === 'Career record not found') {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }
            res.status(500).json({
                success: false,
                message: 'Failed to remove education',
                error: error.message
            });
        }
    }

    /**
     * Add certification to career
     */
    async addCertification(req, res) {
        try {
            const userId = req.user.userId;
            const certificationData = req.body;

            const career = await CareerService.addCertification(userId, certificationData);

            res.status(201).json({
                success: true,
                message: 'Certification added successfully',
                data: career.certifications[career.certifications.length - 1] // Return the newly added certification
            });
        } catch (error) {
            if (error.message === 'Career record not found') {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }
            res.status(500).json({
                success: false,
                message: 'Failed to add certification',
                error: error.message
            });
        }
    }

    /**
     * Update certification in career
     */
    async updateCertification(req, res) {
        try {
            const userId = req.user.userId;
            const { certificationId } = req.params;
            const certificationData = req.body;

            const updatedCertification = await CareerService.updateCertification(userId, certificationId, certificationData);

            res.status(200).json({
                success: true,
                message: 'Certification updated successfully',
                data: updatedCertification
            });
        } catch (error) {
            if (error.message === 'Career record not found' ||
                error.message === 'Certification not found') {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }
            res.status(500).json({
                success: false,
                message: 'Failed to update certification',
                error: error.message
            });
        }
    }

    /**
     * Remove certification from career
     */
    async removeCertification(req, res) {
        try {
            const userId = req.user.userId;
            const { certificationId } = req.params;

            const career = await CareerService.removeCertification(userId, certificationId);

            res.status(200).json({
                success: true,
                message: 'Certification removed successfully',
                data: career
            });
        } catch (error) {
            if (error.message === 'Career record not found') {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }
            res.status(500).json({
                success: false,
                message: 'Failed to remove certification',
                error: error.message
            });
        }
    }

    /**
     * Add a career goal
     */
    async addGoal(req, res) {
        try {
            const userId = req.user.userId;
            const goalData = req.body;

            const career = await CareerService.addGoal(userId, goalData);

            res.status(201).json({
                success: true,
                message: 'Goal added successfully',
                data: career.goals[career.goals.length - 1] // Return the newly added goal
            });
        } catch (error) {
            if (error.message === 'Career record not found') {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }
            res.status(500).json({
                success: false,
                message: 'Failed to add goal',
                error: error.message
            });
        }
    }

    /**
     * Update a career goal
     */
    async updateGoal(req, res) {
        try {
            const userId = req.user.userId;
            const { goalId } = req.params;
            const goalData = req.body;

            const updatedGoal = await CareerService.updateGoal(userId, goalId, goalData);

            res.status(200).json({
                success: true,
                message: 'Goal updated successfully',
                data: updatedGoal
            });
        } catch (error) {
            if (error.message === 'Career record not found' ||
                error.message === 'Goal not found') {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }
            res.status(500).json({
                success: false,
                message: 'Failed to update goal',
                error: error.message
            });
        }
    }

    /**
     * Remove a career goal
     */
    async removeGoal(req, res) {
        try {
            const userId = req.user.userId;
            const { goalId } = req.params;

            const career = await CareerService.removeGoal(userId, goalId);

            res.status(200).json({
                success: true,
                message: 'Goal removed successfully',
                data: career
            });
        } catch (error) {
            if (error.message === 'Career record not found') {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }
            res.status(500).json({
                success: false,
                message: 'Failed to remove goal',
                error: error.message
            });
        }
    }
}

module.exports = new CareerController();