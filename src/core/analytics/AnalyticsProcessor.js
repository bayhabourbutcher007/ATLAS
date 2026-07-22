// src/core/analytics/AnalyticsProcessor.js
/**
 * AnalyticsProcessor - Interface for computing metrics and aggregates.
 */

class AnalyticsProcessor {
  /**
   * Process a context snapshot and return calculated metrics.
   * @param {Object} context - Normalized data from ContextAggregator.
   * @returns {Object} Key-value map of derived metrics.
   */
  process(context) {
    const analytics = {};

    // Sleep metrics
    if (context.health && context.health.sleep && context.health.sleep.hoursPerNight !== null && context.health.sleep.hoursPerNight !== undefined) {
      analytics.sleepHours = context.health.sleep.hoursPerNight;
    }

    // Stress metrics
    if (context.emotional_state && context.emotional_state.stress !== null && context.emotional_state.stress !== undefined) {
      analytics.stressLevel = context.emotional_state.stress;
    }

    // Savings rate
    if (context.finance && context.finance.overview && context.finance.overview.savingsRate !== null && context.finance.overview.savingsRate !== undefined) {
      analytics.savingsRate = context.finance.overview.savingsRate;
    }

    // GPA (priority to cumulative, then semester)
    if (context.academics && context.academics.gpa) {
      if (context.academics.gpa.cumulative !== null && context.academics.gpa.cumulative !== undefined) {
        analytics.gpa = context.academics.gpa.cumulative;
      } else if (context.academics.gpa.semester !== null && context.academics.gpa.semester !== undefined) {
        analytics.gpa = context.academics.gpa.semester;
      }
    }

    // Weekly study hours
    if (context.academics && context.academics.studyHours && context.academics.studyHours.weekly !== null && context.academics.studyHours.weekly !== undefined) {
      analytics.weeklyStudyHours = context.academics.studyHours.weekly;
    }

    // Monthly income
    if (context.finance && context.finance.overview && context.finance.overview.income && context.finance.overview.income.monthly !== null && context.finance.overview.income.monthly !== undefined) {
      analytics.monthlyIncome = context.finance.overview.income.monthly;
    }

    // Monthly expenses
    if (context.finance && context.finance.overview && context.finance.overview.expenses && context.finance.overview.expenses.monthly !== null && context.finance.overview.expenses.monthly !== undefined) {
      analytics.monthlyExpenses = context.finance.overview.expenses.monthly;
    }

    // Net worth
    if (context.finance && context.finance.overview && context.finance.overview.netWorth !== null && context.finance.overview.netWorth !== undefined) {
      analytics.netWorth = context.finance.overview.netWorth;
    }

    // Sleep to stress ratio (avoiding division by zero)
    if (analytics.sleepHours !== undefined && analytics.stressLevel !== undefined) {
      // Add 1 to stress to avoid division by zero, and scale stress to 0-10 range for better ratio
      const stressFactor = Math.max(0, (100 - analytics.stressLevel) / 10); // Invert stress so higher is better
      analytics.sleepStressRatio = analytics.sleepHours * (stressFactor / 10); // Normalized score
    }

    // Goal progress calculations
    if (context.goals && Array.isArray(context.goals)) {
      const goalProgress = [];
      const now = new Date();
      
      context.goals.forEach(goal => {
        if (goal.targetValue !== null && goal.targetValue !== undefined && 
            goal.currentValue !== null && goal.currentValue !== undefined &&
            goal.targetValue > 0) {
          
          const progress = Math.min(1, Math.max(0, goal.currentValue / goal.targetValue));
          goalProgress.push({
            id: goal.id,
            title: goal.title,
            progress: progress,
            percentage: progress * 100
          });
        }
      });
      
      if (goalProgress.length > 0) {
        analytics.goalProgress = goalProgress;
      }
    }

    // Calculate days until target dates for goals
    if (context.goals && Array.isArray(context.goals)) {
      const goalsWithDates = [];
      
      context.goals.forEach(goal => {
        if (goal.targetDate) {
          const targetDate = new Date(goal.targetDate);
          const timeDiff = targetDate - now;
          const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
          
          goalsWithDates.push({
            id: goal.id,
            title: goal.title,
            daysUntilTarget: daysDiff > 0 ? daysDiff : 0, // Don't show negative days
            isOverdue: daysDiff < 0
          });
        }
      });
      
      if (goalsWithDates.length > 0) {
        analytics.goalDates = goalsWithDates;
      }
    }

    return analytics;
  }
}

module.exports = AnalyticsProcessor;
