// src/core/analytics/AnalyticsProcessor.js
/**
 * AnalyticsProcessor - Interface for computing metrics and aggregates.
 */

class AnalyticsProcessor {
  /**
   * Process a context snapshot and return calculated metrics.
   * @param {Object} context - Normalized data from ContextAggregator.
   * @returns {Object} Key‑value map of derived metrics.
   */
  process(context) {
    // Placeholder – returns empty object.
    return {};
  }
}

module.exports = AnalyticsProcessor;