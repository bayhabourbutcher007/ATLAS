// src/core/analytics/AnalyticsProcessor.js
/**
 * AnalyticsProcessor - Interface for computing metrics and aggregates.
 */

const TrendAnalyzer = require('./TrendAnalyzer');

class AnalyticsProcessor {
  /**
   * Process a context snapshot and return calculated metrics.
   * @param {Object} context - Normalized data from ContextAggregator.
   * @param {Object} [options] - Optional flags for historical analysis.
   * @param {boolean} [options.history=false] - If true, fetch and analyse trends.
   * @param {Object} [options.range] - { startDate, endDate, interval } passed to HistoricalContextBuilder.
   * @returns {Object} Key-value map of derived metrics, plus a `trends` sub-object when history is true.
   */
  process(context, options = {}) {
    // Compute base (point-in-time) metrics
    const analytics = this._computeBaseMetrics(context);

    // If history requested, compute trend metrics
    if (options.history === true) {
      const userId = context.user && context.user.id ? context.user.id : null;
      if (userId) {
        const range = options.range || undefined; // undefined will trigger default range in _computeTrendMetrics
        const trends = this._computeTrendMetrics(userId, range);
        if (trends && Object.keys(trends).length > 0) {
          return { ...analytics, trends };
        }
      }
      // If we couldn't compute trends (no userId or error), just return base analytics
    }

    return analytics;
  }

