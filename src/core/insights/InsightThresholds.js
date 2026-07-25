// src/core/insights/InsightThresholds.js
/**
 * Configuration thresholds for insight generation.
 * These values match the original hardcoded thresholds to maintain backward compatibility.
 */

const thresholds = {
    health: {
        sleepMinimum: 6, // hours per night - below this is considered low sleep
        stressHigh: 80   // stress level (0-100) - above this is considered high stress
    },
    finance: {
        lowSavingsRate: 0.1 // savings rate (fraction of income) - below this is considered low
    },
    academics: {
        minimumGPA: 3.0, // GPA - below this is considered low academic performance
        minimumWeeklyStudyHours: 5 // weekly study hours - below this is considered low
    },
    goals: {
        minimumProgressThreshold: 0.1, // progress < 10% considered stagnant
        minimumDaysForStagnation: 30   // and no progress for >30 days
    }
    // Note: expense ratio threshold is computed dynamically (expenses > 0.8 * income)
    // so we don't need a threshold for it here
};

module.exports = thresholds;