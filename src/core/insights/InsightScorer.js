// src/core/insights/InsightScorer.js
/**
 * InsightScorer - Scores and enriches insight objects with metadata.
 */

class InsightScorer {
  constructor() {
    // Mapping from source module to domain
    this.sourceModuleToDomain = {
      health: 'health',
      emotional_state: 'health',
      finance: 'finance',
      academics: 'academics',
      goals: 'goals',
      time: 'productivity',
      career: 'productivity',
      skills: 'productivity',
      // default fallback
    };
  }

  /**
   * Score an insight, adding metadata and returning the enhanced insight.
   * @param {Object} insight - The insight object to score.
   * @returns {Object} The enriched insight object.
   */
  score(insight) {
    // Work on a copy to avoid mutating the original if that's a concern
    const scored = { ...insight };

    // Ensure basedOnMetrics exists (should be set by generator, but fallback)
    if (!scored.basedOnMetrics) {
      scored.basedOnMetrics = this._inferBasedOnMetrics(scored);
    }

    // Determine domain
    scored.domain = this._determineDomain(scored);

    // Determine impact
    scored.impact = this.calculateImpact(scored);

    // Determine urgency
    scored.urgency = this.calculateUrgency(scored);

    // Determine data quality
    scored.dataQuality = this.calculateDataQuality(scored);

    // Calculate overall score (0-1)
    scored.score = this.calculateOverallScore(scored);

    return scored;
  }

  /**
   * Determine the domain based on sourceModules.
   * @param {Object} insight - The insight object.
   * @returns {string} Domain string.
   */
  _determineDomain(insight) {
    const { sourceModules = [] } = insight;
    // Count occurrences per domain
    const domainCounts = {};
    for (const module of sourceModules) {
      const domain = this.sourceModuleToDomain[module] || 'general';
      domainCounts[domain] = (domainCounts[domain] || 0) + 1;
    }
    // Pick the domain with the highest count; tie-break by priority? We'll just pick first max.
    let maxDomain = 'general';
    let maxCount = 0;
    for (const [domain, count] of Object.entries(domainCounts)) {
      if (count > maxCount) {
        maxCount = count;
        maxDomain = domain;
      }
    }
    return maxDomain;
  }

  /**
   * Calculate impact based on domain.
   * @param {Object} insight - The insight object (should have domain).
   * @returns {'low'|'medium'|'high'}
   */
  calculateImpact(insight) {
    const { domain } = insight;
    const impactMap = {
      health: 'high',
      finance: 'high',
      academics: 'medium',
      goals: 'medium',
      productivity: 'medium',
      general: 'low',
    };
    return impactMap[domain] || 'low';
  }

  /**
   * Calculate urgency based on confidence and impact.
   * @param {Object} insight - The insight object (should have confidence and impact).
   * @returns {'low'|'medium'|'high'}
   */
  calculateUrgency(insight) {
    const { confidence = 0, impact } = insight;
    const impactLevel = impact || this.calculateImpact(insight);

    // Simple heuristic: high confidence and high impact -> high urgency
    if (typeof confidence === 'number' && !isNaN(confidence)) {
      if (confidence >= 0.8 && impactLevel === 'high') {
        return 'high';
      }
      if (confidence >= 0.6) {
        return 'medium';
      }
    }
    return 'low';
  }

  /**
   * Calculate data quality.
   * For now, we approximate with confidence (could be enhanced with actual data checks).
   * @param {Object} insight - The insight object.
   * @returns {number} Between 0 and 1.
   */
  calculateDataQuality(insight) {
    const { confidence = 0 } = insight;
    // Clamp to [0,1]
    return Math.max(0, Math.min(1, Number(confidence)));
  }

  /**
   * Infer basedOnMetrics from insight if not provided.
   * This is a fallback; ideally set by the generator.
   * @param {Object} insight - The insight object.
   * @returns {string[]} Array of metric paths.
   */
  _inferBasedOnMetrics(insight) {
    // Simple fallback: if we have sourceModules, we could map to typical metrics,
    // but for now return empty array to avoid incorrect data.
    return [];
  }

  /**
   * Calculate an overall score for the insight.
   * Combines confidence, impact, urgency, and data quality.
   * @param {Object} insight - The insight object (should have domain, impact, urgency, dataQuality, confidence).
   * @returns {number} Score between 0 and 1.
   */
  calculateOverallScore(insight) {
    const { confidence = 0, dataQuality = 0 } = insight;
    const impact = this.calculateImpact(insight);
    const urgency = this.calculateUrgency(insight);

    // Map categorical values to numeric scores
    const impactMap = { low: 0.3, medium: 0.6, high: 1.0 };
    const urgencyMap = { low: 0.3, medium: 0.6, high: 1.0 };

    const impactValue = impactMap[impact] || 0.3;
    const urgencyValue = urgencyMap[urgency] || 0.3;

    // Weighted sum (weights can be tuned)
    // We want confidence and dataQuality to have higher weight because they reflect reliability
    const score =
      0.3 * confidence +
      0.2 * dataQuality +
      0.25 * impactValue +
      0.25 * urgencyValue;

    // Ensure within [0,1]
    return Math.max(0, Math.min(1, score));
  }
}

module.exports = InsightScorer;