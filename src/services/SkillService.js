// Skill Service
const Skill = require('../models/Skill');
const { ObjectId } = require('mongoose').Types;

class SkillService {
    /**
     * Get skill snapshot for a user - returns DTO matching SkillDTO format
     * @param {string} userId - User ID
     * @returns {Promise<Object>} Skill DTO object
     */
    async getSkillSnapshot(userId) {
        let skillDoc = await Skill.findOne({ userId });

        // If no skill record exists, return empty DTO structure
        if (!skillDoc) {
            return this.getEmptySkillDTO();
        }

        // Convert to plain object
        const obj = skillDoc.toObject();

        // Transform to match the exact DTO structure from CONTEXT_SCHEMA.md
        const dto = {
            skills: (obj.skills || []).map(skill => ({
                id: skill._id?.toString() ?? '',
                name: skill.name ?? '',
                category: skill.category ?? '',
                proficiency: skill.proficiency ?? 0,
                evidence: (skill.evidence || []).map(ev => ({
                    type: ev.type ?? '',
                    description: ev.description ?? '',
                    date: ev.date ? new Date(ev.date).toISOString() : null,
                    url: ev.url ?? ''
                })),
                lastPracticed: skill.lastPracticed ? new Date(skill.lastPracticed).toISOString() : null,
                goalLevel: skill.goalLevel !== null && skill.goalLevel !== undefined ? skill.goalLevel : null
            })),
            learningHours: {
                total: obj.learningHours?.total ?? 0,
                weekly: obj.learningHours?.weekly ?? 0,
                bySkill: (obj.learningHours?.bySkill || []).map(bs => ({
                    skillId: bs.skillId ?? '',
                    minutes: bs.minutes ?? 0
                })),
                lastUpdated: obj.learningHours?.lastUpdated
                    ? new Date(obj.learningHours.lastUpdated).toISOString()
                    : null
            }
        };

        return dto;
    }

    /**
     * Get empty skill DTO structure
     * @returns {Object} Empty skill DTO
     */
    getEmptySkillDTO() {
        return {
            skills: [],
            learningHours: {
                total: 0,
                weekly: 0,
                bySkill: [],
                lastUpdated: null
            }
        };
    }

    /**
     * Get skill document for a user
     * @param {string} userId - User ID
     * @returns {Promise<Object>} Skill document (or null)
     */
    async getSkillDoc(userId) {
        return await Skill.findOne({ userId });
    }

    /**
     * Get a specific skill by its ID
     * @param {string} userId - User ID
     * @param {string} skillId - Skill ID (as string)
     * @returns {Promise<Object>} Skill subdocument or null
     */
    async getSkillById(userId, skillId) {
        const skillDoc = await this.getSkillDoc(userId);
        if (!skillDoc) return null;
        const skill = skillDoc.skills.find(s => s._id.toString() === skillId);
        return skill || null;
    }

    /**
     * Add a new skill for a user
     * @param {string} userId - User ID
     * @param {Object} skillData - { name, category, proficiency, goalLevel? }
     * @returns {Promise<Object>} Updated skill DTO
     */
    async addSkill(userId, skillData) {
        const { name, category, proficiency, goalLevel } = skillData;
        const skillDoc = await Skill.findOneAndUpdate(
            { userId },
            {
                $push: {
                    skills: {
                        name,
                        category: category ?? '',
                        proficiency,
                        evidence: [],
                        lastPracticed: null,
                        goalLevel: goalLevel ?? null
                    }
                }
            },
            { new: true }
        );

        if (!skillDoc) {
            throw new Error('Skill document not found');
        }

        return this.getSkillSnapshot(userId);
    }

    /**
     * Update a skill's fields
     * @param {string} userId - User ID
     * @param {string} skillId - Skill ID
     * @param {Object} updateData - Fields to update (name, category, proficiency, goalLevel)
     * @returns {Promise<Object>} Updated skill DTO
     */
    async updateSkill(userId, skillId, updateData) {
        const skillDoc = await Skill.findOne({ userId });
        if (!skillDoc) {
            throw new Error('Skill document not found');
        }

        const skillIndex = skillDoc.skills.findIndex(s => s._id.toString() === skillId);
        if (skillIndex === -1) {
            throw new Error('Skill not found');
        }

        // Build update object
        const updateObj = {};
        if (updateData.name !== undefined) updateObj[`skills.${skillIndex}.name`] = updateData.name;
        if (updateData.category !== undefined) updateObj[`skills.${skillIndex}.category`] = updateData.category;
        if (updateData.proficiency !== undefined) updateObj[`skills.${skillIndex}.proficiency`] = updateData.proficiency;
        if (updateData.goalLevel !== undefined) {
            // Allow null to clear goalLevel
            updateObj[`skills.${skillIndex}.goalLevel`] = updateData.goalLevel === null ? null : Number(updateData.goalLevel);
        }

        if (Object.keys(updateObj).length === 0) {
            // Nothing to update
            return this.getSkillSnapshot(userId);
        }

        await Skill.updateOne(
            { userId },
            { $set: updateObj }
        );

        return this.getSkillSnapshot(userId);
    }

    /**
     * Remove a skill from a user
     * @param {string} userId - User ID
     * @param {string} skillId - Skill ID
     * @returns {Promise<Object>} Updated skill DTO
     */
    async removeSkill(userId, skillId) {
        const skillDoc = await Skill.findOne({ userId });
        if (!skillDoc) {
            throw new Error('Skill document not found');
        }

        // Remove skill from skills array and also remove its entries from learningHours.bySkill
        await Skill.updateOne(
            { userId },
            {
                $pull: {
                    skills: { _id: new ObjectId(skillId) },
                    'learningHours.bySkill': { skillId }
                }
            }
        );

        return this.getSkillSnapshot(userId);
    }

