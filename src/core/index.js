// src/core/index.js
// Core Intelligence Layer - Entry point
// Exports sub-modules for external use

const InsightGenerator = require('./insights/InsightGenerator');
const RecommendationEngine = require('./recommendations/RecommendationEngine');
const ContextAggregator = require('./life-context/ContextAggregator');
const AnalyticsProcessor = require('./analytics/AnalyticsProcessor');

module.exports = {
  InsightGenerator,
  RecommendationEngine,
  ContextAggregator,
  AnalyticsProcessor
};