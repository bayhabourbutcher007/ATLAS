// Academic Progress Service
const AcademicProgress = require('../models/AcademicProgress');

class AcademicProgressService {
    /**
     * Get academic progress for a user
     * @param {string} userId - User ID
     * @returns {Promise<Object>} Academic progress document
     */
    async getAcademicProgress(userId) {
        let academicProgress = await AcademicProgress.findOne({ userId });

        // If no academic progress record exists, create one
        if (!academicProgress) {
            academicProgress = new AcademicProgress({ userId });
            await academicProgress.save();
        }

        return academicProgress;
    }

    /**
     * Get academic snapshot for a user - returns DTO matching AcademicDTO format
     * @param {string} userId - User ID
     * @returns {Promise<Object>} Academic DTO object
     */
    async getAcademicSnapshot(userId) {
        const academicProgress = await AcademicProgress.findOne({ userId });

        // If no academic progress record exists, return empty DTO structure
        if (!academicProgress) {
            return this.getEmptyAcademicDTO();
        }

        // Convert to plain object and return DTO
        const academicObj = academicProgress.toObject();

        // Transform to match the exact DTO structure from CONTEXT_SCHEMA.md
        const dto = {
            currentTerm: {
                term: academicObj.academicTerm?.term ?? 'Summer',
                year: academicObj.academicTerm?.year ?? 2026
            },
            gpa: {
                semester: academicObj.gpa?.semester ?? null,
                cumulative: academicObj.gpa?.cumulative ?? null
            },
            credits: {
                completed: academicObj.credits?.completed ?? 0,
                inProgress: academicObj.credits?.inProgress ?? 0,
                planned: academicObj.credits?.planned ?? 0
            },
            courses: (academicObj.courses || []).map(course => ({
                id: course._id?.toString() ?? '',
                courseId: course.courseId ?? '',
                courseName: course.courseName ?? '',
                courseCode: course.courseCode ?? '',
                credits: course.credits ?? null,
                instructor: course.instructor ?? '',
                term: course.term ?? null,
                year: course.year ?? null,
                grade: course.grade ?? null,
                gradePoints: course.gradePoints ?? null,
                status: course.status ?? 'Enrolled',
                materials: (course.materials || []).map(material => ({
                    name: material.name ?? '',
                    type: material.type ?? null,
                    url: material.url ?? ''
                })),
                schedule: (course.schedule || []).map(schedule => ({
                    dayOfWeek: schedule.dayOfWeek ?? null,
                    startTime: schedule.startTime ?? null,
                    endTime: schedule.endTime ?? null,
                    location: schedule.location ?? ''
                })),
                customFields: (course.customFields || []).map(customField => ({
                    name: customField.name ?? '',
                    value: customField.value,
                    type: customField.type ?? 'text'
                }))
            })),
            studyHours: {
                total: academicObj.studyHours?.total ?? 0,
                weekly: academicObj.studyHours?.weekly ?? 0,
                monthly: academicObj.studyHours?.monthly ?? 0,
                byCourse: (academicObj.studyHours?.byCourse || []).map(byCourse => ({
                    courseId: byCourse.courseId ?? '',
                    minutes: byCourse.minutes ?? 0
                })),
                lastUpdated: academicObj.studyHours?.lastUpdated
                    ? new Date(academicObj.studyHours.lastUpdated).toISOString()
                    : null
            },
            goals: (academicObj.goals || []).map(goal => ({
                id: goal._id?.toString() ?? '',
                title: goal.title ?? '',
                description: goal.description ?? '',
                type: goal.type ?? 'Other',
                targetValue: goal.targetValue ?? null,
                startDate: goal.startDate ? new Date(goal.startDate).toISOString() : null,
                targetDate: goal.targetDate ? new Date(goal.targetDate).toISOString() : null,
                status: goal.status ?? 'NotStarted',
                priority: goal.priority ?? 'Medium',
                completed: !!goal.completed,
                createdAt: goal.createdAt ? new Date(goal.createdAt).toISOString() : null,
                updatedAt: goal.updatedAt ? new Date(goal.updatedAt).toISOString() : null
            })),
            achievements: (academicObj.achievements || []).map(achievement => ({
                id: achievement._id?.toString() ?? '',
                title: achievement.title ?? '',
                description: achievement.description ?? '',
                date: achievement.date ? new Date(achievement.date).toISOString() : null,
                issuer: achievement.issuer ?? '',
                certificateUrl: achievement.certificateUrl ?? '',
                category: achievement.category ?? 'Other'
            }))
        };

        return dto;
    }