    /**
     * Add evidence to a skill
     * @param {string} userId - User ID
     * @param {string} skillId - Skill ID
     * @param {Object} evidenceData - { type, description, date, url? }
     * @returns {Promise<Object>} Updated skill DTO}
     */
    async addEvidence(userId, skillId, evidenceData) {
        const { type, description, date, url } = evidenceData;
        const skillDoc = await Skill.findOne({ userId });
        if (!skillDoc) {
            throw new Error('Skill document not found');
        }

        const skill = skillDoc.skills.find(s => s._id.toString() === skillId);
        if (!skill) {
            throw new Error('Skill not found');
        }

        skill.evidence.push({
            type,
            description,
            date: new Date(date),
            url: url ?? ''
        });

        await skillDoc.save();

        return this.getSkillSnapshot(userId);
    }

    /**
     * Remove evidence from a skill
     * @param {string} userId - User ID
     * @param {string} skillId - Skill ID
     * @param {string} evidenceId - Evidence ID (as string)
     * @returns {Promise<Object> DTO}
     */
    async removeEvidence(userId, skillId, evidenceId) {
        const skillDoc = await Skill.findOne({ userId });
        if (!skillDoc) {
            throw new Error('Skill document not found');
        }

        const skill = skillDoc.skills.find(s => s._id.toString() === skillId);
        if (!skill) {
            throw new Error('Skill not found');
        }

        // Find evidence index
        const evidenceIndex = skill.evidence.findIndex(ev => ev._id.toString() === evidenceId);
        if (evidenceIndex === -1) {
            throw new Error('Evidence not found');
        }

        skill.evidence.splice(evidenceIndex, 1);

        await skillDoc.save();

        return this.getSkillSnapshot(userId);
    }

    /**
     * Log practice time for a skill
     * @param {string} userId - User ID
     * @param {string} skillId - Skill ID
     * @param {number} minutes - Minutes to add (>=1)
     * @returns {Promise<Object>} Updated skill DTO with learningHours
     */
    async logPractice(userId, skillId, minutes) {
        if (typeof minutes !== 'number' || minutes < 1) {
            throw new Error('Minutes must be a positive number');
        }

        const skillDoc = await Skill.findOne({ userId });
        if (!skillDoc) {
            throw new Error('Skill document not found');
        }

        const skillIndex = skillDoc.skills.findIndex(s => s._id.toString() === skillId);
        if (skillIndex === -1) {
            throw new Error('Skill not found');
        }

        const now = new Date();

        // Update learningHours: increment total and weekly, set lastUpdated
        await Skill.updateOne(
            { userId },
            {
                $inc: {
                    'learningHours.total': minutes,
                    'learningHours.weekly': minutes
                },
                $set: {
                    'learningHours.lastUpdated': now
                }
            }
        );

        // Update bySkill array: find existing entry for skillId, increment; otherwise push new
        const skill = skillDoc.skills[skillIndex];
        const bySkill = [...(skillDoc.learningHours.bySkill || [])];
        const existingIdx = bySkill.findIndex(b => b.skillId === skillId);
        if (existingIdx >= 0) {
            bySkill[existingIdx].minutes += minutes;
        } else {
            bySkill.push({ skillId, minutes });
        }

        await Skill.updateOne(
            { userId },
            {
                $set: {
                    'learningHours.bySkill': bySkill
                }
            }
        );

        return this.getSkillSnapshot(userId);
    }

    /**
     * Set proficiency for a skill
     * @param {string} userId - User ID
     * @param {string} skillId - Skill ID
     * @param {number} proficiency - Value between 0 and 100
     * @returns {Promise<Object>} Updated skill DTO
     */
    async setProficiency(userId, skillId, proficiency) {
        if (typeof proficiency !== 'number' || proficiency < 0 || proficiency > 100) {
            throw new Error('Proficiency must be a number between 0 and 100');
        }

        const skillDoc = await Skill.findOne({ userId });
        if (!skillDoc) {
            throw new Error('Skill document not found');
        }

        const skillIndex = skillDoc.skills.findIndex(s => s._id.toString() === skillId);
        if (skillIndex === -1) {
            throw new Error('Skill not found');
        }

        await Skill.updateOne(
            { userId },
            { $set: { [`skills.${skillIndex}.proficiency`]: proficiency } }
        );

        return this.getSkillSnapshot(userId);
    }

    /**
     * Set goal level for a skill
     * @param {string} userId - User ID
     * @param {string} skillId - Skill ID
     * @param {number|null} goalLevel - Value between 0 and 100, or null to clear
     * @returns {Promise<Object>} Updated skill DTO
     */
    async setGoalLevel(userId, skillId, goalLevel) {
        if (goalLevel !== null && (typeof goalLevel !== 'number' || goalLevel < 0 || goalLevel > 100)) {
            throw new Error('Goal level must be a number between 0 and 100 or null');
        }

        const skillDoc = await Skill.findOne({ userId });
        if (!skillDoc) {
            throw new Error('Skill document not found');
        }

        const skillIndex = skillDoc.skills.findIndex(s => s._id.toString() === skillId);
        if (skillIndex === -1) {
            throw new Error('Skill not found');
        }

        await Skill.updateOne(
            { userId },
            { $set: { [`skills.${skillIndex}.goalLevel`]: goalLevel ?? null } }
        );

        return this.getSkillSnapshot(userId);
    }
}

module.exports = new SkillService();