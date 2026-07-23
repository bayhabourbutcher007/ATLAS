// Career Service
const Career = require('../models/Career');
const CareerSnapshot = require('../models/CareerSnapshot');

class CareerService {
    /**
     * Get career for a user
     * @param {string} userId - User ID
     * @returns {Promise<Object>} Career document
     */
    async getCareer(userId) {
        let career = await Career.findOne({ userId });

        // If no career record exists, create one with default values
        if (!career) {
            career = new Career({ userId });
            await career.save();
        }

        return career;
    }

    /**
     * Get career snapshot for a user - returns DTO matching CareerDTO format
     * @param {string} userId - User ID
     * @returns {Promise<Object>} Career DTO object
     */
    async getCareerSnapshot(userId) {
        const career = await Career.findOne({ userId });

        // If no career record exists, return empty DTO structure
        if (!career) {
            return this.getEmptyCareerDTO();
        }

        // Convert to plain object and return DTO
        const careerObj = career.toObject();

        // Transform to match the exact DTO structure from CONTACT_SCHEMA.md
        const dto = {
            currentPosition: {
                title: careerObj.currentPosition?.title ?? '',
                company: careerObj.currentPosition?.company ?? '',
                startDate: careerObj.currentPosition?.startDate
                    ? new Date(careerObj.currentPosition.startDate).toISOString()
                    : null,
                employmentType: careerObj.currentPosition?.employmentType ?? null,
                location: careerObj.currentPosition?.location ?? '',
                remote: careerObj.currentPosition?.remote ?? false,
                industry: careerObj.currentPosition?.industry ?? '',
                salary: careerObj.currentPosition?.salary ? {
                    amount: careerObj.currentPosition.salary.amount ?? 0,
                    currency: careerObj.currentPosition.salary.currency ?? 'USD',
                    frequency: careerObj.currentPosition.salary.frequency ?? null
                } : null
            },
            experience: (careerObj.experience || []).map(exp => ({
                id: exp._id?.toString() ?? '',
                title: exp.title ?? '',
                company: exp.company ?? '',
                startDate: exp.startDate ? new Date(exp.startDate).toISOString() : null,
                endDate: exp.endDate ? new Date(exp.endDate).toISOString() : null,
                description: exp.description ?? '',
                skillsUsed: exp.skillsUsed || []
            })),
            education: (careerObj.education || []).map(edu => ({
                institution: edu.institution ?? '',
                degree: edu.degree ?? '',
                fieldOfStudy: edu.fieldOfStudy ?? '',
                startDate: edu.startDate ? new Date(edu.startDate).toISOString() : null,
                endDate: edu.endDate ? new Date(edu.endDate).toISOString() : null,
                gpa: edu.gpa ?? null
            })),
            certifications: (careerObj.certifications || []).map(cert => ({
                name: cert.name ?? '',
                issuer: cert.issuer ?? '',
                date: cert.date ? new Date(cert.date).toISOString() : null,
                expiryDate: cert.expiryDate ? new Date(cert.expiryDate).toISOString() : null,
                credentialId: cred.credentialId ?? ''
            })),
            goals: (careerObj.goals || []).map(goal => ({
                id: goal._id?.toString() ?? '',
                title: goal.title ?? '',
                description: goal.description ?? '',
                type: goal.type ?? 'Other',
                targetValue: goal.targetValue ?? null,
                currentValue: goal.currentValue ?? 0,
                startDate: goal.startDate ? new Date(goal.startDate).toISOString() : null,
                targetDate: goal.targetDate ? new Date(goal.targetDate).toISOString() : null,
                status: goal.status ?? 'NotStarted',
                priority: goal.priority ?? 'Medium',
                completed: !!goal.completed,
                createdAt: goal.createdAt ? new Date(goal.createdAt).toISOString() : null,
                updatedAt: goal.updatedAt ? new Date(goal.updatedAt).toISOString() : null
            }))
        };

        return dto;
    }

    /**
     * Get empty career DTO structure
     * @returns {Object} Empty career DTO
     */
    getEmptyCareerDTO() {
        return {
            currentPosition: {
                title: '',
                company: '',
                startDate: null,
                employmentType: null,
                location: '',
                remote: false,
                industry: '',
                salary: null
            },
            experience: [],
            education: [],
            certifications: [],
            goals: []
        };
    }

    /**
     * Get career document for a user
     * @param {string} userId - User ID
     * @returns {Promise<Object>} Career document (or null)
     */
    async getCareerDoc(userId) {
        return await Career.findOne({ userId });
    }

    /**
     * Update career for a user
     * @param {string} userId - User ID
     * @param {Object} updates - Data to update
     * @returns {Promise<Object>} Updated career document
     */
    async updateCareer(userId, updates) {
        const career = await Career.findOneAndUpdate(
            { userId },
            { $set: { ...updates, updatedAt: new Date() } },
            { new: true, runValidators: true, upsert: true }
        );

        return career;
    }

