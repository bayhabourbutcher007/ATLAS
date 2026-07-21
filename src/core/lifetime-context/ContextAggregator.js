// src/core/life-context/ContextAggregator.js
const AcademicProgressService = require('../../services/AcademicProgressService');
const UserService = require('../../services/UserService');

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
    // Expect a userId string; if object, we try to get .id
    const userId = typeof userIdOrQuery === 'string' ? userIdOrQuery : (userIdOrQuery?.id || null);
    if (!userId) {
      throw new Error('User ID is required to build context');
    }

    // Fetch data from domain services
    let academicDoc, userDoc;
    try {
      academicDoc = await AcademicProgressService.getAcademicProgress(userId);
    } catch (e) {
      // If no academic record exists yet, treat as null; we'll provide empty/default structures.
      academicDoc = null;
    }
    try {
      userDoc = await UserService.getUserById(userId);
    } catch (e) {
      // If user doesn't exist, we cannot proceed.
      throw e;
    }

    // Helper to safely get nested properties
    const get = (obj, path, def) => {
      const parts = Array.isArray(path) ? path : path.split('.');
      let cur = obj;
      for (const p of parts) {
        if (cur == null || !(Object.hasOwnProperty.call(cur, p))) return def;
        cur = cur[p];
      }
      return cur === undefined ? def : cur;
    };

    // Build user DTO
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

    // Goals: we don't have a dedicated goal model yet; we can pull from academic progress goals or leave empty.
    const goalsDto = (academicDoc?.goals ?? []).map(g => ({
      id: g._id?.toString() || '',
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

    // Academics DTO
    const academicsDto = academicDoc
      ? {
          currentTerm: {
            term: academicDoc.academicTerm?.term ?? 'Summer',
            year: academicDoc.academicTerm?.year ?? 2026
          },
          gpa: {
            semester: academicDoc.gpa?.semester ?? null,
            cumulative: academicDoc.gpa?.cumulative ?? null
          },
          credits: {
            completed: academicDoc.credits?.completed ?? 0,
            inProgress: academicDoc.credits?.inProgress ?? 0,
            planned: academicDoc.credits?.planned ?? 0
          },
          courses: (academicDoc.courses ?? []).map(c => ({
            id: c._id?.toString() ?? '',
            courseId: c.courseId ?? '',
            courseName: c.courseName ?? '',
            courseCode: c.courseCode ?? '',
            credits: c.credits ?? null,
            instructor: c.instructor ?? '',
            term: c.term ?? null,
            year: c.year ?? null,
            grade: c.grade ?? null,
            gradePoints: c.gradePoints ?? null,
            status: c.status ?? 'Enrolled',
            materials: (c.materials ?? []).map(m => ({
              name: m.name ?? '',
              type: m.type ?? null,
              url: m.url ?? ''
            })),
            schedule: (c.schedule ?? []).map(s => ({
              dayOfWeek: s.dayOfWeek ?? null,
              startTime: s.startTime ?? null,
              endTime: s.endTime ?? null,
              location: s.location ?? ''
            })),
            customFields: (c.customFields ?? []).map(f => ({
              name: f.name ?? '',
              value: f.value,
              type: f.type ?? 'text'
            }))
          })),
          studyHours: {
            total: academicDoc.studyHours?.total ?? 0,
            weekly: academicDoc.studyHours?.weekly ?? 0,
            monthly: academicDoc.studyHours?.monthly ?? 0,
            byCourse: (academicDoc.studyHours?.byCourse ?? []).map(bc => ({
              courseId: bc.courseId ?? '',
              minutes: bc.minutes ?? 0
            })),
            lastUpdated: academicDoc.studyHours?.lastUpdated
              ? new Date(academicDoc.studyHours.lastUpdated).toISOString()
              : null
          },
          goals: goalsDto, // reuse same goal mapping for academic-related goals
          achievements: (academicDoc.achievements ?? []).map(a => ({
            id: a._id?.toString() ?? '',
            title: a.title ?? '',
            description: a.description ?? '',
            date: a.date ? new Date(a.date).toISOString() : null,
            issuer: a.issuer ?? '',
            certificateUrl: a.certificateUrl ?? '',
            category: a.category ?? 'Other'
          }))
        }
      : {
          // Default empty structure if no academic record
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

    // For domains we don't have yet, provide empty/default structures
    const financeDto = {
      overview: {
        income: { monthly: 0, annual: 0, sources: [] },
        expenses: {
          monthly: 0,
          annual: 0,
          categories: {
            housing: 0,
            food: 0,
            transport: 0,
            utilities: 0,
            education: 0,
            entertainment: 0,
            health: 0,
            misc: 0
          }
        },
        netWorth: 0,
        savingsRate: 0,
        emergencyFundMonths: 0
      },
      accounts: [],
      debts: [],
      budgets: [],
      goals: []
    };

    const skillDto = {
      skills: [],
      learningHours: { total: 0, weekly: 0, bySkill: [], lastUpdated: null }
    };

    const healthDto = {
      vitals: {},
      activity: { steps: 0, activeMinutes: 0, workouts: [] },
      sleep: { hoursPerNight: 0, quality: null, consistency: 0 },
      nutrition: { mealsPerDay: 0, caloriesPerDay: 0, waterIntakeLiters: null },
      goals: []
    };

    const careerDto = {
      currentPosition: null,
      experience: [],
      education: [],
      certifications: [],
      goals: []
    };

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
      goals: goalsDto, // top-level goals (could also be from user but we don't have)
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