// tests/insights/InsightConfidence.test.js
const InsightConfidence = require('../../src/core/insights/InsightConfidence');

describe('InsightConfidence', () => {
  let confidence;

  beforeEach(() => {
    confidence = new InsightConfidence();
  });

  describe('calculate', () => {
    test('returns 0.5 when all inputs are zero (minimum confidence)', () => {
      const result = confidence.calculate({
        magnitude: 0,
        dataPoints: 0,
        dataFreshness: 0,
        reliability: 0,
        thresholdDistance: 0
      });
      expect(result).toBe(0.5);
    });

    test('returns close to 0.95 when all inputs are max', () => {
      const result = confidence.calculate({
        magnitude: 200, // will be capped to 1 for magnitudeScore
        dataPoints: 100, // >50 => 1
        dataFreshness: 1,
        reliability: 1,
        thresholdDistance: 1 // at maximum closeness
      });
      expect(result).toBeCloseTo(0.95, 2);
    });

    test('magnitude scoring', () => {
      const base = confidence.calculate({
        magnitude: 0,
        dataPoints: 50,
        dataFreshness: 1,
        reliability: 1,
        thresholdDistance: 0
      });
      const higher = confidence.calculate({
        magnitude: 100, // magnitudeScore = 1
        dataPoints: 50,
        dataFreshness: 1,
        reliability: 1,
        thresholdDistance: 0
      });
      expect(higher).toBeGreaterThan(base);
    });

    test('dataPoints scoring', () => {
      const low = confidence.calculate({
        magnitude: 0,
        dataPoints: 10,
        dataFreshness: 1,
        reliability: 1,
        thresholdDistance: 0
      });
      const high = confidence.calculate({
        magnitude: 0,
        dataPoints: 100,
        dataFreshness: 1,
        reliability: 1,
        thresholdDistance: 0
      });
      expect(high).toBeGreaterThan(low);
    });

    test('dataFreshness scoring', () => {
      const stale = confidence.calculate({
        magnitude: 0,
        dataPoints: 50,
        dataFreshness: 0,
        reliability: 1,
        thresholdDistance: 0
      });
      const fresh = confidence.calculate({
        magnitude: 0,
        dataPoints: 50,
        dataFreshness: 1,
        reliability: 1,
        thresholdDistance: 0
      });
      expect(fresh).toBeGreaterThan(stale);
    });

    test('reliability scoring', () => {
      const unreliable = confidence.calculate({
        magnitude: 0,
        dataPoints: 50,
        dataFreshness: 1,
        reliability: 0,
        thresholdDistance: 0
      });
      const reliable = confidence.calculate({
        magnitude: 0,
        dataPoints: 50,
        dataFreshness: 1,
        reliability: 1,
        thresholdDistance: 0
      });
      expect(reliable).toBeGreaterThan(unreliable);
    });

    test('thresholdDistance scoring', () => {
      const far = confidence.calculate({
        magnitude: 0,
        dataPoints: 50,
        dataFreshness: 1,
        reliability: 1,
        thresholdDistance: 0 // far from threshold
      });
      const near = confidence.calculate({
        magnitude: 0,
        dataPoints: 50,
        dataFreshness: 1,
        reliability: 1,
        thresholdDistance: 1 // at threshold
      });
      expect(near).toBeGreaterThan(far);
    });

    test('result clamped between 0 and 0.95', () => {
      // extreme negative magnitude treated same as positive due to abs
      const high = confidence.calculate({
        magnitude: 1000,
        dataPoints: 1000,
        dataFreshness: 1,
        reliability: 1,
        thresholdDistance: 1 // at maximum closeness
      });
      expect(high).toBeCloseTo(0.95, 2);
      const low = confidence.calculate({
        magnitude: -1000,
        dataPoints: 0,
        dataFreshness: 0,
        reliability: 0,
        thresholdDistance: 10 // far from threshold (clamped to 1)
      });
      expect(low).toBeGreaterThanOrEqual(0);
    });
  });
});