    /**
     * Add experience to career
     * @param {string} userId - User ID
     * @param {Object} experienceData - Experience data to add
     * @returns {Promise<Object>} Updated career document
     */
    async addExperience(userId, experienceData) {
        const career = await Career.findOneAndUpdate(
            { userId },
            {
                $push: { experience: experienceData },
                $set: { updatedAt: new Date() }
            },
            { new: true, runValidators: true }
        );

        if (!career) {
            throw new Error('Career record not found');
        }

        return career;
    }

    /**
     * Update experience in career
     * @param {string} userId - User ID
     * @param {string} experienceId - Experience ID to update
     * @param {Object} experienceData - Updated experience data
     * @returns {Promise<Object>} Updated experience object
     */
    async updateExperience(userId, experienceId, experienceData) {
        const career = await Career.findOne({ userId });
        if (!career) {
            throw new Error('Career record not found');
        }

        // Find the experience index
        const experienceIndex = career.experience.findIndex(exp =>
            exp._id.toString() === experienceId
        );

        if (experienceIndex === -1) {
            throw new Error('Experience not found');
        }

        // Update the experience
        career.experience[experienceIndex] = {
            ...career.experience[experienceIndex].toObject(),
            ...experienceData,
            _id: career.experience[experienceIndex]._id // Preserve the original ID
        };

        // Save the updated career
        await career.save();

        return career.experience[experienceIndex];
    }

    /**
     * Remove experience from career
     * @param {string} userId - User ID
     * @param {string} experienceId - Experience ID to remove
     * @returns {Promise<Object>} Updated career document
     */
    async removeExperience(userId, experienceId) {
        const career = await Career.findOneAndUpdate(
            { userId },
            {
                $pull: { experience: { _id: new ObjectId(experienceId) } },
                $set: { updatedAt: new Date() }
            },
            { new: true }
        );

        if (!career) {
            throw new Error('Career record not found');
        }

        return career;
    }

    /**
     * Add education to career
     * @param {string} userId - User ID
     * @param {Object} educationData - Education data to add
     * @returns {Promise<Object>} Updated career document
     */
    async addEducation(userId, educationData) {
        const career = await Career.findOneAndUpdate(
            { userId },
            {
                $push: { education: educationData },
                $set: { updatedAt: new Date() }
            },
            { new: true, runValidators: true }
        );

        if (!career) {
            throw new Error('Career record not found');
        }

        return career;
    }

    /**
     * Update education in career
     * @param {string} userId - User ID
     * @param {string} educationId - Education ID to update
     * @param {Object} educationData - Updated education data
     * @returns {Promise<Object>} Updated education object
     */
    async updateEducation(userId, educationId, educationData) {
        const career = await Career.findOne({ userId });
        if (!career) {
            throw new Error('Career record not found');
        }

        // Find the education index
        const educationIndex = career.education.findIndex(edu =>
            edu._id.toString() === educationId
        );

        if (educationIndex === -1) {
            throw new Error('Education not found');
        }

        // Update the education
        career.education[educationIndex] = {
            ...career.education[educationIndex].toObject(),
            ...educationData,
            _id: career.education[educationIndex]._id // Preserve the original ID
        };

        // Save the updated career
        await career.save();

        return career.education[educationIndex];
    }

    /**
     * Remove education from career
     * @param {string} userId - User ID
     * @param {string} educationId - Education ID to remove
     * @returns {Promise<Object>} Updated career document
     */
    async removeEducation(userId, educationId) {
        const career = await Career.findOneAndUpdate(
            { userId },
            {
                $pull: { education: { _id: new ObjectId(educationId) } },
                $set: { updatedAt: new Date() }
            },
            { new: true }
        );

        if (!career) {
            throw new Error('Career record not found');
        }

        return career;
    }

    /**
     * Add certification to career
     * @param {string} userId - User ID
     * @param {Object} certificationData - Certification data to add
     * @returns {Promise<Object>} Updated career document
     */
    async addCertification(userId, certificationData) {
        const career = await Career.findOneAndUpdate(
            { userId },
            {
                $push: { certifications: certificationData },
                $set: { updatedAt: new Date() }
            },
            { new: true, runValidators: true }
        );

        if (!career) {
            throw new Error('Career record not found');
        }

        return career;
    }

    /**
     * Update certification in career
     * @param {string} userId - User ID
     * @param {string} certificationId - Certification ID to update
     * @param {Object} certificationData - Updated certification data
     * @returns {Promise<Object>} Updated certification object
     */
    async updateCertification(userId, certificationId, certificationData) {
        const career = await Career.findOne({ userId });
        if (!career) {
            throw new Error('Career record not found');
        }

        // Find the certification index
        const certificationIndex = career.certifications.findIndex(cert =>
            cert._id.toString() === certificationId
        );

        if (certificationIndex === -1) {
            throw new Error('Certification not found');
        }

        // Update the certification
        career.certifications[certificationIndex] = {
            ...career.certifications[certificationIndex].toObject(),
            ...certificationData,
            _id: career.certifications[certificationIndex]._id // Preserve the original ID
        };

        // Save the updated career
        await career.save();

        return career.certifications[certificationIndex];
    }