    /**
     * Get empty academic DTO structure
     * @returns {Object} Empty academic DTO
     */
    getEmptyAcademicDTO() {
        return {
            currentTerm: { term: 'Summer', year: 2026 },
            gpa: { semester: null, cumulative: null },
            credits: { completed: 0, inProgress: 0, planned: 0 },
            courses: [],
            studyHours: {
                total: 0,
                weekly: 0,
                monthly: 0,
                byCourse: [],
                lastUpdated: null
            },
            goals: [],
            achievements: []
        };
    }

    /**
     * Update academic progress for a user
     * @param {string} userId - User ID
     * @param {Object} updates - Data to update
     * @returns {Promise<Object>} Updated academic progress document
     */
    async updateAcademicProgress(userId, updates) {
        const academicProgress = await AcademicProgress.findOneAndUpdate(
            { userId },
            { $set: { ...updates, updatedAt: new Date() } },
            { new: true, runValidators: true, upsert: true }
        );

        return academicProgress;
    }

    /**
     * Add a course to academic progress
     * @param {string} userId - User ID
     * @param {Object} courseData - Course data to add
     * @returns {Promise<Object>} Updated academic progress document
     */
    async addCourse(userId, courseData) {
        const academicProgress = await AcademicProgress.findOneAndUpdate(
            { userId },
            {
                $push: { courses: courseData },
                $set: { updatedAt: new Date() }
            },
            { new: true, runValidators: true }
        );

        if (!academicProgress) {
            throw new Error('Academic progress record not found');
        }

        return academicProgress;
    }

    /**
     * Update a course in academic progress
     * @param {string} userId - User ID
     * @param {string} courseId - Course ID to update
     * @param {Object} courseData - Updated course data
     * @returns {Promise<Object>} Updated course object
     */
    async updateCourse(userId, courseId, courseData) {
        const academicProgress = await AcademicProgress.findOne({ userId });
        if (!academicProgress) {
            throw new Error('Academic progress record not found');
        }

        // Find the course index
        const courseIndex = academicProgress.courses.findIndex(course =>
            course._id.toString() === courseId
        );

        if (courseIndex === -1) {
            throw new Error('Course not found');
        }

        // Update the course
        academicProgress.courses[courseIndex] = {
            ...academicProgress.courses[courseIndex].toObject(),
            ...courseData,
            _id: academicProgress.courses[courseIndex]._id // Preserve the original ID
        };

        // Save the updated academic progress
        await academicProgress.save();

        return academicProgress.courses[courseIndex];
    }

    /**
     * Remove a course from academic progress
     * @param {string} userId - User ID
     * @param {string} courseId - Course ID to remove
     * @returns {Promise<Object>} Updated academic progress document
     */
    async removeCourse(userId, courseId) {
        const academicProgress = await AcademicProgress.findOneAndUpdate(
            { userId },
            {
                $pull: { courses: { _id: courseId } },
                $set: { updatedAt: new Date() }
            },
            { new: true }
        );

        if (!academicProgress) {
            throw new Error('Academic progress record not found');
        }

        return academicProgress;
    }

    /**
     * Add study hours to a course
     * @param {string} userId - User ID
     * @param {string} courseId - Course ID
     * @param {number} minutes - Study minutes to add
     * @returns {Promise<Object>} Updated study hours data
     */
    async addStudyHours(userId, courseId, minutes) {
        const academicProgress = await AcademicProgress.findOne({ userId });
        if (!academicProgress) {
            throw new Error('Academic progress record not found');
        }

        // Update total study hours
        academicProgress.studyHours.total += minutes;
        academicProgress.studyHours.weekly += minutes;
        academicProgress.studyHours.monthly += minutes;
        academicProgress.studyHours.lastUpdated = new Date();

        // Update course-specific study hours
        const courseIndex = academicProgress.studyHours.byCourse.findIndex(entry =>
            entry.courseId === courseId
        );

        if (courseIndex !== -1) {
            academicProgress.studyHours.byCourse[courseIndex].minutes += minutes;
        } else {
            academicProgress.studyHours.byCourse.push({ courseId, minutes });
        }

        await academicProgress.save();

        return {
            totalStudyHours: academicProgress.studyHours.total,
            courseStudyHours: academicProgress.studyHours.byCourse.find(entry =>
                entry.courseId === courseId
            )?.minutes || 0
        };
    }

