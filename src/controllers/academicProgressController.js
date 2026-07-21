// Academic Progress Controller
const AcademicProgressService = require('../services/AcademicProgressService');

class AcademicProgressController {
    /**
     * Get academic progress for the authenticated user
     */
    async getAcademicProgress(req, res) {
        try {
            const userId = req.user.userId;
            const academicProgress = await AcademicProgressService.getAcademicProgress(userId);

            res.status(200).json({
                success: true,
                message: 'Academic progress retrieved successfully',
                data: academicProgress
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve academic progress',
                error: error.message
            });
        }
    }

    /**
     * Update academic progress for the authenticated user
     */
    async updateAcademicProgress(req, res) {
        try {
            const userId = req.user.userId;
            const updates = req.body;

            const academicProgress = await AcademicProgressService.updateAcademicProgress(userId, updates);

            res.status(200).json({
                success: true,
                message: 'Academic progress updated successfully',
                data: academicProgress
            });
        } catch (error) {
            if (error.message === 'Academic progress record not found') {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }
            res.status(500).json({
                success: false,
                message: 'Failed to update academic progress',
                error: error.message
            });
        }
    }

    /**
     * Add a course to academic progress
     */
    async addCourse(req, res) {
        try {
            const userId = req.user.userId;
            const courseData = req.body;

            const academicProgress = await AcademicProgressService.addCourse(userId, courseData);

            res.status(201).json({
                success: true,
                message: 'Course added successfully',
                data: academicProgress.courses[academicProgress.courses.length - 1] // Return the newly added course
            });
        } catch (error) {
            if (error.message === 'Academic progress record not found') {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }
            res.status(500).json({
                success: false,
                message: 'Failed to add course',
                error: error.message
            });
        }
    }

    /**
     * Update a course in academic progress
     */
    async updateCourse(req, res) {
        try {
            const userId = req.user.userId;
            const { courseId } = req.params;
            const courseData = req.body;

            const updatedCourse = await AcademicProgressService.updateCourse(userId, courseId, courseData);

            res.status(200).json({
                success: true,
                message: 'Course updated successfully',
                data: updatedCourse
            });
        } catch (error) {
            if (error.message === 'Academic progress record not found' ||
                error.message === 'Course not found') {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }
            res.status(500).json({
                success: false,
                message: 'Failed to update course',
                error: error.message
            });
        }
    }

    /**
     * Remove a course from academic progress
     */
    async removeCourse(req, res) {
        try {
            const userId = req.user.userId;
            const { courseId } = req.params;

            const academicProgress = await AcademicProgressService.removeUserCourse(userId, courseId);

            res.status(200).json({
                success: true,
                message: 'Course removed successfully',
                data: academicProgress
            });
        } catch (error) {
            if (error.message === 'Academic progress record not found') {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }
            res.status(500).json({
                success: false,
                message: 'Failed to remove course',
                error: error.message
            });
        }
    }

    /**
     * Add study hours to a course
     */
    async addStudyHours(req, res) {
        try {
            const userId = req.user.userId;
            const { courseId, minutes } = req.body;

            const result = await AcademicProgressService.addStudyHours(userId, courseId, minutes);

            res.status(200).json({
                success: true,
                message: 'Study hours added successfully',
                data: result
            });
        } catch (error) {
            if (error.message === 'Academic progress record not found') {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }
            res.status(500).json({
                success: false,
                message: 'Failed to add study hours',
                error: error.message
            });
        }
    }

    /**
     * Add an academic goal
     */
    async addGoal(req, res) {
        try {
            const userId = req.user.userId;
            const goalData = req.body;

            const academicProgress = await AcademicProgressService.addGoal(userId, goalData);

            res.status(201).json({
                success: true,
                message: 'Goal added successfully',
                data: academicProgress.goals[academicProgress.goals.length - 1] // Return the newly added goal
            });
        } catch (error) {
            if (error.message === 'Academic progress record not found') {
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
     * Update an academic goal
     */
    async updateGoal(req, res) {
        try {
            const userId = req.user.userId;
            const { goalId } = req.params;
            const goalData = req.body;

            const updatedGoal = await AcademicProgressService.updateGoal(userId, goalId, goalData);

            res.status(200).json({
                success: true,
                message: 'Goal updated successfully',
                data: updatedGoal
            });
        } catch (error) {
            if (error.message === 'Academic progress record not found' ||
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
     * Remove an academic goal
     */
    async removeGoal(req, res) {
        try {
            const userId = req.user.userId;
            const { goalId } = req.params;

            const academicProgress = await AcademicProgressService.removeGoal(userId, goalId);

            res.status(200).json({
                success: true,
                message: 'Goal removed successfully',
                data: academicProgress
            });
        } catch (error) {
            if (error.message === 'Academic progress record not found') {
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

    /**
     * Add an academic achievement
     */
    async addAchievement(req, res) {
        try {
            const userId = req.user.userId;
            const achievementData = req.body;

            const academicProgress = await AcademicProgressService.addAchievement(userId, achievementData);

            res.status(201).json({
                success: true,
                message: 'Achievement added successfully',
                data: academicProgress.achievements[academicProgress.achievements.length - 1] // Return the newly added achievement
            });
        } catch (error) {
            if (error.message === 'Academic progress record not found') {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }
            res.status(500).json({
                success: false,
                message: 'Failed to add achievement',
                error: error.message
            });
        }
    }

    /**
     * Get performance summary
     */
    async getPerformanceSummary(req, res) {
        try {
            const userId = req.user.userId;
            const summary = await AcademicProgressService.getPerformanceSummary(userId);

            res.status(200).json({
                success: true,
                message: 'Performance summary retrieved successfully',
                data: summary
            });
        } catch (error) {
            if (error.message === 'Academic progress record not found') {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve performance summary',
                error: error.message
            });
        }
    }
}

module.exports = new AcademicProgressController();