    /**
     * Remove certification from career
     * @param {string} userId - User ID
     * @param {string} certificationId - Certification ID to remove
     * @returns {Promise<Object>} Updated career document
     */
    async removeCertification(userId, certificationId) {
        const career = await Career.findOneAndUpdate(
            { userId },
            {
                $pull: { certifications: { _id: new ObjectId(certificationId) } },
                $set: { updatedAt: new Date() }
            },
            { new: true }
        );

        if (!career) {
            throw new Error('Career record not found');
        }

        return career;
    }

    /**
     * Add a career goal
     * @param {string} userId - User ID
     * @param {Object} goalData - Goal data to add
     * @returns {Promise<Object>} Updated career document
     */
    async addGoal(userId, goalData) {
        const career = await Career.findOneAndUpdate(
            { userId },
            {
                $push: { goals: goalData },
                $set: { updatedAt: new Date() }
            },
            { new: true, runValidators: true }
        );

        if (!career) {
            throw new Error('Career record not found');
        }

        return career;
    }

    /**
     * Update a career goal
     * @param {string} userId - User ID
     * @param {string} goalId - Goal ID to update
     * @param {Object} goalData - Updated goal data
     * @returns {Promise<Object>} Updated goal object
     */
    async updateGoal(userId, goalId, goalData) {
        const career = await Career.findOne({ userId });
        if (!career) {
            throw new Error('Career record not found');
        }

        // Find the goal index
        const goalIndex = career.goals.findIndex(goal =>
            goal._id.toString() === goalId
        );

        if (goalIndex === -1) {
            throw new Error('Goal not found');
        }

        // Update the goal
        career.goals[goalIndex] = {
            ...career.goals[goalIndex].toObject(),
            ...goalData,
            updatedAt: new Date()
        };

        // Save the updated career
        await career.save();

        return career.goals[goalIndex];
    }

    /**
     * Remove a career goal
     * @param {string} userId - User ID
     * @param {string} goalId - Goal ID to remove
     * @returns {Promise<Object>} Updated career document
     */
    async removeGoal(userId, goalId) {
        const career = await Career.findOneAndUpdate(
            { userId },
            {
                $pull: { goals: { _id: new ObjectId(goalId) } },
                $set: { updatedAt: new Date() }
            },
            { new: true }
        );

        if (!career) {
            throw new Error('Career record not found');
        }

        return career;
    }

    /**
     * Get career history for a user - returns array of career DTOs
     * @param {string} userId - User ID
     * @param {Object} options - { startDate, endDate, interval, aggregation }
// Note: In Phase 3A, we only support raw interval (no aggregation)
     * @returns {Promise<Array>} Array of career DTO objects
     */
    async getCareerHistory(userId, options = {}) {
        const startDate = options.startDate ? new Date(options.startDate) : undefined;
        const endDate = options.endDate ? new Date(options.endDate) : new Date();
        let start = startDate;
        let end = endDate;
        if (!start) {
            start = new Date(end);
        }
        if (start.getTime() > end.getTime()) {
            const temp = start;
            start = end;
            end = temp;
        }
        // We only support raw interval in Phase 3A
        const query = {
            userId,
            timestamp: {
                $gte: start,
                $lte: end
            }
        };
        // Sort by timestamp ascending
        const snapshots = await CareerSnapshot.find(query).sort({ timestamp: 1 });

        // Build DTO for each snapshot (mirroring getCareerSnapshot logic)
        return snapshots.map(snap => {
            const obj = snap.toObject();
            return {
                currentPosition: {
                    title: obj.currentPosition?.title ?? '',
                    company: obj.currentPosition?.company ?? '',
                    startDate: obj.currentPosition?.startDate
                        ? new Date(obj.currentPosition.startDate).toISOString()
                        : null,
                    employmentType: obj.currentPosition?.employmentType ?? null,
                    location: obj.currentPosition?.location ?? '',
                    remote: obj.currentPosition?.remote ?? false,
                    industry: obj.currentPosition?.industry ?? '',
                    salary: obj.currentPosition?.salary ? {
                        amount: obj.currentPosition.salary.amount ?? 0,
                        currency: obj.currentPosition.salary.currency ?? 'USD',
                        frequency: obj.currentPosition.salary.frequency ?? null
                    } : null
                },
                experience: obj.experience || [], // already a count
                education: obj.education || [], // already a count
                certifications: obj.certifications || [], // already a count
                goals: obj.goals || [] // already a count
            };
        });
    }
}

module.exports = new CareerService();