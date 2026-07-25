// src/core/insights/InsightComparison.js
/**
 * Utility for comparing current values against historical data.
 */

/**
 * Compare a current value to the historical average.
 * @param {number} current - The current value.
 * @param {number} historicalAverage - The average of historical values.
 * @returns {Object} An object containing the difference, percentage change, and direction.
 */
function compareToAverage(current, historicalAverage) {
    if (typeof current !== 'number' || isNaN(current) ||
        typeof historicalAverage !== 'number' || isNaN(historicalAverage)) {
        return { difference: 0, percentageChange: 0, direction: 'stable' };
    }

    const difference = current - historicalAverage;
    let percentageChange = 0;
    let direction = 'stable';

    if (historicalAverage !== 0) {
        percentageChange = (difference / historicalAverage) * 100;
    } else if (current !== 0) {
        // Avoid division by zero; if historical average is 0, any change is infinite, but we'll treat as large change
        percentageChange = difference > 0 ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;
    }

    // Determine direction based on a small threshold to avoid noise
    const threshold = 1; // 1% change threshold for direction
    if (Math.abs(percentageChange) > threshold) {
        direction = percentageChange > 0 ? 'improving' : 'declining';
    } else {
        direction = 'stable';
    }

    return {
        difference: Number(difference.toFixed(2)),
        percentageChange: Number(percentageChange.toFixed(2)),
        direction
    };
}

/**
 * Analyze a metric's trend over its historical series.
 * @param {number[]} history - Array of historical values for the metric (oldest to newest).
 * @returns {Object} An object containing the trend direction and slope.
 */
function compareMetricTrend(history) {
    if (!Array.isArray(history) || history.length < 2) {
        return { direction: 'stable', slope: 0 };
    }

    // Use simple linear regression to determine trend
    const n = history.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    history.forEach((value, index) => {
        const x = index; // time index
        const y = value;
        sumX += x;
        sumY += y;
        sumXY += x * y;
        sumXX += x * x;
    });

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Determine direction based on slope
    const threshold = 0.01; // minimal slope to consider as changing
    let direction = 'stable';
    if (slope > threshold) {
        direction = 'improving';
    } else if (slope < -threshold) {
        direction = 'declining';
    }

    return {
        direction: direction,
        slope: Number(slope.toFixed(4)),
        intercept: Number(intercept.toFixed(4))
    };
}

module.exports = {
    compareToAverage,
    compareMetricTrend
};