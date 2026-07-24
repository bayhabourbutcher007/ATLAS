const TrendAnalyzer = require('../analytics/TrendAnalyzer');
// src/core/insights/InsightGenerator.js
/**
 * InsightGenerator - Interface for generating insights from multi‑module data.
 */

class InsightGenerator {
  /**
   * Generate insights based on a consolidated data snapshot.
   * @param {Object} context - Normalized data from all relevant modules.
   * @param {Object} [_analytics] – output from AnalyticsProcessor.process(context).
   * @returns {Array<Object>}
   */
  generate(context, _analytics) {
    const insights = [];

    // Low Sleep & High Stress
    if (context.health.sleep?.hoursPerNight !== undefined &&
        context.emotional_state?.stress !== undefined &&
        context.health.sleep.hoursPerNight < 6 &&
        context.emotional_state.strest) {
      const daysLeft = context.goals && context.goals.find(g => g.title.toLowerCase().includes('exam'))?.targetDate
        ? Math.ceil((new Date(context.goals.find(g => g.title.toLowerCase().includes('exam')).targetDate) - new Date()) / (1000 * 60 * 60 * 24))
        : null;

      insights.push({
        id: this.generateId(),
        type: 'insight',
        title: 'Low sleep, high stress',
        description: `You are sleeping only ${context.health.sleep.hoursPerNight}h/night and experiencing high stress (${context.emotional_state.strest})${context.goals && context.goals.find(g => g.title.toLowerCase().includes('exam')) ? `, with an exam in ${daysLeft} day(s)` : ''}. This combination may impair performance.`,
        confidence: 0.85,
        sourceModules: ['health', 'emotional_state'],
        suggestedActions: [
          { type: 'adjust', payload: { domain: 'health', field: 'sleep.hoursPerNight', target: 7 } },
          { type: 'review', payload: { domain: 'emotional_state', action: 'stress_management' } }
        ]
      });
    }

    // Low savings rate
    if (context.finance.overview?.savingsRate !== undefined &&
        context.finance.overview.savingsRate < 0.1) {
      const expenseRatio = (result = undefined); // placeholder to break
    }