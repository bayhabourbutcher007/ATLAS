// src/core/life-context/index.js
// Life-context module - public interface

const ContextAggregator = require('./ContextAggregator');
const HistoricalContextBuilder = require('./HistoricalContextBuilder');

module.exports = {
  ContextAggregator,
  HistoricalContextBuilder
};