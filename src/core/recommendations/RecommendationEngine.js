// src/core/recommendations/RecommendationEngine.js
/**
 * RecommendationEngine - Interface for generating actionable recommendations.
 */

class RecommendationEngine {
  /**
   * Generate recommendations from insights and user context.
   * @param {Object} context - Normalized data from ContextAggregator.
   * @param {Array<Object>} insights - Output from InsightGenerator.generate(context, analytics).
   * @param {Object} [_userGoals] – subset of goals relevant to the current recommendation context.
   * @returns {Array<Object>} Array of recommendation objects.
   */
  generate(context, insights, _userGoals) {
    const recommendations = [];

    insights.forEach(insight => {
      let recommendation = null;

      // Map insights to recommendations based on title or content
      if (insight.title === 'Low sleep, high stress') {
        recommendation = {
          id: this.generateId(),
          title: 'Improve sleep & manage stress',
          description: 'Aim for at least 7 hours of sleep, take short breaks to lower stress, and review your budget to increase savings.',
          priority: 9, // high priority
          effortEstimate: '30 min planning + ongoing habit',
          expectedImpact: 'Better focus, improved exam performance, increased savings buffer',
          relatedInsightIds: [insight.id]
        };
      } else if (insight.title === 'Low savings rate') {
        recommendation = {
          id: this.generateId(),
          title: 'Build emergency fund',
          description: 'Start by saving 5% of income, gradually increase to 15-20% for emergency fund and retirement.',
          priority: 8, // high priority
          effortEstimate: '15 min setup + 5 min weekly review',
          expectedImpact: 'Financial security, reduced stress about unexpected expenses',
          relatedInsightIds: [insight.id]
        };
      } else if (insight.title === 'Low academic performance') {
        recommendation = {
          id: this.generateId(),
          title: 'Improve study habits',
          description: 'Use active recall and spaced repetition techniques, aim for 1-2 hours of focused study daily.',
          priority: 7, // medium-high priority
          effortEstimate: '20 min planning + 1-2 hr daily',
          expectedImpact: 'Better grades, deeper understanding, reduced exam anxiety',
          relatedInsightIds: [insight.id]
        };
      } else if (insight.title === 'High expense ratio') {
        recommendation = {
          id: this.generateId(),
          title: 'Reduce monthly expenses',
          description: 'Track expenses for 2 weeks, identify top 3 non-essential categories to reduce by 20% each.',
          priority: 8, // high priority
          effortEstimate: '30 min tracking + 15 min weekly review',
          expectedImpact: 'Increased savings rate, faster progress toward financial goals',
          relatedInsightIds: [insight.id]
        };
      } else if (insight.title.startsWith('Goal lacks progress:')) {
        recommendation = {
          id: this.generateId(),
          title: 'Renew commitment to goals',
          description: 'Break goal into smaller weekly targets, set up accountability system or find a mentor.',
          priority: 7, // medium-high priority
          effortEstimate: '20 min planning + 10 min daily check-in',
          expectedImpact: 'Steady progress toward goals, increased motivation and sense of accomplishment',
          relatedInsightIds: [insight.id]
        };
      }

      if (recommendation) {
        recommendations.push(recommendation);
      }
    });

    return recommendations;
  }

  /**
   * Generate a simple ID for recommendations
   * @returns {string} A simple ID
   */
  generateId() {
    return Math.random().toString(36).substr(2, 9);
  }
}

module.exports = RecommendationEngine;
