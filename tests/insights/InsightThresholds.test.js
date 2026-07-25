// tests/insights/InsightThresholds.test.js
const thresholds = require('../../src/core/insights/InsightThresholds');

describe('InsightThresholds', () => {
  test('has expected health thresholds', () => {
    expect(thresholds.health.sleepMinimum).toBe(6);
    expect(thresholds.health.stressHigh).toBe(80);
  });
  test('has expected finance thresholds', () => {
    expect(thresholds.finance.lowSavingsRate).toBe(0.1);
  });
  test('has expected academics thresholds', () => {
    expect(thresholds.academics.minimumGPA).toBe(3.0);
    expect(thresholds.academics.minimumWeeklyStudyHours).toBe(5);
  });
  test('has expected goals thresholds', () => {
    expect(thresholds.goals.minimumProgressThreshold).toBe(0.1);
    expect(thresholds.goals.minimumDaysForStagnation).toBe(30);
  });
});