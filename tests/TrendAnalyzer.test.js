const TrendAnalyzer = require('../src/core/analytics/TrendAnalyzer');

describe('TrendAnalyzer', () => {
  test('linearRegression returns correct slope and intercept', () => {
    const result = TrendAnalyzer.linearRegression([1, 2, 3, 4, 5]);
    expect(result.slope).toBe(1);
    expect(result.intercept).toBe(1);
  });

  test('percentChange works', () => {
    expect(TrendAnalyzer.percentChange([1, 2])).toBeCloseTo(100);
    expect(TrendAnalyzer.percentChange([2, 1])).toBeCloseTo(-50);
    expect(TrendAnalyzer.percentChange([10, 10])).toBeCloseTo(0);
    expect(TrendAnalyzer.percentChange([0, 5])).toBe(0); // avoid division by zero
    expect(TrendAnalyzer.percentChange([5])).toBe(0);
    expect(TrendAnalyzer.percentChange([])).toBe(0);
  });

  test('direction returns correct string', () => {
    expect(TrendAnalyzer.direction(0.02)).toBe('increasing');
    expect(TrendAnalyzer.direction(-0.02)).toBe('decreasing');
    expect(TrendAnalyzer.direction(0)).toBe('stable');
    expect(TrendAnalyzer.direction(0.005, 0.01)).toBe('stable'); // small threshold
  });

  test('isValidSeries validates input', () => {
    expect(TrendAnalyzer.isValidSeries([1, 2, 3])).toBe(true);
    expect(TrendAnalyzer.isValidSeries([1, 'a', 3])).toBe(false);
    expect(TrendAnalyzer.isValidSeries([])).toBe(false);
    expect(TrendAnalyzer.isValidSeries([1])).toBe(false);
    expect(TrendAnalyzer.isValidSeries(null)).toBe(false);
  });
});
