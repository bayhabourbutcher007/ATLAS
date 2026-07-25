// src/core/recommendations/RecommendationEngine.js
/**
 * RecommendationEngine - Interface for generating actionable recommendations.
 */

const InsightGenerator = require('../insights/InsightGenerator');

class RecommendationEngine {
  /**
   * Generate recommendations from insights and context.
   * @param {Object} context - Normalized data from ContextAggregator.
   * @param {Object} analytics - Output from AnalyticsProcessor.process(context).
   * @param {Array<Object>} insights - Output from InsightGenerator.generate(context, analytics).
   * @returns {Array<Object>} Array of recommendation objects.
   */
  generate(context, analytics, insights) {
    const recommendations = [];

    for (const insight of insights) {
      const insightsRecs = this.fromInsight(insight, context, analytics);
      recommendations.push(...insightsRecs);
    }

    const merged = this.mergeDuplicates(recommendations);
    return merged;
  }

  /**
   * Convert an insight into one or more recommendation objects.
   * @param {Object} insight - A single insight object.
   * @param {Object} context - Normalized data from ContextAggregator.
   * @param {Object} analytics - Output from AnalyticsProcessor.process(context).
   * @returns {Array<Object>} Array of recommendation objects for this insight.
   */
  fromInsight(insight, context, analytics) {
    const recommendations = [];

    // Handle trend insights
    const trendMatch = insight.title.match(/^(.+?) (increasing|decreasing)$/);
    if (trendMatch) {
      const [, metric, direction] = trendMatch;
      // Convert 'SleepHours' back to 'sleepHours'
      const uncapitalizedMetric = metric[0].toLowerCase() + metric.slice(1);
      let title, description;
      if (direction === 'increasing') {
        title = `Increase ${uncapitalizedMetric}`;
        description = `Your ${uncapitalizedMetric} has been increasing. Consider continuing this positive trend.`;
      } else if (direction === 'decreasing') {
        title = `Improve ${uncapitalizedMetric}`;
        description = `Your ${uncapitalizedMetric} has been decreasing. Consider taking corrective action.`;
      }
      if (title && description) {
        const rec = this._createRecommendationFromTemplate(
          insight,
          title,
          description,
          context,
          analytics
        );
        recommendations.push(rec);
      }
      return recommendations;
    }

    // Map known insight titles to recommendation templates
    const titleMap = {
      'Low sleep, high stress': {
        title: 'Improve sleep & manage stress',
        description: 'Aim for at least 7 hours of sleep, take short breaks to lower stress, and review your budget to increase savings.'
      },
      'Low savings rate': {
        title: 'Build emergency fund',
        description: 'Start by saving 5% of income, gradually increase to 15-20% for emergency fund and retirement.'
      },
      'Low academic performance': {
        title: 'Improve study habits',
        description: 'Use active recall and spaced repetition techniques, aim for 1-2 hours of focused study daily.'
      },
      'High expense ratio': {
        title: 'Reduce monthly expenses',
        description: 'Track expenses for 2 weeks, identify top 3 non-essential categories to reduce by 20% each.'
      }
    };

    const template = titleMap[insight.title];
    if (template) {
      const rec = this._createRecommendationFromTemplate(
        insight,
        template.title,
        template.description,
        context,
        analytics
      );
      recommendations.push(rec);
      return recommendations;
    }

    // Handle goal stagnation insights
    if (insight.title.startsWith('Goal lacks progress:')) {
      const title = 'Renew commitment to goals';
      const description = 'Break goal into smaller weekly targets, set up accountability system or find a mentor.';
      const rec = this._createRecommendationFromTemplate(
        insight,
        title,
        description,
        context,
        analytics
      );
      recommendations.push(rec);
      return recommendations;
    }

    // Fallback: create a generic recommendation
    const title = `Address ${insight.title}`;
    const description = `Based on the insight: ${insight.description}`;
    const rec = this._createRecommendationFromTemplate(
      insight,
      title,
      description,
      context,
      analytics
    );
    recommendations.push(rec);
    return recommendations;
  }

  /**
   * Create a recommendation object from a template.
   * @param {Object} insight - The source insight.
   * @param {string} title - The recommendation title.
   * @param {string} description - The recommendation description.
   * @param {Object} context - Normalized data from ContextAggregator.
   * @param {Object} analytics - Output from AnalyticsProcessor.process(context).
   * @returns {Object} A recommendation object.
   */
  _createRecommendationFromTemplate(insight, title, description, context, analytics) {
    // Determine category from insight's sourceModules (use first one or 'general')
    const category = (insight.sourceModules && insight.sourceModules[0]) || 'general';

    return {
      id: this.generateId(),
      title,
      description,
      category,
      priority: this.calculatePriority(insight, context, analytics),
      impact: this.estimateImpact(insight, context, analytics),
      effort: this.estimateEffort(insight, context, analytics),
      confidence: this._clamp(insight.confidence),
      basedOnInsights: [insight.id],
      actions: insight.suggestedActions || []
    };
  }