    /**
     * Add an academic goal
     * @param {string} userId - User ID
     * @param {Object} goalData - Goal data to add
     * @returns {Promise<Object>} Updated academic progress document
     */
    async addGoal(userId, goalData) {
        const academicProgress = await AcademicProgress.findOneAndUpdate(
            { userId },
            {
                $push: { goals: goalData },
                $set: { updatedAt: new Date() }
            },
            { new: true, runValidators: true }
        );

        if (!academicProgress) {
            throw new Error('Academic progress record not found');
        }

        return academicProgress;
    }

    /**
     * Update an academic goal
     * @param {string} userId - User ID
     * @param {string} goalId - Goal ID to update
     * @param {Object} goalData - Updated goal data
     * @returns {Promise<Object>} Updated goal object
     */
    async updateGoal(userId, goalId, goalData) {
        const academicProgress = await AcademicProgress.findOne({ userId });
        if (!academicProgress) {
            throw new Error('Academic progress record not found');
        }

        // Find the goal index
        const goalIndex = academicProgress.goals.findIndex(goal =>
            goal._id.toString() === goalId
        );

        if (goalIndex === -1) {
            throw new Error('Goal not found');
        }

        // Update the goal
        academicProgress.goals[goalIndex] = {
            ...academicProgress.goals[goalIndex].toObject(),
            ...goalData,
            _id: academicProgress.goals[goalIndex]._id, // Preserve the original ID
            updatedAt: new Date()
        };

        // Save the updated academic progress
        await academicProgress.save();

        return academicProgress.goals[goalIndex];
    }

    /**
     * Remove an academic goal
     * @param {string} userId - User ID
     * @param {string} goalId - Goal ID to remove
     * @returns {Promise<Object>} Updated academic progress document
     */
    async removeGoal(userId, goalId) {
        const academicProgress = await AcademicProgress.findOneAndUpdate(
            { userId },
            {
                $pull: { goals: { _id: goalId } },
                $set: { updatedAt: new Date() }
            },
            { new: true }
        );

        if (!academicProgress) {
            throw new Error('Academic progress record not found');
        }

        return academicProgress;
    }

    /**
     * Add an academic achievement
     * @param {string} userId - User ID
     * @param {Object} achievementData - Achievement data to add
     * @returns {Promise<Object>} Updated academic progress document
     */
    async addAchievement(userId, achievementData) {
        const academicProgress = await AcademicProgress.findOneAndUpdate(
            { userId },
            {
                $push: { achievements: achievementData },
                $set: { updatedAt: new Date() }
            },
            { new: true, runValidators: true }
        );

        if (!academicProgress) {
            throw new Error('Academic progress record not found');
        }

        return academicProgress;
    }

    /**
     * Get performance summary for a user
     * @param {string} userId - User ID
     * @returns {Promise<Object>} Performance summary data
     */
    async getPerformanceSummary(userId) {
        const academicProgress = await AcademicProgress.findOne({ userId });
        if (!academicProgress) {
            throw new Error('Academic progress record not found');
        }

        // Calculate GPA
        const gpa = academicProgress.calculateGPA();

        // Count courses by status
        const completedCourses = academicProgress.getCompletedCourses();
        const inProgressCourses = academicProgress.getInProgressCourses();
        const plannedCourses = academicProgress.getPlannedCourses();

        // Calculate completion rate
        const totalCourses = academicProgress.courses.length;
        const completionRate = totalCourses > 0 ?
            (completedCourses.length / totalCourses) * 100 : 0;

        // Calculate total credits
        const totalCredits = academicProgress.courses.reduce((sum, course) => {
            return sum + (course.credits || 0);
        }, 0);

        // Calculate completed credits
        const completedCredits = completedCourses.reduce((sum, course) => {
            return sum + (course.credits || 0);
        }, 0);

        return {
            gpa: parseFloat(gpa.toFixed(2)),
            credits: {
                total: totalCredits,
                completed: completedCredits,
                remaining: totalCredits - completedCredits
            },
            courses: {
                total: totalCourses,
                completed: completedCourses.length,
                inProgress: inProgressCourses.length,
                planned: plannedCourses.length
            },
            completionRate: parseFloat(completionRate.toFixed(2)),
            studyHours: {
                total: academicProgress.studyHours.total,
                weekly: academicProgress.studyHours.weekly,
                monthly: academicProgress.studyHours.monthly
            },
            goals: {
                total: academicProgress.goals.length,
                completed: academicProgress.goals.filter(goal => goal.completed).length,
                inProgress: academicProgress.goals.filter(goal =>
                    goal.status === 'InProgress' && !goal.completed).length,
                notStarted: academicProgress.goals.filter(goal =>
                    goal.status === 'NotStarted').length
            },
            achievements: academicProgress.achievements.length
        };
    }
}

module.exports = new AcademicProgressService();