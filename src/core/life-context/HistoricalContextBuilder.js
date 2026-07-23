// src/core/life-context/HistoricalContextBuilder.js
/**
 * HistoricalContextBuilder - builds a historical time-series context snapshot
 * by pulling sequential data from domain services.
 */
class HistoricalContextBuilder {
  /**
   * @param {Object} academicProgressService - Instance of AcademicProgressService
   * @param {Object} userService - Instance of UserService
   * @param {Object} financeService - Instance of FinanceService
   * @param {Object} skillService - Instance of SkillService
   * @param {Object} healthService - Instance of HealthService
   * @param {Object} careerService - Instance of CareerService
   * @param {Object} timeService - Instance of TimeService
   * @param {Object} emotionalStateService - Instance of EmotionalStateService
   */
  constructor(academicProgressService, userService, financeService, skillService, healthService, careerService, timeService, emotionalStateService) {
    this.academicProgressService = academicProgressService;
    this.userService = userService;
    this.financeService = financeService;
    this.skillService = skillService;
    this.healthService = healthService;
    this.careerService = careerService;
    this.timeService = timeService;
    this.emotionalStateService = emotionalStateService;
  }

  /**
   * Build a historical context for a user over a time range.
   * @param {string|Object} userIdOrQuery - Identifier or query object to fetch data.
   * @param {Object} [options] - Query options.
   * @param {string|Date} [options.startDate] - Inclusive start date (defaults to endDate for single point).
   * @param {string|Date} [options.endDate] - Inclusive end date (defaults to now).
   * @param {'raw'|'hourly'|'daily'|'weekly'} [options.interval] - Granularity of returned points.
   * @param {'latest'|'average'|'sum'|'min'|'max'} [options.aggregation] - How to collapse multiple points in a bucket.
   * @param {Array<string>} [options.fields] - Field list to limit payload (ignored in Phase 1).
   * @param {'skip'|'fillWithLast'|'fillWithNull'} [options.missingDataPolicy] - How to handle missing data.
   * @returns {Promise<Object>} Historical context with arrays per domain and metadata.
   */
  async buildHistorical(userIdOrQuery, options = {}) {
    // Resolve userId
    const userId = typeof userIdOrQuery === 'string' ? userIdOrQuery : (userIdOrQuery?.id ?? null);
    if (!userId) {
      throw new Error('User ID is required to build context');
    }

    // Normalise options
    const startDateOpt = options.startDate ? new Date(options.startDate) : undefined;
    const endDateOpt = options.endDate ? new Date(options.endDate) : new Date();
    let startDate = startDateOpt;
    let endDate = endDateOpt;
    if (!startDate) {
      // If only end provided, treat as single point
      startDate = new Date(endDate);
    }
    // Ensure start <= end
    if (startDate.getTime() > endDate.getTime()) {
      const temp = startDate;
      startDate = endDate;
      endDate = temp;
    }
    let interval = options.interval || 'raw';
    const allowedIntervals = ['raw', 'hourly', 'daily', 'weekly'];
    if (!allowedIntervals.includes(interval)) {
      console.warn(`Invalid interval '${interval}', defaulting to 'raw'`);
      interval = 'raw';
    }
    let aggregation = options.aggregation || 'latest';
    const allowedAggregations = ['latest', 'average', 'sum', 'min', 'max'];
    if (!allowedAggregations.includes(aggregation)) {
      console.warn(`Invalid aggregation '${aggregation}', defaulting to 'latest'`);
      aggregation = 'latest';
    }
    let missingDataPolicy = options.missingDataPolicy || 'fillWithLast';
    const allowedPolicies = ['skip', 'fillWithLast', 'fillWithNull'];
    if (!allowedPolicies.includes(missingDataPolicy)) {
      console.warn(`Invalid missingDataPolicy '${missingDataPolicy}', defaulting to 'fillWithLast'`);
      missingDataPolicy = 'fillWithLast';
    }
    // fields option ignored for Phase 1

    // Build time points array
    let timePoints;
    if (interval === 'raw') {
      timePoints = [new Date()]; // single point representing now
    } else {
      const stepMs = {
        hourly: 60 * 60 * 1000,
        daily: 24 * 60 * 60 * 1000,
        weekly: 7 * 24 * 60 * 60 * 1000
      }[interval];
      const startMs = startDate.getTime();
      const endMs = endDate.getTime();
      let current = new Date(startMs);
      timePoints = [];
      while (current.getTime() <= endMs) {
        timePoints.push(new Date(current.getTime()));
        current = new Date(current.getTime() + stepMs);
      }
      // If the range resulted in zero points (should not happen), ensure at least one
      if (timePoints.length === 0) {
        timePoints = [new Date(startDate)];
      }
    }
    const pointCount = timePoints.length;

    // Prepare result containers
    const result = {
      user: [],
      goals: [],
      academics: [],
      finance: [],
      skills: [],
      health: [],
      career: [],
      time: [],
      emotional_state: []
    };
    // Track last successful value per domain for fillWithLast
    const lastValues = {};

    // Domain descriptors
    const domains = [
      {
        key: 'user',
        service: this.userService,
        snapshotMethod: 'getUserById',
        historyMethod: 'getUserHistory',
        // Transform user document to DTO matching ContextAggregator's userDto
        dtoTransformer: (doc) => {
          if (!doc) return null;
          return {
            id: doc._id.toString(),
            username: doc.username,
            email: doc.email.toLowerCase(),
            role: doc.role,
            createdAt: doc.createdAt.toISOString(),
            profile: {
              firstName: doc.firstName ?? '',
              lastName: doc.lastName ?? '',
              bio: doc.bio ?? '',
              avatarUrl: doc.avatarUrl ?? '',
              institution: doc.institution ?? '',
              major: doc.major ?? '',
              graduationYear: doc.graduationYear ?? null
            },
            preferences: {
              theme: doc.preferences?.theme ?? 'system',
              notifications: {
                email: !!doc.preferences?.notifications?.email,
                push: !!doc.preferences?.notifications?.push
              },
              language: doc.preferences?.language ?? 'en'
            }
          };
        }
      },
      {
        key: 'goals',
        service: this.academicProgressService,
        snapshotMethod: 'getAcademicSnapshot',
        historyMethod: 'getAcademicHistory',
        dtoTransformer: (snapshot) => {
          if (!snapshot) return [];
          return snapshot.goals ?? [];
        }
      },
      {
        key: 'academics',
        service: this.academicProgressService,
        snapshotMethod: 'getAcademicSnapshot',
        historyMethod: 'getAcademicHistory',
        dtoTransformer: (snapshot) => snapshot
      },
      {
        key: 'finance',
        service: this.financeService,
        snapshotMethod: 'getFinanceSnapshot',
        historyMethod: 'getFinanceHistory',
        dtoTransformer: (snapshot) => snapshot
      },
      {
        key: 'skills',
        service: this.skillService,
        snapshotMethod: 'getSkillSnapshot',
        historyMethod: 'getSkillHistory',
        dtoTransformer: (snapshot) => snapshot
      },
      {
        key: 'health',
        service: this.healthService,
        snapshotMethod: 'getHealthSnapshot',
        historyMethod: 'getHealthHistory',
        dtoTransformer: (snapshot) => snapshot
      },
      {
        key: 'career',
        service: this.careerService,
        snapshotMethod: 'getCareerSnapshot',
        historyMethod: 'getCareerHistory',
        dtoTransformer: (snapshot) => snapshot
      },
      {
        key: 'time',
        service: this.timeService,
        snapshotMethod: 'getTimeSnapshot',
        historyMethod: 'getTimeHistory',
        dtoTransformer: (snapshot) => snapshot
      },
      {
        key: 'emotional_state',
        service: this.emotionalStateService,
        snapshotMethod: 'getEmotionalStateSnapshot',
        historyMethod: 'getEmotionalStateHistory',
        dtoTransformer: (snapshot) => snapshot
      }
    ];

    // Process each domain
    for (const domain of domains) {
      let domainResult = null; // null indicates skip or error
      try {
        const historyFn = domain.service[domain.historyMethod];
        if (typeof historyFn === 'function') {
          // Attempt history call
          const raw = await historyFn.call(domain.service, userId, {
            startDate,
            endDate,
            interval,
            aggregation
          });
          // Expect array of DTOs aligned with timePoints
          if (Array.isArray(raw) && raw.length === pointCount) {
            // Deep-ish clone to avoid sharing references
            domainResult = raw.map(item => ({ ...item }));
          } else {
            // If history method returned unexpected data, fall back to snapshot
            throw new Error('History method returned invalid data');
          }
        } else {
          throw new Error('History method not implemented');
        }
      } catch (histErr) {
        // Fallback to snapshot
        let snapshot = null;
        try {
          const snapFn = domain.service[domain.snapshotMethod];
          snapshot = await snapFn.call(domain.service, userId);
        } catch (snapErr) {
          snapshot = null;
        }

        if (snapshot === null) {
          // No snapshot either
          if (missingDataPolicy === 'skip') {
            domainResult = undefined; // marker to omit
          } else if (missingDataPolicy === 'fillWithLast') {
            // Use last known value if any, else null
            domainResult = Array(pointCount).fill(lastValues[domain.key] ?? null);
          } else { // fillWithNull
            domainResult = Array(pointCount).fill(null);
          }
        } else {
          const dto = domain.dtoTransformer(snapshot);
          const copy = () => ({ ...dto });
          if (missingDataPolicy === 'skip') {
            domainResult = undefined;
          } else if (missingDataPolicy === 'fillWithLast') {
            // Store as last value for potential future fill
            lastValues[domain.key] = dto;
            domainResult = timePoints.map(() => copy());
          } else { // fillWithNull
            domainResult = Array(pointCount).fill(null);
          }
        }
      }

      // If domainResult is undefined (skip), we omit the key
      if (domainResult === undefined) {
        continue;
      }
      // Ensure we have an array; if somehow not, create empty array
      if (!Array.isArray(domainResult)) {
        domainResult = [];
      }
      result[domain.key] = domainResult;
    }

    // Build metadata
    const metadata = {
      generatedAt: new Date().toISOString(),
      interval,
      range: {
        start: startDate.toISOString(),
        end: endDate.toISOString()
      },
      pointCount
    };

    return {
      ...result,
      metadata
    };
  }
}

module.exports = HistoricalContextBuilder;