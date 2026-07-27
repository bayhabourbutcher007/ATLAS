// src/core/insights/InsightConfidence.js
/**
 * InsightConfidence - Utility for calculating insight confidence scores.
 * Provides a shared method to compute confidence based on multiple factors.
 */

class InsightConfidence {
  /**
   * Calculate confidence score based on multiple factors.
   * @param {Object} params - Configuration parameters
   * @param {number} params.magnitude - Magnitude of change (e.g., percent change, absolute difference). Higher = more confident.
   * @param {number} params.dataPoints - Number of historical data points supporting the insight. Higher = more confident.
   * @param {number} params.dataFreshness - How recent the data is (0-1, where 1 is most recent). Higher = more confident.
   * @param {number} params.reliability - Reliability of the data source (0-1, where 1 is most reliable). Higher = more confident.
   * @param {number} params.thresholdDistance - Closeness to a meaningful threshold (0-1, where 1 is exactly at threshold, 0 is far). Higher = more confident.
   * @returns {number} Confidence score between 0 and 0.95.
   */
  calculate(params = {}) {
    const {
      magnitude = 0,
      dataPoints = 0,
      dataFreshness = 0,
      reliability = 0,
      thresholdDistance = 0
    } = params;

    // Normalize each factor to a 0-1 range where higher is better
    const magnitudeScore = Math.min(1, Math.abs(magnitude) / 100); // Assume 100% change is max
    const dataPointsScore = Math.min(1, dataPoints / 50); // Assume 50 points is good
    const freshnessScore = Math.max(0, Math.min(1, dataFreshness)); // Clamp to 0-1
    const reliabilityScore = Math.max(0, Math.min(1, reliability)); // Clamp to 0-1
    const thresholdScore = Math.max(0, Math.min(1, thresholdDistance)); // Closer to threshold -> higher score

    // Weighted average (equal weights for simplicity)
    const factors = [
      magnitudeScore,
      dataPointsScore,
      freshnessScore,
      reliabilityScore,
      thresholdScore
    ];
    const average = factors.reduce((sum, f) => sum + f, 0) / factors.length;

    // Map average (0-1) to confidence range (0.5-0.95) to keep baseline confidence reasonable
    // This ensures that even with zero factors we get a baseline of 0.5
    const confidence = 0.5 + 0.45 * average;

    // Final clamp to ensure within [0, 0.95]
    return Math.max(0, Math.min(0.95, confidence));
  }
}

module.exports = InsightConfidence;