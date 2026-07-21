# Core Interaction Documentation

## Overview
The **Core** directory (`/src/core`) houses the **Intelligence Layer** of ATLAS. Its purpose is to consume data from the various domain modules (Academics, Finance, Skills, Planner, Progress, Collaboration, User, etc.) and produce **insights**, **recommendations**, **context snapshots**, and **analytics** that other parts of the system can consume.

## Data Flow Overview
1. **Domain Services** (e.g., `AcademicProgressService`, `FinanceService`) expose **standardized data access methods** that return plain JavaScript objects (DTOs) – never raw Mongoose documents.
2. A **Context Aggregator** (found in `core/life-context/ContextAggregator.js`) pulls the latest DTOs from each relevant service and merges them into a single **context snapshot**.
3. The context snapshot is handed to:
   * **AnalyticsProcessor** – computes numeric metrics/KPIs.
   * **InsightGenerator** – derives textual, actionable insights.
   * **RecommendationEngine** – suggests concrete next steps based on insights and user goals.
4. Downstream modules (controllers, background jobs, or UI layers) import the required core utilities and use the produced outputs to enrich responses, drive notifications, or update dashboards.

## Public Interfaces

### Core Export (`core/index.js`)
```js
const core = require('./core');
// Access sub‑modules:
core.insights.InsightGenerator
core.recommendations.RecommendationEngine
core.lifeContext.ContextAggregator
core.analytics.AnalyticsProcessor
```

### 1. Context Aggregator (`core/life-context/ContextAggregator.js`)
**Purpose:** Build a unified, read‑only snapshot of the user’s current state across modules.  
**Key method:**
```js
/**
 * @param {string} userId - Identifier of the user whose context is required.
 * @returns {Promise<Object>} Normalized context object.
 *
 * Example shape:
 * {
 *   user: {...},                      // lightweight user DTO
 *   academics: {...},                 // academic progress DTO
 *   finance: {...},                   // finance summary DTO
 *   skills: {...},                    // skills/learning DTO
 *   planner: {...},                   // upcoming tasks/events
 *   progress: {...},                  // cross‑domain progress indicators
 *   ... // any additional modules
 * }
 */
async function build(userId) { ... }
module.exports = { ContextAggregator: { build } };
```

### 2. Analytics Processor (`core/analytics/AnalyticsProcessor.js`)
**Purpose:** Transform context into quantitative metrics.  
**Key method:**
```js
/**
 * @param {Object} context - Output from ContextAggregator.build()
 * @returns {Object} Dictionary of metric names to values.
 */
function process(context) { ... }
module.exports = { AnalyticsProcessor };
```

### 3. Insight Generator (`core/insights/InsightGenerator.js`)
**Purpose:** Turn context (and optionally analytics) into human‑readable insights.  
**Key method:**
```js
/**
 * @param {Object} context - Normalized context.
 * @param {Object} [analytics] - Optional pre‑computed metrics.
 * @returns {Array<Object>} Array of insight objects.
 *
 * Each insight object should contain:
 *   {
 *     id: string,               // unique id (e.g., uuid)
 *     type: string,             // e.g., 'trend', 'anomaly', 'opportunity'
 *     title: string,            // short headline for UI
 *     description: string,      // explanation
 *     confidence: number,       // 0‑1 (optional)
 *     sourceModules: string[],  // which modules contributed data
 *     suggestedActions: []      // optional array of action objects
 *   }
 */
function generate(context, analytics) { ... }
module.exports = { InsightGenerator };
```

### 4. Recommendation Engine (`core/recommendations/RecommendationEngine.js`)
**Purpose:** Produce concrete, prioritized actions based on insights, goals, and constraints.  
**Key method:**
```js
/**
 * @param {Object} context - Normalized context.
 * @param {Array<Object>} insights - Insights from InsightGenerator.
 * @param {Object} [userGoals] - Optional structured goal objects.
 * @returns {Array<Object>} Ranked list of recommendation objects.
 *
 * Each recommendation object may include:
 *   {
 *     id: string,
 *     title: string,
 *     description: string,
 *     priority: number,          // higher = more urgent
 *     effortEstimate: string,    // e.g., '5 min', '1 hour'
 *     expectedImpact: string,    // qualitative or metric reference
 *     relatedInsightIds: []      // link back to originating insights
 *   }
 */
function generate(context, insights, userGoals) { ... }
module.exports = { RecommendationEngine };
```

## How a Domain Module Calls Into Core
1. **Invoke Context Aggregator** (often from a service or a scheduled job):
   ```js
   const { ContextAggregator } = require('../core/life-context');
   const context = await ContextAggregator.build(userId);
   ```
2. **Optionally compute analytics:**
   ```js
   const { AnalyticsProcessor } = require('../core/analytics');
   const metrics = AnalyticsProcessor.process(context);
   ```
3. **Generate insights:**
   ```js
   const { InsightGenerator } = require('../core/insights');
   const insights = InsightGenerator.generate(context, metrics);
   ```
4. **Produce recommendations:**
   ```js
   const { RecommendationEngine } = require('../core/recommendations');
   const recommendations = RecommendationEngine.generate(context, insights, userGoals);
   ```
5. **Use the results** – e.g., attach to API responses, store for later retrieval, trigger notifications, or feed UI widgets.

## Contract Rules
* **Input data must be plain objects (DTOs)** – no Mongoose documents, no functions.
* **Output must be serializable** – safe to JSON.stringify and send over HTTP.
* **No side effects** – core functions should not modify databases, files, or external services; they only compute and return values.
* **Deterministic** – identical input yields identical output (important for caching and testing).
* **Error handling** – if a required piece of data is missing, throw a specific error (e.g., `new Error('Missing finance data in context')`) rather than failing silently.

## Extending Core
When a new domain module (e.g., `HealthService`) is added:
1. Ensure it exposes a DTO‑returning method (e.g., `getHealthSnapshot(userId)`).
2. Update `ContextAggregator.build()` to call that method and merge its result into the context snapshot under a sensible key (e.g., `health`).
3. Existing `// No changes required to the core processing logic itself – it will automatically include the new data in its inputs.

## Testing Guidance
* Unit tests for each core class should supply mocked context objects and verify the shape of the output.
* Integration tests can spin up a test DB, populate sample data via the real services, then call the full pipeline (context → analytics → insights → recommendations) and assert that the results are non‑null and conform to the expected schemas.

--- 

*This documentation lives alongside the code in `/src/core` and should be kept up‑to‑date as the interfaces evolve.*