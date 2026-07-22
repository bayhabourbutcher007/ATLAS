// src/core/insights/InsightGenerator.js
/**
 * InsightGenerator - Interface for generating insights from multi‑module data.
 */

class InsightGenerator {
  /**
   * Generate insights based on a consolidated data snapshot.
   * @param {Object} context - Normalized data from all relevant modules.
   * @param {Object} [_analytics] – output from AnalyticsProcessor.process(context).
   * @returns {Array<Object>}
   */
  generate(context, _analytics) {
    const insights = [];

    // Low Sleep & High Stress
    if (context.health.sleep?.hoursPerNight !== undefined && 
        context.emotional_state?.stress !== undefined &&
        context.health.sleep.hoursPerNight < 6 && 
        context.emotional_state.stress > 80) {
      const daysLeft = context.goals && context.goals.find(g => g.title.toLowerCase().includes('exam'))?.targetDate 
        ? Math.ceil((new Date(context.goals.find(g => g.title.toLowerCase().includes('exam')).targetDate) - new Date()) / (1000 * 60 * 60 * 24)) 
        : null;
      
      insights.push({
        id: this.generateId(),
        type: 'insight',
        title: 'Low sleep, high stress',
        description: `You are sleeping only ${context.health.sleep.hoursPerNight}h/night and experiencing high stress (${context.emotional_state.stress})${context.goals && context.goals.find(g => g.title.toLowerCase().includes('exam')) ? `, with an exam in ${daysLeft} day(s)` : ''}. This combination may impair performance.`,
        confidence: 0.85,
        sourceModules: ['health', 'emotional_state'],
        suggestedActions: [
          { type: 'adjust', payload: { domain: 'health', field: 'sleep.hoursPerNight', target: 7 } },
          { type: 'review', payload: { domain: 'emotional_state', action: 'stress_management' } }
        ]
      });
    }

    // Low savings rate
    if (context.finance.overview?.savingsRate !== undefined && 
        context.finance.overview.savingsRate < 0.1) {
      insights.push({
        id: this.generateId(),
        type: 'insight',
        title: 'Low savings rate',
        description: `You are saving only ${(context.finance.overview.savingsRate * 100).toFixed(0)}% of your income, which is below the recommended 10%.`,
        confidence: 0.9,
        sourceModules: ['finance'],
        suggestedActions: [
          { type: 'review', payload: { domain: 'finance', action: 'budget' } },
          { type: 'schedule', payload: { activity: 'financial_review', duration: 30 } }
        ]
      });
    }

    // Low GPA & Low Study Hours
    if (context.academics.gpa?.cumulative !== undefined && 
        context.academics.studyHours?.weekly !== undefined &&
        context.academics.gpa.cumulative < 3.0 && 
        context.academics.studyHours.weekly < 5) {
      insights.push({
        id: this.generateId(),
        type: 'insight',
        title: 'Low academic performance',
        description: `Your GPA is ${context.academics.gpa.cumulative.toFixed(1)} and you study only ${context.academics.studyHours.weekly} hours/week, which may affect your academic progress.`,
        confidence: 0.8,
        sourceModules: ['academics'],
        suggestedActions: [
          { type: 'schedule', payload: { activity: 'study', duration: 45 } },
          { type: 'review', payload: { domain: 'academics', action: 'study_techniques' } }
        ]
      });
    }

    // High Expense Ratio
    if (context.finance.overview?.expenses?.monthly !== undefined && 
        context.finance.overview?.income?.monthly !== undefined &&
        context.finance.overview.expenses.monthly > 0 && 
        context.finance.overview.income.monthly > 0 &&
        context.finance.overview.expenses.monthly > 0.8 * context.finance.overview.income.monthly) {
      const expenseRatio = (context.finance.overview.expenses.monthly / context.finance.overview.income.monthly * 100).toFixed(0);
      insights.push({
        id: this.generateId(),
        type: 'insight',
        title: 'High expense ratio',
        description: `Your expenses (${context.finance.overview.expenses.monthly}) represent ${expenseRatio}% of your income (${context.finance.overview.income.monthly}), which is above the recommended 80%.`,
        confidence: 0.88,
        sourceModules: ['finance'],
        suggestedActions: [
          { type: 'review', payload: { domain: 'finance', action: 'expenses' } },
          { type: 'adjust', payload: { domain: 'finance', field: 'expenses.category.misc', target: 0 } }
        ]
      });
    }

    // Goal Stagnation
    if (context.goals && Array.isArray(context.goals)) {
      const now = new Date();
      context.goals.forEach(goal => {
        if (goal.status === 'InProgress' && 
            goal.targetValue !== null && 
            goal.currentValue !== null && 
            goal.targetValue > 0) {
          
          const progress = Math.min(1, Math.max(0, goal.currentValue / goal.targetValue));
          const startedDate = goal.startDate ? new Date(goal.startDate) : null;
          const daysSinceStart = startedDate ? Math.ceil((now - startedDate) / (1000 * 60 * 60 * 24)) : 0;
          
          if (progress < 0.1 && daysSinceStart > 30) {
            insights.push({
              id: this.generateId(),
              type: 'insight',
              title: `Goal lacks progress: ${goal.title}`,
              description: `Your goal "${goal.title}" has only made ${(progress * 100).toFixed(0)}% progress in ${daysSinceStart} days. Consider reviewing your approach.`,
              confidence: 0.75,
              sourceModules: ['goals'],
              suggestedActions: [
                { type: 'review', payload: { domain: 'goals', action: 'review_goal' } },
                { type: 'adjust', payload: { domain: 'goals', goalId: goal.id || '', action: 'adjust_target' } }
              ]
            });
          }
        }
      });
    }

    return insights;
  }

  /**
   * Generate a simple ID for insights
   * @returns {string} A simple ID
   */
  generateId() {
    return Math.random().toString(36).substr(2, 9);
  }
}

module.exports = InsightGenerator;