  /**
   * Compute base metrics from a context snapshot (equivalent to the original process method).
   * @param {Object} context - Normalized data from ContextAggregator.
   * @returns {Object} Key-value map of derived metrics.
   * @private
   */
  _computeBaseMetrics(context) {
    const analytics = {};

    // Sleep metrics
    if (context.health && context.health.sleep && context.health.sleep.hoursPerNight !== null && context.health.sleep.hoursPerNight !== undefined) {
      analytics.sleepHours = context.health.sleep.hoursPerNight;
    }

    // Stress metrics
    if (context.emotional_state && context.emotional_state.stress !== null && context.emotional_state.stress !== undefined) {
      analytics.stressLevel = context.emotional_state.stress;
    }

    // Savings rate
    if (context.finance && context.finance.overview && context.finance.overview.savingsRate !== null && context.finance.overview.savingsRate !== undefined) {
      analytics.savingsRate = context.finance.overview.savingsRate;
    }

    // GPA (priority to cumulative, then semester)
    if (context.academics && context.academics.gpa) {
      if (context.academics.gpa.cumulative !== null && context.academics.gpa.cumulative !== undefined) {
        analytics.gpa = context.academics.gpa.cumulative;
      } else if (context.academics.gpa.semester !== null && context.academics.gpa.semester !== undefined) {
        analytics.gpa = context.academics.gpa.semester;
      }
    }

    // Weekly study hours
    if (context.academics && context.academics.studyHours && context.academics.studyHours.weekly !== null && context.academics.studyHours.weekly !== undefined) {
      analytics.weeklyStudyHours = context.academics.studyHours.weekly;
    }

    // Monthly income
    if (context.finance && context.finance.overview && context.finance.overview.income && context.finance.overview.income.monthly !== null && context.finance.overview.income.monthly !== undefined) {
      analytics.monthlyIncome = context.finance.overview.income.monthly;
    }

    // Monthly expenses
    if (context.finance && context.finance.overview && context.finance.overview.expenses && context.finance.overview.expenses.monthly !== null && context.finance.overview.expenses.monthly !== undefined) {
      analytics.monthlyExpenses = context.finance.overview.expenses.monthly;
    }

    // Net worth
    if (context.finance && context.finance.overview && context.finance.overview.netWorth !== null && context.finance.overview.netWorth !== undefined) {
      analytics.netWorth = context.finance.overview.netWorth;
    }

    // Sleep to stress ratio (avoiding division by zero)
    if (analytics.sleepHours !== undefined && analytics.stressLevel !== undefined) {
      // Add 1 to stress to avoid division by zero, and scale stress to 0-10 range for better ratio
      const stressFactor = Math.max(0, (100 - analytics.stressLevel) / 10); // Invert stress so higher is better
      analytics.sleepStressRatio = analytics.sleepHours * (stressFactor / 10); // Normalized score
    }

    // Goal progress calculations
    if (context.goals && Array.isArray(context.goals)) {
      const goalProgress = [];
      const now = new Date();

      context.goals.forEach(goal => {
        if (goal.targetValue !== null && goal.targetValue !== undefined &&
            goal.currentValue !== null && goal.currentValue !== undefined &&
            goal.targetValue > 0) {

          const progress = Math.min(1, Math.max(0, goal.currentValue / goal.targetValue));
          goalProgress.push({
            id: goal.id,
            title: goal.title,
            progress: progress,
            percentage: progress * 100
          });
        }
      });

      if (goalProgress.length > 0) {
        analytics.goalProgress = goalProgress;
      }
    }

    // Calculate days until target dates for goals
    if (context.goals && Array.isArray(context.goals)) {
      const goalsWithDates = [];

      context.goals.forEach(goal => {
        if (goal.targetDate) {
          const targetDate = new Date(goal.targetDate);
          const timeDiff = targetDate - now;
          const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

          goalsWithDates.push({
            id: goal.id,
            title: goal.title,
            daysUntilTarget: daysDiff > 0 ? daysDiff : 0, // Don't show negative days
            isOverdue: daysDiff < 0
          });
        }
      });

      if (goalsWithDates.length > 0) {
        analytics.goalDates = goalsWithDates;
      }
    }

    return analytics;
  }

  }

  /**
   * Get the metric definitions used for trend and correlation analysis.
   * @returns {Array} Array of metric definition objects.
   * @private
   * @static
   */
  static _getMetricDefinitions() {
    return [
      { name: 'sleepHours', path: [sleep', 'hoursPerNight'], arrayKey: 'health' },
      { name: 'stressLevel', path: [stress'], arrayKey: 'emotional_state' },
      { name: 'savingsRate', path: [overview', 'savingsRate'], arrayKey: 'finance' },
      { name: 'gpa', path: null, arrayKey: 'academics', customExtractor: (acad) => {
          if (!acad || !acad.gpa) return undefined;
          if (acad.gpa.cumulative !== null && acad.gpa.cumulative !== undefined) {
            return acad.gpa.cumulative;
          }
          if (acad.gpa.semester !== null && acad.gpa.semester !== undefined) {
            return acad.gpa.semester;
          }
          return undefined;
        } },
      { name: 'weeklyStudyHours', path: [studyHours', 'weekly'], arrayKey: 'academics' },
      { name: 'monthlyIncome', path: [overview', 'income', 'monthly'], arrayKey: 'finance' },
      { name: 'monthlyExpenses', path: [overview', 'expenses', 'monthly'], arrayKey: 'finance' },
      { name: 'netWorth', path: [overview', 'netWorth'], arrayKey: 'finance' }
    ];
  }

  /**
   * Compute trend metrics for a user over a historical range.
   * @param {string|ObjectId} userId - The user's ID.
   * @param {Object} [range] - Optional range override { startDate, endDate, interval }.
   * @returns {Object|null} An object with trend data for each metric, or null if computation failed.
   * @private
   */
  _computeTrendMetrics(userId, range) {
    try {
      // Import dependencies locally to avoid affecting existing singleton usage
      const HistoricalContextBuilder = require('../life-context/HistoricalContextBuilder');
      const UserService = require('../services/UserService');
      const AcademicProgressService = require('../services/AcademicProgressService');
      const FinanceService = require('../services/FinanceService');
      const SkillService = require('../services/SkillService');
      const HealthService = require('../services/HealthService');
      const CareerService = require('../services/CareerService');
      const TimeService = require('../services/TimeService');
      const EmotionalStateService = require('../services/EmotionalStateService');

      // Create the builder with the same service instances used elsewhere
      const builder = new HistoricalContextBuilder(
        new AcademicProgressService(),
        new UserService(),
        new FinanceService(),
        new SkillService(),
        new HealthService(),
        new CareerService(),
        new TimeService(),
        new EmotionalStateService()
      );

      // Set default options for historical query: last 30 days, daily intervals
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30); // 30 days ago

      const builderOptions = {
        startDate: range && range.startDate ? new Date(range.startDate) : startDate,
        endDate: range && range.endDate ? new Date(range.endDate) : endDate,
        interval: range && range.interval ? range.interval : 'daily',
        aggregation: 'latest', // we want the latest sample in each bucket
        missingDataPolicy: 'fillWithLast' // fill missing points with the last known value
      };

      // Build historical context
      const historicalContext = builder.buildHistorical(userId, builderOptions);

      // Helper to safely extract a numeric value from a nested object path
      const getValue = (obj, path) => {
        if (!obj) return undefined;
        const parts = Array.isArray(path) ? path : path.split('.');
        let current = obj;
        for (const part of parts) {
          if (current === null || current === undefined || !(Object.hasOwnProperty.call(current, part))) {
            return undefined;
          }
          current = current[part];
        }
        return typeof current === 'number' && !isNaN(current) ? current : undefined;
      };

      // Get metric definitions
      const metricDefinitions = AnalyticsProcessor._getMetricDefinitions();
        { name: 'weeklyStudyHours', path: ['studyHours', 'weekly'], arrayKey: 'academics' },
        { name: 'monthlyIncome', path: ['overview', 'income', 'monthly'], arrayKey: 'finance' },
        { name: 'monthlyExpenses', path: ['overview', 'expenses', 'monthly'], arrayKey: 'finance' },
        { name: 'netWorth', path: ['overview', 'netWorth'], arrayKey: 'finance' }
      ];

      const trends = {};

      // For each metric, extract the time series and compute trend
      for (const def of metricDefinitions) {
        const array = historicalContext[def.arrayKey];
        if (!Array.isArray(array) || array.length === 0) {
          continue; // skip if no data for this array
        }

        const values = array.map(item => {
          if (def.customExtractor) {
            return def.customExtractor(item);
          }
          return getValue(item, def.path);
        }).filter(val => val !== undefined); // remove undefined values

        // We need at least 2 points to compute a trend
        if (values.length < 2) {
          continue;
        }

        const regression = TrendAnalyzer.linearRegression(values);
        const percentChange = TrendAnalyzer.percentChange(values);
        const direction = TrendAnalyzer.direction(regression.slope);
        const average = values.reduce((sum, val) => sum + val, 0) / values.length;

        trends[def.name] = {
          slope: regression.slope,
          intercept: regression.intercept,
          percentChange: percentChange,
          direction: direction,
          // Optionally, we could add the raw series for debugging, but not necessary
          dataPoints: values.length
        };
      }

      // Compute correlations between metrics
      const correlations = CorrelationAnalyzer.analyze(historicalContext, metricDefinitions);

      // Return both trends and correlations
      const result = {};
      if (Object.keys(trends).length > 0) {
        result.trends = trends;
      }
      if (Object.keys(correlations).length > 0) {
        result.correlations = correlations;
      }

      return Object.keys(result).length > 0 ? result : null;
    } catch (error) {
      // Log error but don't break the flow
      console.error('Error computing trend metrics:', error);
      return null;
    }
  }
}

module.exports = AnalyticsProcessor;