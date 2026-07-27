// src/core/analytics/CorrelationAnalyzer.js
/**
 * CorrelationAnalyzer - Detects correlations between pairs of metrics over time.
 */

class CorrelationAnalyzer {
  /**
   * Compute Pearson's correlation coefficient between two arrays of numbers.
   * @param {number[]} x - First array of numeric values.
   * @param {number[]} y - Second array of numeric values.
   * @returns {number} Correlation coefficient between -1 and 1.
   * @static
   */
  static pearsonCorrelation(x, y) {
    if (!Array.isArray(x) || !Array.isArray(y) || x.length !== y.length || x.length < 2) {
      return 0;
    }

    const n = x.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;

    for (let i = 0; i < n; i++) {
      const xi = x[i];
      const yi = y[i];
      if (typeof xi !== 'number' || isNaN(xi) || typeof yi !== 'number' || isNaN(yi)) {
        return 0; // Invalid data
      }
      sumX += xi;
      sumY += yi;
      sumXY += xi * yi;
      sumX2 += xi * xi;
      sumY2 += yi * yi;
    }

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    if (denominator === 0) {
      return 0;
    }

    return numerator / denominator;
  }

  /**
   * Determine the relationship description based on correlation coefficient.
   * @param {number} correlation - The correlation coefficient (-1 to 1).
   * @returns {string} Relationship description (e.g., 'positive', 'negative', 'no correlation').
   * @static
   */
  static getRelationship(correlation) {
    const threshold = 0.05;
    if (correlation > threshold) {
      return 'positive';
    } else if (correlation < -threshold) {
      return 'negative';
    } else {
      return 'no correlation';
    }
  }

  /**
   * Determine confidence based on the number of data points and correlation strength.
   * Simple heuristic: more data points and stronger correlation -> higher confidence.
   * @param {number} dataPoints - Number of data points used in the correlation.
   * @param {number} correlation - The correlation coefficient.
   * @returns {number} Confidence score between 0 and 1.
   * @static
   */
  static getConfidence(dataPoints, correlation) {
    // If no data points, confidence is zero
    if (dataPoints === 0) {
      return 0;
    }
    // Confidence increases with more data points (up to a point) and with stronger correlation
    const dataPointFactor = Math.min(dataPoints / 30, 1); // Assume 30+ points is high confidence
    const correlationFactor = Math.abs(correlation);
    // Weighted average: 70% data points, 30% correlation strength
    return 0.7 * dataPointFactor + 0.3 * correlationFactor;
  }

  /**
   * Generate a human-readable explanation for the correlation.
   * @param {string} metricA - Name of the first metric.
   * @param {string} metricB - Name of the second metric.
   * @param {number} correlation - The correlation coefficient.
   * @returns {string} Explanation string.
   * @static
   */
  static getExplanation(metricA, metricB, correlation) {
    const absCorr = Math.abs(correlation);
    let strengthDesc = 'weak';
    if (absCorr > 0.7) strengthDesc = 'strong';
    else if (absCorr > 0.3) strengthDesc = 'moderate';

    const direction = correlation > 0 ? 'increases' : 'decreases';
    const otherDirection = correlation > 0 ? 'increases' : 'decreases';

    return `${metricA} shows a ${strengthDesc} ${this.getRelationship(correlation)} correlation with ${metricB}: as ${metricA} increases, ${metricB} tends to ${direction}.`;
  }

  /**
   * Analyze correlations between multiple metrics based on historical data.
   * @param {Object} historicalContext - The historical context object from HistoricalContextBuilder.
   * @param {Object} metricDefinitions - Definitions of metrics to analyze (same as used in AnalyticsProcessor).
   * @returns {Object} An object where keys are `${metricA}_${metricB}` and values are correlation objects.
   * @static
   */
  static analyze(historicalContext, metricDefinitions) {
    const correlations = {};

    // Extract time series for each metric
    const metricSeries = {};

    for (const def of metricDefinitions) {
      const array = historicalContext[def.arrayKey];
      if (!Array.isArray(array) || array.length === 0) {
        continue;
      }

      const values = array.map(item => {
        if (def.customExtractor) {
          return def.customExtractor(item);
        }
        // Assume def.path is an array of strings or a dot-separated string
        const parts = Array.isArray(def.path) ? def.path : def.path.split('.');
        let current = item;
        for (const part of parts) {
          if (current === null || current === undefined || !(Object.hasOwnProperty.call(current, part))) {
            return undefined;
          }
          current = current[part];
        }
        return typeof current === 'number' && !isNaN(current) ? current : undefined;
      }).filter(val => val !== undefined); // Remove undefined values

      // We need at least 2 points to compute correlation
      if (values.length >= 2) {
        metricSeries[def.name] = values;
      }
    }

    // Compute correlations for each pair of metrics
    const metricNames = Object.keys(metricSeries);
    for (let i = 0; i < metricNames.length; i++) {
      for (let j = i + 1; j < metricNames.length; j++) {
        const ma = metricNames[i];
        const mb = metricNames[j];
        const xa = metricSeries[ma];
        const xb = metricSeries[mb];

        // Ensure both arrays have the same length for correlation (they should, as they come from the same time periods)
        // But if they don't, we can truncate to the shorter length
        const length = Math.min(xa.length, xb.length);
        if (length < 2) {
          continue;
        }

        const truncatedXa = xa.slice(0, length);
        const truncatedXb = xb.slice(0, length);

        const correlation = this.pearsonCorrelation(truncatedXa, truncatedXb);
        const relationship = this.getRelationship(correlation);
        const confidence = this.getConfidence(length, correlation);
        const explanation = this.getExplanation(ma, mb, correlation);

        // Only include correlations that meet a minimum strength threshold (e.g., absolute correlation > 0.2)
        // to avoid noise. This threshold can be adjusted.
        if (Math.abs(correlation) > 0.2) {
          const key = `${ma}_${mb}`;
          correlations[key] = {
            metricA: ma,
            metricB: mb,
            relationship,
            strength: Math.abs(correlation),
            confidence: Number(confidence.toFixed(3)), // Round to 3 decimal places
            explanation,
            basedOnMetrics: [ma, mb]
          };
        }
      }
    }

    return correlations;
  }
}

module.exports = CorrelationAnalyzer;