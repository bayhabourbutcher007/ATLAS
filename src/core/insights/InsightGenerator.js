const TrendAnalyzer = require('../analytics/TrendAnalyzer');
const InsightScorer = require('./InsightScorer');
// src/core/insights/InsightGenerator.js
/**
 * InsightGenerator - Interface for generating insights from multi‑module data.
 */

class InsightGenerator {
  /**
   * Create an InsightGenerator instance.
   */
  constructor() {
    this.scorer = new InsightScorer();
  }

  /**
   * Generate insights based on a consolidated data snapshot.
   * @param {Object} context - Normalized data from all relevant modules.
   * @param {Object} [_analytics] – output from AnalyticsProcessor.process(context).
   * @returns {Array<Object>} Array of scored insight objects.
   */
  generate(context, _analytics) {
    const insights = [];

    insights.push(...this._generateLowSleepHighStressInsight(context, _analytics));
    insights.push(...this._generateLowSavingsRateInsight(context, _analytics));
    insights.push(...this._generateLowAcademicPerformanceInsight(context, _analytics));
    insights.push(...this._generateHighExpenseRatioInsight(context, _analytics));
    insights.push(...this._generateGoalStagnationInsights(context, _analytics));
    insights.push(...this._generateTrendInsights(_analytics));

    // Score each insight to add metadata and priority scores
    return insights.map(insight => this.scorer.score(insight));
  }

  /**
   ** Generate low sleep and high stress insight.
   * @param {Object} context - Normalized data from all relevant modules.
   * @param {Object} [_analytics] – output from AnalyticsProcessor.process(context).
   * @returns {Array<Object>}
   */
  _generateLowSleepHighStressInsight(context, _analytics) {
    const insights = [];

    // Low Sleep & High Stress
    if (context.health.sleep?.hoursPerNight !== undefined &&
        context.emotional_state?.stress !== undefined &&
        context.health.sleep.hoursPerNight < 6 &&
        context.emotional_state.stress > 80) {
      const daysLeft = context.goals && context.goals.find(g => g.title.toLowerCase().includes('exam'))?.targetDate
        ? Math.ceil((new Date(context.goals.find(g => g.title.toLowerCase().includes('exam')).targetDate) - new Date()) / (1000 * 60 * 60 * 24))
        : null;

      insights.push({
        id: this.generateId(),
        type: 'insight',
        title: 'Low sleep, high stress',
        description: `You are sleeping only ${context.health.sleep.hoursPerNight}h/night and experiencing high stress (${context.emotional_state.stress})${context.goals && context.goals.find(g => g.title.toLowerCase().includes('exam')) ? `, with an exam in ${daysLeft} day(s)` : ''}. This combination may impair performance.`,
        confidence: 0.85,
        sourceModules: ['health', 'emotional_state'],
        basedOnMetrics: ['health.sleep.hoursPerNight', 'emotional_state.stress'],
        suggestedActions: [
          { type: 'adjust', payload: { domain: 'health', field: 'sleep.hoursPerNight', target: 7 } },
          { type: 'review', payload: { domain: 'emotional_state', action: 'stress_management' } }
        ]
      });
    }

    return insights;
  }

  /**
   * Generate low savings rate insight.
   * @param {Object} context - Normalized data from all relevant modules.
   * @param {Object} [_analytics] – output from AnalyticsProcessor.process(context).
   * @returns {Array<Object>}
   */
  _generateLowSavingsRateInsight(context, _analytics) {
    const insights = [];

    // Low savings rate
    if (context.finance.overview?.savingsRate !== undefined &&
        context.finance.overview.savingsRate < 0.1) {
      insights.push({
        id: this.generateId(),
        type: 'insight',
        title: 'Low savings rate',
        description: `You are saving only ${(context.finance.overview.savingsRate * 100).toFixed(0)}% of your income, which is below the recommended 10%.`,
        confidence: 0.9,
        sourceModules: ['finance'],
        basedOnMetrics: ['finance.overview.savingsRate'],
        suggestedActions: [
          { type: 'review', payload: { domain: 'finance', action: 'budget' } },
          { type: 'schedule', payload: { activity: 'financial_review', duration: 30 } }
        ]
      });
    }

    return insights;
  }

  /**
   * Generate low academic performance insight.
   * @param {Object} context - Normalized data from all relevant modules.
   * @param {Object} [_analytics] – output from AnalyticsProcessor.process(context).
   * @returns {Array<Object>}
   */
  _generateLowAcademicPerformanceInsight(context, _analytics) {
    const insights = [];

    // Low GPA & Low Study Hours
    if (context.academics.gpa?.cumulative !== undefined &&
        context.academics.studyHours?.weekly !== undefined &&
        context.academics.gpa.cumulative < 3.0 &&
        context.academics.studyHours.weekly < 5) {
      insights.push({
        id: this.generateId(),
        type: 'insight',
        title: 'Low academic performance',
        description: `Your GPA is ${context.academics.gpa.cumulative.toFixed(1)} and you study only ${context.academics.studyHours.weekly} hours/week, which may affect your academic progress.`,
        confidence: 0.8,
        sourceModules: ['academics'],
        basedOnMetrics: ['academics.gpa.cumulative', 'academics.studyHours.weekly'],
        suggestedActions: [
          { type: 'schedule', payload: { activity: 'study', duration: 45 } },
          { type: 'review', payload: { domain: 'academics', action: 'study_techniques' } }
        ]
      });
    }

    return insights;
  }

