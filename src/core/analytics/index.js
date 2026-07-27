// src/core/analytics/index.js
// Analytics module - public interface

const AnalyticsProcessor = require('./AnalyticsProcessor');
const CorrelationAnalyzer = require('./CorrelationAnalyzer');

module.exports = {
  AnalyticsProcessor,
  CorrelationAnalyzer
};