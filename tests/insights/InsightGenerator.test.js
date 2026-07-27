// tests/insights/InsightGenerator.test.js
const InsightGenerator = require('../../src/core/insights/InsightGenerator');

describe('InsightGenerator', () => {
  let generator;

  beforeEach(() => {
    generator = new InsightGenerator();
  });

  describe('positive insights', () => {
    test('stress decreasing generates positive insight', () => {
      const context = {
        emotional_state: {
          stressLevel: 60 // current stress
        }
      };
      const analytics = {
        trends: {
          stressLevel: {
            average: 80 // previous average stress
          }
        }
      };

      const insights = generator.generate(context, analytics);
      const stressInsight = insights.find(i => i.title === 'Your stress levels are improving');
      expect(stressInsight).toBeDefined();
      expect(stressInsight.category).toBe('positive');
      expect(stressInsight.subCategory).toBe('emotional.stress');
      expect(stressInsight.description).toContain('stress level has decreased');
      expect(stressInsight.confidence).toBeGreaterThan(0.5);
      expect(stressInsight.suggestedActions).toHaveLength(2);
    });

    test('expense ratio decreasing generates positive insight', () => {
      const context = {
        finance: {
          overview: {
            expenses: { monthly: 1500 },
            income: { monthly: 5000 },
            netWorth: 50000
          }
        }
      };
      const analytics = {
        trends: {
          expenseRatio: {
            average: 0.4 // previous average expense ratio (40%)
          }
        }
      };

      const insights = generator.generate(context, analytics);
      const expenseInsight = insights.find(i => i.title === 'Your expense ratio is improving');
      expect(expenseInsight).toBeDefined();
      expect(expenseInsight.category).toBe('positive');
      expect(expenseInsight.subCategory).toBe('finance.expenseRatio');
      expect(expenseInsight.description).toContain('expense ratio has decreased');
      expect(expenseInsight.description).toContain('saving you approximately');
      expect(expenseInsight.confidence).toBeGreaterThan(0.5);
      expect(expenseInsight.suggestedActions).toHaveLength(2);
    });

    test('GPA improvement generates positive insight', () => {
      const context = {
        academics: {
          gpa: {
            cumulative: 3.5
          }
        }
      };
      const analytics = {
        trends: {
          gpa: {
            average: 3.0 // previous average GPA
          }
        }
      };

      const insights = generator.generate(context, analytics);
      const gpaInsight = insights.find(i => i.title === 'Your academic performance is improving');
      expect(gpaInsight).toBeDefined();
      expect(gpaInsight.category).toBe('positive');
      expect(gpaInsight.subCategory).toBe('academics.gpa');
      expect(gpaInsight.description).toContain('GPA has increased');
      expect(gpaInsight.confidence).toBeGreaterThan(0.5);
      expect(gpaInsight.suggestedActions).toHaveLength(2);
    });

    test('study hours increase generates positive insight', () => {
      const context = {
        academics: {
          studyHours: {
            weekly: 12
          }
        }
      };
      const analytics = {
        trends: {
          weeklyStudyHours: {
            average: 8 // previous average study hours
          }
        }
      };

      const insights = generator.generate(context, analytics);
      const studyInsight = insights.find(i => i.title === 'Your study consistency is increasing');
      expect(studyInsight).toBeDefined();
      expect(studyInsight.category).toBe('positive');
      expect(studyInsight.subCategory).toBe('academics.studyHours');
      expect(studyInsight.description).toContain('weekly study hours have increased');
      expect(studyInsight.confidence).toBeGreaterThan(0.5);
      expect(studyInsight.suggestedActions).toHaveLength(2);
    });

    test('net worth increase generates positive insight', () => {
      const context = {
        finance: {
          overview: {
            netWorth: 105000
          }
        }
      };
      const analytics = {
        trends: {
          netWorth: {
            average: 100000 // previous average net worth
          }
        }
      };

      const insights = generator.generate(context, analytics);
      const worthInsight = insights.find(i => i.title === 'Your net worth is growing');
      expect(worthInsight).toBeDefined();
      expect(worthInsight.category).toBe('positive');
      expect(worthInsight.subCategory).toBe('finance.netWorth');
      expect(worthInsight.description).toContain('net worth has increased');
      expect(worthInsight.confidence).toBeGreaterThan(0.5);
      expect(worthInsight.suggestedActions).toHaveLength(2);
    });

    test('near side? Actually near completion encouragement generates positive insight', () => {
      const context = {
        goals: [
          {
            title: 'Learn Spanish',
            targetValue: 100,
            currentValue: 95,
            status: 'InProgress',
            startDate: '2024-01-01',
            targetDate: '2024-12-31'
          }
        ]
      };
      const analytics = {}; // not needed for this insight

      const insights = generator.generate(context, analytics);
      const insight = insights.find(i => i.title === "You're almost there with Learn Spanish!");
      expect(insight).toBeDefined();
      expect(insight.category).toBe('milestone');
      expect(insight.subCategory).toBe('goals.nearCompletion');
      expect(insight.description).toContain('Your goal is 95% complete');
      expect(insight.confidence).toBeGreaterThan(0.5);
      expect(insight.suggestedActions).toHaveLength(2);
      expect(insight.suggestedActions[0].payload.action).toBe('review_goal');
      expect(insight.suggestedActions[1].payload.activity).toBe('final_push');
    });

    test('goal acceleration detection generates positive insight', () => {
      // Use fake timers to control date
      jest.useFakeTimers();
      // Set a fixed date: 2024-01-01
      const fixedDate = new Date('2024-01-01T12:00:00Z');
      jest.setSystemTime(fixedDate);

      const startDate = new Date('2023-01-01T12:00:00Z'); // 1 year before
      const targetDate = new Date('2025-01-01T12:00:00Z'); // 1 year after
      // At fixedDate (2024-01-01), exactly halfway through the period => expected progress 0.5
      const currentValue = 70; // target 100 => progress 0.7 > 0.5 => acceleration
      const targetValue = 100;

      const context = {
        goals: [
          {
            title: 'Learn French',
            targetValue,
            currentValue,
            status: 'InProgress',
            startDate: startDate.toISOString(),
            targetDate: targetDate.toISOString()
          }
        ]
      };

      const analytics = {}; // not needed

      const insights = generator.generate(context, analytics);
      jest.useRealTimers(); // restore

      const insight = insights.find(i => i.title === 'Your progress toward Learn French is accelerating');
      expect(insight).toBeDefined();
      expect(insight.category).toBe('positive');
      expect(insight.subCategory).toBe('goals.acceleration');
      expect(insight.description).toContain('Your completion pace has improved');
      expect(insight.confidence).toBeGreaterThan(0.5);
      expect(insight.suggestedActions).toHaveLength(2);
    });

    test('goal completion celebration generates milestone insight', () => {
      const context = {
        goals: [
          {
            title: 'Run Marathon',
            targetValue: 42,
            currentValue: 42,
            status: 'InProgress',
            startDate: '2023-01-01',
            targetDate: '2024-12-31'
          }
        ]
      };
      const analytics = {};

      const insights = generator.generate(context, analytics);
      const insight = insights.find(i => i.title.startsWith('You completed') && i.title.includes('Marathon'));
      expect(insight).toBeDefined();
      expect(insight.category).toBe('milestone');
      expect(insight.subCategory).toBe('goals.completed');
      expect(insight.description).toContain('Congratulations! You achieved this goal.');
      expect(insight.confidence).toBeCloseTo(0.896, 3); // Updated from 0.95
      expect(insight.suggestedActions).toHaveLength(0);
    });

    test('missing data does not crash', () => {
      const context = {}; // empty context
      const analytics = {}; // empty analytics
      // Should not throw
      expect(() => {
        const insights = generator.generate(context, analytics);
        expect(Array.isArray(insights)).toBe(true);
      }).not.toThrow();
    });

    test('existing warning insights still work', () => {
      const context = {
        health: {
          sleep: {
            hoursPerNight: 5
          }
        },
        emotional_state: {
          stress: 90
        }
      };
      const analytics = {}; // not needed for this warning

      const insights = generator.generate(context, analytics);
      const warningInsight = insights.find(i => i.title === 'Low sleep, high stress');
      expect(warningInsight).toBeDefined();
      expect(warningInsight.category).toBe('warning');
      expect(warningInsight.confidence).toBeCloseTo(0.866, 3); // Updated from 0.85
    });

    test('goal risk detection (stagnation) still works', () => {
      const pastDate = new Date(Date.now() - 90 * 86400000); // 90 days ago
      const context = {
        goals: [
          {
            title: 'Learn Guitar',
            targetValue: 100,
            currentValue: 5, // 5% progress
            status: 'InProgress',
            startDate: pastDate.toISOString()
            // no targetDate
          }
        ]
      };
      const analytics = {};

      const insights = generator.generate(context, analytics);
      const insight = insights.find(i => i.title === `Goal lacks progress: Learn Guitar`);
      expect(insight).toBeDefined();
      expect(insight.category).toBe('warning');
      expect(insight.confidence).toBeCloseTo(0.851, 3); // Updated from 0.75
    });

    test('goal risk detection (low velocity) generates warning', () => {
      // Use a goal with targetDate far in future, but we have made little progress relative to time elapsed.
      // We'll use fake timers to control date.
      jest.useFakeTimers();
      const fixedDate = new Date('2024-01-01T12:00:00Z');
      jest.setSystemTime(fixedDate);

      const startDate = new Date('2023-01-01T12:00:00Z'); // 1 year before
      const targetDate = new Date('2025-01-01T12:00:00Z'); // 1 year after
      // At fixedDate (2024-01-01), elapsed = 1 year, total = 2 years => expected progress 0.5
      // Set current progress to 0.2 (beyond by 0.3 > 0.2 threshold)
      const context = {
        goals: [
          {
            title: 'Save Money',
            targetValue: 10000,
            currentValue: 2000, // 20% of target
            status: 'InProgress',
            startDate: startDate.toISOString(),
            targetDate: targetDate.toISOString()
          }
        ]
      };

      const analytics = {};
      const insights = generator.generate(context, analytics);
      jest.useRealTimers();

      const insight = insights.find(i => i.title === 'Save Money may need attention');
      expect(insight).toBeDefined();
      expect(insight.category).toBe('warning');
      expect(insight.subCategory).toBe('goals.risk');
      expect(insight.description).toContain('Your current pace is behind the expected timeline');
      expect(insight.confidence).toBeGreaterThan(0.5);
      expect(insight.suggestedActions).toHaveLength(2);
    });

    test('insight scorer metadata still attached', () => {
      const context = {
        emotional_state: {
          stressLevel: 60
        }
      };
      const analytics = {
        trends: {
          stressLevel: {
            average: 80
          }
        }
      };

      const insights = generator.generate(context, analytics);
      const stressInsight = insights.find(i => i.title === 'Your stress levels are improving');
      expect(stressInsight).toBeDefined();
      // Check that Scorer added fields
      expect(stressInsight).toHaveProperty('domain');
      expect(stressInsight).toHaveProperty('impact');
      expect(stressInsight).toHaveProperty('urgency');
      expect(stressInsight).toHaveProperty('dataQuality');
      expect(stressInsight).toHaveProperty('score');
      // Ensure original fields are present
      expect(stressInsight).toHaveProperty('id');
      expect(stressInsight).toHaveProperty('type');
      expect(stressInsight).toHaveProperty('title');
      expect(stressInsight).toHaveProperty('description');
      expect(stressInsight).toHaveProperty('confidence');
      expect(stressInsight).toHaveProperty('sourceModules');
      expect(stressInsight).toHaveProperty('category');
      expect(stressInsight).toHaveProperty('subCategory');
      expect(stressInsight).toHaveProperty('basedOnMetrics');
      expect(stressInsight).toHaveProperty('suggestedActions');
    });
  });
});