  /**
   * Generate high expense ratio insight.
   * @param {Object} context - Normalized data from all relevant modules.
   * @param {Object} [_analytics] – output from AnalyticsProcessor.process(context).
   * @returns {Array<Object>}
   */
  _generateHighExpenseRatioInsight(context, _analytics) {
    const insights = [];

    // High Expense Ratio
    if (context.finance.overview?.expenses?.monthly !== undefined &&
        context.finance.overview?.income?.monthly !== undefined &&
        context.finance.overview.expenses.monthly > 0 &&
        context.finance.overview.income.monthly > 0 &&
        context.finance.overview.expenses.monthly > 0.8 * context.finance.overview.income.monthly) {
      const expenseRatio = (context.finance.overview.expenses.monthly / context.finance.overview.income.monthly * 100).toFixed(0);
      insights.push({
        id: this.generateId(),
        type: 'insight',
        title: 'High expense ratio',
        description: `Your expenses (${context.finance.overview.expenses.monthly}) represent ${expenseRatio}% of your income (${context.finance.overview.income.monthly}), which is above the recommended 80%.`,
        confidence: 0.88,
        sourceModules: ['finance'],
        basedOnMetrics: ['finance.overview.expenses.monthly', 'finance.overview.income.monthly'],
        suggestedActions: [
          { type: 'review', payload: { domain: 'finance', action: 'expenses' } },
          { type: 'adjust', payload: { domain: 'finance', field: 'expenses.category.misc', target: 0 } }
        ]
      });
    }

    return insights;
  }

  /**
   * Generate goal stagnation insights.
   * @param {Object} context - Normalized data from all relevant modules.
   * @param {Object} [_analytics] – output from AnalyticsProcessor.process(context).
   * @returns {Array<Object>}
   */
  _generateGoalStagnationInsights(context, _analytics) {
    const insights = [];

    // Goal Stagnation
    if (context.goals && Array.isArray(context.goals)) {
      const now = new Date();
      context.goals.forEach(goal => {
        if (goal.status === 'InProgress' &&
            goal.targetValue !== null &&
            goal.currentValue !== null &&
            goal.targetValue > 0) {

          const progress = Math.min(1, Math.max(0, goal.currentValue / goal.targetValue));
          const startedDate = goal.startDate ? new Date(goal.startDate) : null;
          const daysSinceStart = startedDate ? Math.ceil((now - startedDate) / (1000 * 60 * 60 * 24)) : 0;

          if (progress < 0.1 && daysSinceStart > 30) {
            insights.push({
              id: this.generateId(),
              type: 'insight',
              title: `Goal lacks progress: ${goal.title}`,
              description: `Your goal "${goal.title}" has only made ${(progress * 100).toFixed(0)}% progress in ${daysSinceStart} days. Consider reviewing your approach.`,
              confidence: 0.75,
              sourceModules: ['goals'],
              basedOnMetrics: ['goals.targetValue', 'goals.currentValue', 'goals.startDate'],
              suggestedActions: [
                { type: 'review', payload: { domain: 'goals', action: 'review_goal' } },
                { type: 'adjust', payload: { domain: 'goals', goalId: goal.id || '', action: 'adjust_target' } }
              ]
            });
          }
        }
      });
    }

    return insights;
  }

  // Helper: capitalize first letter
  _capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // Helper: format metric name to readable string
  _formatMetricName(metric) {
    return this._capitalize(metric)
      .replace(/Hours$/, 'hours')
      .replace(/Level$/, 'level')
      .replace(/Rate$/, 'rate')
      .replace(/Study/, 'study');
  }

  // Helper: map a metric name to its source module.
  _metricToModule(metric) {
    const map = {
      sleepHours: 'health',
      stressLevel: 'emotionalState',
      savingsRate: 'finance',
      gpa: 'academics',
      weeklyStudyHours: 'academics',
      monthlyIncome: 'finance',
      monthlyExpenses: 'finance',
      netWorth: 'finance'
    };
    return map[metric] || 'unknown';
  }

  /**
   * Generate insights based on trend data (if present).
   * @param {Object} analytics - Output from AnalyticsProcessor.process.
   * @returns {Array<Object>} Array of insight objects.
   */
  _generateTrendInsights(analytics) {
    if (!analytics || !analytics.trends) {
      return [];
    }
    const insights = [];

    for (const [metricName, { slope, percentChange, direction }] of Object.entries(analytics.trends)) {
      if (direction === 'stable' || Math.abs(percentChange) < 10) {
        continue;
      }

      const title = `${this._capitalize(metricName)} ${direction}`;
      const description = `Your ${this._formatMetricName(metricName)} has been ${direction} by ${Math.abs(percentChange).toFixed(1)}% over the analyzed period.`;
      const confidence = Math.min(0.9, 0.5 + Math.abs(percentChange) / 200);
      const sourceModule = this._metricToModule(metricName);
      const suggestedActions = [{ type: 'review', payload: { domain: sourceModule, action: 'review' } }];

      // Ensure confidence is a number with up to 2 decimal places
      const conf = Number(Number(confidence).toFixed(2));
      insights.push({
        id: this.generateId(),
        type: 'insight',
        title,
        description,
        confidence: conf,
        sourceModules: [sourceModule],
        basedOnMetrics: [metricName],
        suggestedActions
      });
    }

    return insights;
  }

  /**
   * Generate a simple ID for insights
   * @returns {string} A simple ID
   */
  generateId() {
    return Math.random().toString(36).substr(2, 9);
  }
}

module.exports = InsightGenerator;