  /**
   * Merge duplicate recommendations (same title) into one.
   * @param {Array<Object>} recommendations - Array of recommendation objects.
   * @returns {Array<Object>} Array of merged recommendation objects.
   */
  mergeDuplicates(recommendations) {
    const map = new Map();

    for (const rec of recommendations) {
      const existing = map.get(rec.title);
      if (existing) {
        // Merge basedOnInsights
        existing.basedOnInsights = [...new Set([...existing.basedOnInsights, ...rec.basedOnInsights])];
        // Merge actions (concat and deduplicate by a simple stringify? We'll just concat and hope for no duplicates)
        existing.actions = [...existing.actions, ...rec.actions];
        // Keep the highest priority
        existing.priority = this._getHighestPriority([existing.priority, rec.priority]);
        // Keep the highest impact
        existing.impact = this._getHighestImpact([existing.impact, rec.impact]);
        // Keep the highest effort? Actually, we want to keep the highest effort? Or average? We'll keep the highest.
        existing.effort = this._getHighestEffort([existing.effort, rec.effort]);
        // Keep the highest confidence
        existing.confidence = Math.max(existing.confidence, rec.confidence);
        // Update description? We'll keep the first one for simplicity.
        // Alternatively, we could concatenate, but we'll keep the first.
      } else {
        map.set(rec.title, { ...rec }); // clone to avoid mutating original
      }
    }

    return Array.from(map.values());
  }

  /**
   * Calculate priority based on insight's sourceModules.
   * @param {Object} insight - The source insight.
   * @param {Object} context - Normalized data from ContextAggregator.
   * @param {Object} analytics - Output from AnalyticsProcessor.process(context).
   * @returns {'low'|'medium'|'high'}
   */
  calculatePriority(insight, context, analytics) {
    const categories = insight.sourceModules || [];
    if (categories.includes('health') || categories.includes('finance')) {
      return 'high';
    }
    if (categories.includes('academics') || categories.includes('goals') || categories.includes('time')) {
      return 'medium';
    }
    return 'low';
  }

  /**
   * Estimate impact based on insight's sourceModules.
   * @param {Object} insight - The source insight.
   * @param {Object} context - Normalized data from ContextAggregator.
   * @param {Object} analytics - Output from AnalyticsProcessor.process(context).
   * @returns {'low'|'medium'|'high'}
   */
  estimateImpact(insight, context, analytics) {
    const categories = insight.sourceModules || [];
    if (categories.includes('health') || categories.includes('finance')) {
      return 'high';
    }
    if (categories.includes('academics') || categories.includes('goals') || categories.includes('time')) {
      return 'medium';
    }
    return 'low';
  }

  /**
   * Estimate effort based on insight title.
   * @param {Object} insight - The source insight.
   * @param {Object} context - Normalized data from ContextAggregator.
   * @param {Object} analytics - Output from AnalyticsProcessor.process(context).
   * @returns {'low'|'medium'|'high'}
   */
  estimateEffort(insight, context, analytics) {
    const title = insight.title;
    // Map known insight titles to effort levels
    const effortMap = {
      'Low sleep, high stress': 'medium',
      'Low savings rate': 'medium',
      'Low academic performance': 'medium',
      'High expense ratio': 'medium'
    };
    if (effortMap[title]) {
      return effortMap[title];
    }
    // Handle goal stagnation insights
    if (title.startsWith('Goal lacks progress:')) {
      return 'low';
    }
    // Default to low for trend insights and others
    return 'low';
  }

  /**
   * Generate a simple ID for recommendations.
   * @returns {string} A simple ID.
   */
  generateId() {
    return Math.random().toString(36).substr(2, 9);
  }

  /**
   * Clamp a value between 0 and 1.
   * @param {number} value - The value to clamp.
   * @returns {number} Clamped value.
   */
  _clamp(value) {
    const num = Number(value);
    if (isNaN(num)) {
      return 0;
    }
    return Math.max(0, Math.min(1, num));
  }

  /**
   * Helper to determine the highest priority from an array.
   * @param {Array<'low'|'medium'|'high'>} priorities - Array of priority strings.
   * @returns {'low'|'medium'|'high'} The highest priority.
   */
  _getHighestPriority(priorities) {
    const order = { low: 0, medium: 1, high: 2 };
    let max = 'low';
    for (const p of priorities) {
      if (order[p] > order[max]) {
        max = p;
      }
    }
    return max;
  }

  /**
   * Helper to determine the highest impact from an array.
   * @param {Array<'low'|'medium'|'high'>} impacts - Array of impact strings.
   * @returns {'low'|'medium'|'high'} The highest impact.
   */
  _getHighestImpact(impacts) {
    return this._getHighestPriority(impacts); // same ordering
  }

  /**
   * Helper to determine the highest effort from an array.
   * @param {Array<'low'|'medium'|'high'>} efforts - Array of effort strings.
   * @returns {'low'|'medium'|'high'} The highest effort.
   */
  _getHighestEffort(efforts) {
    return this._getHighestPriority(efforts); // same ordering
  }

  /**
   * Format a metric name to a readable string (copied from InsightGenerator).
   * @param {string} metric - The metric name (e.g., 'sleepHours').
   * @returns {string} Formatted string.
   */
  _formatMetricName(metric) {
    return this._capitalize(metric)
      .replace(/Hours$/, 'hours')
      .replace(/Level$/, 'level')
      .replace(/Rate$/, 'rate')
      .replace(/Study/, 'study');
  }

  /**
   * Capitalize the first letter of a string.
   * @param {string} str - The string to capitalize.
   * @returns {string} Capitalized string.
   */
  _capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

module.exports = RecommendationEngine;