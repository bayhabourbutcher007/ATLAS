// src/core/insights/InsightGenerator.js
const TrendAnalyzer = require('../analytics/TrendAnalyzer');
const InsightScorer = require('./InsightScorer');
const thresholds = require('./InsightThresholds');
const comparison = require('./InsightComparison');

/**
 * InsightGenerator - Interface for generating insights from multi‑module data.
 * Now generates insights with metadata and uses configurable thresholds.
 */

class InsightGenerator {
  constructor() {
    this.scorer = new InsightScorer();
  }

  generate(context, _analytics) {
    const insights = [];

    // Warning/problem insights
    insights.push(...this._warnings(context, _analytics));
    // Positive insights
    insights.push(...this._positives(context, _analytics));
    // Trend insights from analytics
    insights.push(...this._trends(_analytics));

    // Score each insight to add metadata and priority scores
    return insights.map(insight => this.scorer.score(insight));
  }

  _warnings(context, _analytics) {
    const insights = [];

    // Low sleep, high stress
    const sleep = context?.health?.sleep?.hoursPerNight;
    const stress = context?.emotional_state?.stress;
    if (sleep !== undefined && stress !== undefined &&
        sleep < thresholds.health.sleepMinimum && stress > thresholds.health.stressHigh) {
      const daysLeft = context.goals && context.goals.find(g => g.title.toLowerCase().includes('exam'))?.targetDate
        ? Math.ceil((new Date(context.goals.find(g => g.title.toLowerCase().includes('exam')).targetDate) - new Date()) / (1000 * 60 * 60 * 24))
        : null;
      insights.push({
        id: this.generateId(),
        type: 'insight',
        title: 'Low sleep, high stress',
        description: `You are sleeping only ${sleep}h/night and experiencing high stress (${stress})${context.goals && context.goals.find(g => g.title.toLowerCase().includes('exam')) ? `, with an exam in ${daysLeft} day(s)` : ''}. This combination may impair performance.`,
        confidence: 0.85,
        sourceModules: ['health', 'emotional_state'],
        category: 'warning',
        basedOnMetrics: ['health.sleep.hoursPerNight', 'emotional_state.stress'],
        suggestedActions: [
          { type: 'adjust', payload: { domain: 'health', field: 'sleep.hoursPerNight', target: 7 } },
          { type: 'review', payload: { domain: 'emotional_state', action: 'stress_management' } }
        ]
      });
    }

    // Low savings rate
    const savings = context?.finance?.overview?.savingsRate;
    if (savings !== undefined && savings < thresholds.finance.lowSavingsRate) {
      insights.push({
        id: this.generateId(),
        type: 'insight',
        title: 'Low savings rate',
        description: `You are saving only ${(savings * 100).toFixed(0)}% of your income, which is below the recommended 10%.`,
        confidence: 0.9,
        sourceModules: ['finance'],
        category: 'warning',
        basedOnMetrics: ['finance.overview.savingsRate'],
        suggestedActions: [
          { type: 'review', payload: { domain: 'finance', action: 'budget' } },
          { type: 'schedule', payload: { activity: 'financial_review', duration: 30 } }
        ]
      });
    }

    // Low academic performance
    const gpa = context?.academics?.gpa?.cumulative;
    const study = context?.academics?.studyHours?.weekly;
    if (gpa !== undefined && study !== undefined &&
        gpa < thresholds.academics.minimumGPA && study < thresholds.academics.minimumWeeklyStudyHours) {
      insights.push({
        id: this.generateId(),
        type: 'insight',
        title: 'Low academic performance',
        description: `Your GPA is ${gpa.toFixed(1)} and you study only ${study} hours/week, which may affect your academic progress.`,
        confidence: 0.8,
        sourceModules: ['academics'],
        category: 'warning',
        basedOnMetrics: ['academics.gpa.cumulative', 'academics.studyHours.weekly'],
        suggestedActions: [
          { type: 'schedule', payload: { activity: 'study', duration: 45 } },
          { type: 'review', payload: { domain: 'academics', action: 'study_techniques' } }
        ]
      });
    }

    // High expense ratio
    const expenses = context?.finance?.overview?.expenses?.monthly;
    const income = context?.finance?.overview?.income?.monthly;
    if (expenses !== undefined && income !== undefined &&
        expenses > 0 && income > 0 &&
        expenses > 0.8 * income) {
      const expenseRatio = (expenses / income * 100).toFixed(0);
      insights.push({
        id: this.generateId(),
        type: 'insight',
        title: 'High expense ratio',
        description: `Your expenses (${expenses}) represent ${expenseRatio}% of your income (${income}), which is above the recommended 80%.`,
        confidence: 0.88,
        sourceModules: ['finance'],
        category: 'warning',
        basedOnMetrics: ['finance.overview.expenses.monthly', 'finance.overview.income.monthly'],
        suggestedActions: [
          { type: 'review', payload: { domain: 'finance', action: 'expenses' } },
          { type: 'adjust', payload: { domain: 'finance', field: 'expenses.category.misc', target: 0 } }
        ]
      });
    }

    // Goal stagnation
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
          if (progress < thresholds.goals.minimumProgressThreshold && daysSinceStart > thresholds.goals.minimumDaysForStagnation) {
            insights.push({
              id: this.generateId(),
              type: 'insight',
              title: `Goal lacks progress: ${goal.title}`,
              description: `Your goal "${goal.title}" has only made ${(progress * 100).toFixed(0)}% progress in ${daysSinceStart} days. Consider reviewing your approach.`,
              confidence: 0.75,
              sourceModules: ['goals'],
              category: 'warning',
              basedOnMetrics: ['goals.targetValue', 'goals.currentValue', 'goals.startDate'],
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

  _positives(context, _analytics) {
    const insights = [];

    // Positive health: sleep improving
    const sleep = context?.health?.sleep?.hoursPerNight;
    const sleepTrend = _analytics && _analytics.trends && _analytics.trends.sleepHours;
    if (sleep !== undefined && sleepTrend) {
      const comp = comparison.compareToAverage(sleep, sleepTrend.average);
      if (comp.direction === 'improving' && comp.percentageChange > 5) {
        insights.push({
          id: this.generateId(),
          type: 'insight',
          title: 'Sleep consistency improving',
          description: `Your sleep pattern has improved by ${Math.abs(comp.percentageChange).toFixed(1)}% compared to your previous baseline.`,
          confidence: Math.min(0.9, 0.5 + Math.abs(comp.percentageChange) / 100),
          sourceModules: ['health'],
          category: 'positive',
          basedOnMetrics: ['health.sleep.hoursPerNight'],
          suggestedActions: [{ type: 'review', payload: { domain: 'health', action: 'maintain_sleep_routine' } }]
        });
      }
    }

    // Positive finance: savings improving
    const savings = context?.finance?.overview?.savingsRate;
    const savingsTrend = _analytics && _analytics.trends && _analytics.trends.savingsRate;
    if (savings !== undefined && savingsTrend) {
      const comp = comparison.compareToAverage(savings, savingsTrend.average);
      if (comp.direction === 'improving' && comp.percentageChange > 5) {
        insights.push({
          id: this.generateId(),
          type: 'insight',
          title: 'Savings rate improving',
          description: `Your savings rate has increased by ${Math.abs(comp.percentageChange).toFixed(1)}% compared to your previous average.`,
          confidence: Math.min(0.9, 0.5 + Math.abs(comp.percentageChange) / 100),
          sourceModules: ['finance'],
          category: 'positive',
          basedOnMetrics: ['finance.overview.savingsRate'],
          suggestedActions: [{ type: 'review', payload: { domain: 'finance', action: 'maintain_savings_habits' } }]
        });
      }
    }

    // Positive goal: milestones
    if (context.goals && Array.isArray(context.goals)) {
      context.goals.forEach(goal => {
        if (goal.status === 'InProgress' &&
            goal.targetValue !== null &&
            goal.currentValue !== null &&
            goal.targetValue > 0) {
          const progress = goal.currentValue / goal.targetValue;
          if ([0.25, 0.5, 0.75, 1].some(p => Math.abs(progress - p) < 0.01)) {
            insights.push({
              id: this.generateId(),
              type: 'insight',
              title: `Goal milestone: ${Math.round(progress * 100)}% ${goal.title}`,
              description: `You've reached ${Math.round(progress * 100)}% of your goal "${goal.title}".`,
              confidence: 0.9,
              sourceModules: ['goals'],
              category: 'milestone',
              basedOnMetrics: ['goals.currentValue', 'goals.targetValue'],
              suggestedActions: [{ type: 'review', payload: { domain: 'goals', action: 'celebrate_milestone' } }]
            });
          }
        }
      });
    }

    return insights;
  }

  _trends(_analytics) {
    const insights = [];
    if (!_analytics || !_analytics.trends) return insights;
    for (const [metric, data] of Object.entries(_analytics.trends)) {
      if (data.direction === 'stable' || Math.abs(data.percentChange) < 10) continue;
      insights.push({
        id: this.generateId(),
        type: 'insight',
        title: `${this._capitalize(metric)} ${data.direction}`,
        description: `Your ${this._formatMetricName(metric)} has been ${data.direction} by ${Math.abs(data.percentChange).toFixed(1)}% over the analyzed period.`,
        confidence: Math.min(0.9, 0.5 + Math.abs(data.percentChange) / 200),
        sourceModules: [this._metricToModule(metric)],
        category: 'trend',
        basedOnMetrics: [metric],
        suggestedActions: [{ type: 'review', payload: { domain: this._metricToModule(metric), action: 'review' } }]
      });
    }
    return insights;
  }

  _capitalize(str) { return str.charAt(0).toUpperCase() + str.slice(1); }
  _formatMetricName(m) { return this._capitalize(m).replace(/Hours$/,'hours').replace(/Level$/,'level').replace(/Rate$/,'rate').replace(/Study/,'study'); }
  _metricToModule(m) {
    const map = { sleepHours:'health', stressLevel:'emotionalState', savingsRate:'finance', gpa:'academics', weeklyStudyHours:'academics', monthlyIncome:'finance', monthlyExpenses:'finance', netWorth:'finance' };
    return map[m] || 'unknown';
  }
  generateId() { return Math.random().toString(36).substr(2,9); }
}

module.exports = InsightGenerator;