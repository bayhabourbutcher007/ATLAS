// tests/insights/InsightComparison.test.js
const { compareToAverage, compareMetricTrend } = require('../../src/core/insights/InsightComparison');

describe('InsightComparison', () => {
  describe('compareToAverage', () => {
    test('returns stable when values equal', () => {
      const res = compareToAverage(10, 10);
      expect(res).toEqual({ difference: 0, percentageChange: 0, direction: 'stable' });
    });
    test('returns improving when current > average', () => {
      const res = compareToAverage(12, 10);
      expect(res.difference).toBe(2);
      expect(res.percentageChange).toBeCloseTo(20);
      expect(res.direction).toBe('improving');
    });
    test('returns declining when current < average', () => {
      const res = compareToAverage(8, 10);
      expect(res.difference).toBe(-2);
      expect(res.percentageChange).toBeCloseTo(-20);
      expect(res.direction).toBe('declining');
    });
    test('handles zero average', () => {
      const res = compareToAverage(5, 0);
      expect(res.difference).toBe(5);
      expect(res.percentageChange).toBe(Number.POSITIVE_INFINITY);
      expect(res.direction).toBe('improving');
    });
    test('clamps small changes to stable', () => {
      const res = compareToAverage(10.1, 10); // 1% change, threshold is 1%
      expect(res.direction).toBe('stable');
    });
  });

  describe('compareMetricTrend', () => {
    test('returns stable for constant values', () => {
      const res = compareMetricTrend([5,5,5,5]);
      expect(res.direction).toBe('stable');
      expect(res.slope).toBe(0);
    });
    test('returns improving for increasing values', () => {
      const res = compareMetricTrend([1,2,3,4,5]);
      expect(res.direction).toBe('improving');
      expect(res.slope).toBeGreaterThan(0);
    });
    test('returns declining for decreasing values', () => {
      const res = compareMetricTrend([5,4,3,2,1]);
      expect(res.direction).toBe('declining');
      expect(res.slope).toBeLessThan(0);
    });
    test('requires at least two points', () => {
      expect(compareMetricTrend([1])).toEqual({ direction: 'stable', slope: 0 });
      expect(compareMetricTrend([])).toEqual({ direction: 'stable', slope: 0 });
    });
  });
});