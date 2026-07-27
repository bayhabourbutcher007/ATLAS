// src/core/analytics/TrendAnalyzer.js
/**
 * TrendAnalyzer - Simple statistical utilities for trend analysis.
 */

class TrendAnalyzer {
  /**
   * Perform linear regression (least squares) on an array of numeric values.
   * Assumes the x-values are 0, 1, 2, ..., n-1 (equally spaced).
   * @param {number[]} values - Array of numeric values.
   * @returns {{slope: number, intercept: number}} The slope and intercept of the best-fit line.
   * @throws {TypeError} If values is not an array or contains non-numbers.
   */
  static linearRegression(values) {
    if (!Array.isArray(values)) {
      throw new TypeError('Values must be an array');
    }
    const n = values.length;
    if (n < 2) {
      throw new Error('At least two values are required for linear regression');
    }

    // Validate all values are numbers
    for (let i = 0; i < n; i++) {
      if (typeof values[i] !== 'number' || isNaN(values[i])) {
        throw new TypeError(`All values must be valid numbers. Invalid value at index ${i}: ${values[i]}`);
      }
    }

    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    for (let i = 0; i < n; i++) {
      const x = i; // x is the index
      const y = values[i];
      sumX += x;
      sumY += y;
      sumXY += x * y;
      sumXX += x * x;
    }

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return { slope, intercept };
  }

  /**
   * Calculate percent change from the first to the last value in the array.
   * @param {number[]} values - Array of numeric values.
   * @returns {number} Percent change ((last - first) / first) * 100.
   * Returns 0 if the array is empty or first value is 0 to avoid division by zero.
   */
  static percentChange(values) {
    if (!Array.isArray(values) || values.length === 0) {
      return 0;
    }
    const first = values[0];
    const last = values[values.length - 1];
    if (first === 0) {
      // Avoid division by zero; if first is zero, any change is infinite, but we return 0 as a safe fallback.
      return 0;
    }
    return ((last - first) / first) * 100;
  }

  /**
   * Determine the direction of change based on the slope.
   * @param {number} slope - The slope from linear regression.
   * @param {number} [threshold=0.01] - Minimum absolute slope to consider as increasing/decreasing.
   * @returns {'increasing'|'decreasing'|'stable'}
   */
  static direction(slope, threshold = 0.01) {
    if (typeof slope !== 'number' || isNaN(slope)) {
      return 'stable';
    }
    if (slope > threshold) {
      return 'increasing';
    }
    if (slope < -threshold) {
      return 'decreasing';
    }
    return 'stable';
  }

  /**
   * Validate that the input is a non-empty array of numbers.
   * @param {*} input - The input to validate.
   * @returns {boolean} True if input is an array of numbers with length >= 2.
   */
  static isValidSeries(input) {
    if (!Array.isArray(input) || input.length < 2) {
      return false;
    }
    return input.every(val => typeof val === 'number' && !isNaN(val));
  }
}

module.exports = TrendAnalyzer;
