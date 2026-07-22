// src/core/life-context/ContextAggregator.js
const AcademicProgressService = require('../../services/AcademicProgressService');
const UserService = require('../../services/UserService');
const FinanceService = require('../../services/financeService');
const SkillService = require('../../services/skillService');
const HealthService = require('../../services/HealthService');
const CareerService = require('../../services/CareerService');

/**
 * ContextAggregator - builds a holistic view of the user's life by pulling data from domain services.
 */
class ContextAggregator {
  /**
   * Build a unified context snapshot for the given user.
   * @param {string|Object} userIdOrQuery - Identifier or query object to fetch data.
   * @returns {Promise<Object>} Normalized context snapshot.
   */
  async build(userIdOrQuery) {
    // Resolve userId
    const userId = typeof userIdOrQuery === 'string' ? userIdOrQuery : (userIdOrQuery?.id ?? null);
    if (!userId) throw new Error('User ID is required to build context');

    // Fetch from services (allow missing academic record)
    let academicDto, userDoc;
    try {
      academicDto = await AcademicProgressService.getAcademicSnapshot(userId);
    } catch (error) {
      // If there's an error fetching academic data, return empty academic DTO
      academicDto = AcademicProgressService.getEmptyAcademicDTO();
    }
    try {
      userDoc = await UserService.getUserById(userId);
    } catch (e) {
      throw e; // user must exist
    }

    // Safe getter helper
    const get = (obj, path, def) => {
      const parts = Array.isArray(path) ? path : path.split('.');
      let cur = obj;
      for (const p of parts) {
        if (cur == null || !(Object.hasOwnProperty.call(cur, p))) return def;
        cur = cur[p];
      }
      return cur === undefined ? def : cur;
    };

    // ----- User DTO -----
    const userDto = {
      id: userDoc._id.toString(),
      username: userDoc.username,
      email: userDoc.email.toLowerCase(),
      role: userDoc.role,
      createdAt: userDoc.createdAt.toISOString(),
      profile: {
        firstName: userDoc.firstName ?? '',
        lastName: userDoc.lastName ?? '',
        bio: userDoc.bio ?? '',
        avatarUrl: userDoc.avatarUrl ?? '',
        institution: userDoc.institution ?? '',
        major: userDoc.major ?? '',
        graduationYear: userDoc.graduationYear ?? null
      },
      preferences: {
        theme: userDoc.preferences?.theme ?? 'system',
        notifications: {
          email: !!userDoc.preferences?.notifications?.email,
          push: !!userDoc.preferences?.notifications?.push
        },
        language: userDoc.preferences?.language ?? 'en'
      }
    };

    // ----- Goals DTO (from academic goals or empty) -----
    const goalsDto = (academicDto.goals ?? []).map(g => ({
      id: g._id?.toString() ?? '',
      title: g.title ?? '',
      description: g.description ?? '',
      type: g.type ?? 'Other',
      targetValue: g.targetValue ?? null,
      startDate: g.startDate ? new Date(g.startDate).toISOString() : null,
      targetDate: g.targetDate ? new Date(g.targetDate).toISOString() : null,
      status: g.status ?? 'NotStarted',
      priority: g.priority ?? 'Medium',
      completed: !!g.completed,
      createdAt: g.createdAt ? new Date(g.createdAt).toISOString() : null,
      updatedAt: g.updatedAt ? new Date(g.updatedAt).toISOString() : null
    }));

    // ----- Academics DTO -----
    const academicsDto = academicDto;

    // ----- Finance DTO (from FinanceService) -----
    const financeDto = await FinanceService.getFinanceSnapshot(userId);

    // ----- Skill DTO (from SkillService) -----
    let skillDto;
    try {
      skillDto = await SkillService.getSkillSnapshot(userId);
    } catch (error) {
      // If there's an error fetching skill data, return empty skill DTO
      skillDto = SkillService.getEmptySkillDTO();
    }

    // ----- Health DTO (from HealthService) -----
    let healthDto;
    try {
      healthDto = await HealthService.getHealthSnapshot(userId);
    } catch (error) {
      // If there's an error fetching health data, return empty health DTO
      healthDto = {
        vitals: {},
        activity: { steps: 0, activeMinutes: 0, workouts: [] },
        sleep: { hoursPerNight: 0, quality: null, consistency: 0 },
        nutrition: { mealsPerDay: 0, caloriesPerDay: 0, waterIntakeLiters: null },
        goals: []
      };
    }

    // ----- Career DTO (from CareerService) -----
    let careerDto;
    try {
      careerDto = await CareerService.getCareerSnapshot(userId);
    } catch (error) {
      // If there's an error fetching career data, return empty career DTO
      careerDto = {
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

    const timeDto = {
      calendar: [],
      timeZones: { home: null, work: null },
      availability: { slots: [] }
    };

    const emotionalStateDto = {
      timestamp: new Date().toISOString(),
      mood: { value: 0, label: 'neutral' },
      stress: 0,
      energy: 0,
      focus: 0,
      notes: '',
      tags: []
    };

    const metadata = {
      generatedAt: new Date().toISOString(),
      version: '1.0.0'
    };

    return {
      user: userDto,
      goals: goalsDto,
      academics: academicsDto,
      finance: financeDto,
      skills: skillDto,
      health: healthDto,
      career: careerDto,
      time: timeDto,
      emotional_state: emotionalStateDto,
      metadata
    };
  }
}

module.exports = ContextAggregator;