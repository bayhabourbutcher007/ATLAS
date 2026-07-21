# ATLAS Core Interaction Guide

This document explains how domain modules (Academics, Finance, Skills, etc.) communicate with the **Intelligence Layer** (`/src/core`). It defines the contracts, data flow, and rules that keep the core pure, testable, and side‑effect free.

---

## 1. High‑Level Data Flow

```
[Domain Service]  -->  ContextAggregator  -->  [AnalyticsProcessor | InsightGenerator | RecommendationEngine]
        |                                                               |
        |<------ Controllers may consume results for API responses -----|
```

1. **Domain services** expose plain‑object data accessors (DTOs).  
2. **ContextAggregator** (core/life-context) pulls the latest DTOs from all relevant services and merges them into a single **context snapshot**.  
3. The snapshot is handed to:
   - **AnalyticsProcessor** → computes quantitative metrics/KPIs.  
   - **InsightGenerator** → derives human‑readable insights (trends, anomalies, opportunities).  
   - **RecommendationEngine** → turns insights + user goals into concrete, prioritized actions.  

All core functions are **pure** (no side effects) and **deterministic** – identical input yields identical output.

---

## 2. Public Interfaces

### Core Index (`src/core/index.js`)
```js
module.exports = {
  insights: require('./insights'),
  recommendations: require('./recommendations'),
  lifeContext: require('./life-context'),
  analytics: require('./analytics')
};
```

#### Usage
```js
const core = require('./core');
const { ContextAggregator } = core.lifeContext;
const { InsightGenerator } = core.insights;
const { RecommendationEngine } = core.recommendations;
const { AnalyticsProcessor } = core.analytics;
```

---

### 2.1 Context Aggregator (`src/core/life-context/ContextAggregator.js`)

**Purpose:** Build a unified, read‑only snapshot of the user's state by delegating to domain services.

**Contract**
```js
/**
 * @param {string|Object} userIdOrQuery – Identifier (or object with `.id`) of the user.
 * @returns {Promise<Object>} Normalized context snapshot.
 *
 * The function calls:
 *   - `AcademicProgressService.getAcademicProgress(userId)` for academic data
 *   - `UserService.getUserById(userId)` for user profile
 *   (Other domain services – finance, skills, health, career, time, emotional_state – 
 *    return placeholder empty structures until those modules are implemented.)
 *
 * Expected shape (example):
 * {
 *   user: { id, username, email, role, preferences, profile: {firstName, lastName, ...} },
 *   goals: [{ id, title, description, type, targetValue, startDate, targetDate, status, priority, completed, createdAt, updatedAt }],
 *   academics: {
 *     currentTerm: { term, year },
 *     gpa: { semester, cumulative },
 *     credits: { completed, inProgress, planned },
 *     courses: [{ id, courseId, courseName, courseCode, credits, instructor, term, year, grade, gradePoints, status,
 *                 materials: [{name, type, url}], schedule: [{dayOfWeek, startTime, endTime, location}], customFields:[...] }],
 *     studyHours: { total, weekly, monthly, byCourse:[{courseId, minutes}], lastUpdated },
 *     goals: [...], // academic‑related goals (same shape as top-level goals)
 *     achievements: [{ id, title, description, date, issuer, certificateUrl, category }]
 *   },
 *   finance: {/* empty/default structure */},
 *   skills: {/* empty/default structure */},
 *   health: {/* empty/default structure */},
 *   career: {/* empty/default structure */},
 *   time: {/* empty/default structure */},
 *   emotional_state: {/* empty/default structure */},
 *   metadata: { generatedAt: ISO8601String, version: "1.0.0" }
 * }
 *
 * Rules:
 * - Return **plain objects** (no Mongoose documents, no functions).
 * - Do **not** perform business logic beyond data retrieval and light normalization.
 * - If the academic record does not exist, return an empty/default academics structure.
 * - If the user cannot be found, propagate the error.
 */
async function build(userIdOrQuery) { ... }

module.exports = { ContextAggregator: { build } };
```

---

### 2.2 Analytics Processor (`src/core/analytics/AnalyticsProcessor.js`)

**Purpose:** Derive quantitative metrics from the context snapshot.

**Contract**
```js
/**
 * @param {Object} context – Output from ContextAggregator.build()
 * @returns {Object} Dictionary of metric names to values.
 *
 * Example:
 * {
 *   monthlySavingsRate: 0.18,
 *   averageWeeklyStudyHours: 12,
 *   expenseGrowthPercent: 3.4,
 *   goalCompletionRatio: 0.62,
 *   // any domain‑specific KPI
 * }
 *
 * Rules:
 * - Pure function – no side effects.
 * - Deterministic – same input → same output.
 * - Avoid heavy interpretation; save narrative for InsightGenerator.
 */
function process(context) { ... }

module.exports = { AnalyticsProcessor };
```

---

### 2.3 Insight Generator (`src/core/insights/InsightGenerator.js`)

**Purpose:** Turn context (and optionally analytics) into human‑readable insights.

**Contract**
```js
/**
 * @param {Object} context – Normalized context from ContextAggregator.
 * @param {Object} [analytics] – Pre‑computed metrics (optional).
 * @returns {Array<Object>} Array of insight objects.
 *
 * Each insight object SHOULD contain:
 *   {
 *     id: string,               // unique identifier (e.g., uuid)
 *     type: string,             // e.g., 'trend', 'anomaly', 'opportunity', 'correlation'
 *     title: string,            // short headline for UI
 *     description: string,      // human‑readable explanation
 *     confidence: number,       // 0‑1 (optional, higher = more certain)
 *     sourceModules: string[],  // which modules contributed data (e.g., ['finance','academics'])
 *     suggestedActions: []      // optional array of lightweight action hints
 *   }
 *
 * Rules:
 * - Pure, deterministic, side‑effect free.
 * - Do **not** decide *what* the user should do – that is the role of RecommendationEngine.
 * - If no insights can be derived, return an empty array [].
 */
function generate(context, analytics) { ... }

module.exports = { InsightGenerator };
```

---

### 2.4 Recommendation Engine (`src/core/recommendations/RecommendationEngine.js`)

**Purpose:** Produce concrete, prioritized actions based on insights, goals, and constraints.

**Contract**
```js
/**
 * @param {Object} context – Normalized context.
 * @param {Array<Object>} insights – Insights from InsightGenerator.
 * @param {Object} [userGoals] – Structured goal objects (optional).
 * @returns {Array<Object>} Ranked list of recommendation objects.
 *
 * Each recommendation object MAY contain:
 *   {
 *     id: string,
 *     title: string,            // action headline
 *     description: string,      // why it matters
 *     priority: number,         // higher = more urgent/important
 *     effortEstimate: string,   // e.g., '5 min', '1 hour', '1 day'
 *     expectedImpact: string,   // brief benefit description or metric reference
 *     relatedInsightIds: [],    // link back to originating insight IDs
 *     action: {                 // concrete step the system can suggest
 *       type: string,           // e.g., 'log', 'schedule', 'review', 'adjust'
 *       payload: {}             // data needed to execute the action (e.g., {date, duration})
 *     }
 *   }
 *
 * Rules:
 * - Pure, deterministic, side‑effect free.
 * - Do **not** modify domain data – only suggest actions.
 * - If no recommendations, return [].
 */
function generate(context, insights, userGoals) { ... }

module.exports = { RecommendationEngine };
```

---

## 3. Dependency Rules (Layer Boundaries)

| Direction | Allowed? | Explanation |
|-----------|----------|-------------|
| **Domain → Core** | ✅ | Services expose DTO getters; Core reads them via ContextAggregator. |
| **Core → Domain** | ❌ | Core **must not** call service mutators (create/update/delete) or directly touch Mongoose models. It only computes and returns values. |
| **Controller → Core** | ✅ | Controllers may import core utilities to enrich API responses (e.g., attach insights to a GET response). |
| **Controller → Domain** | ✅ | Standard service calls for CRUD operations. |
| **Core → Controller** | ❌ | Core must never know about Express, routes, or HTTP. It returns plain data only. |
| **Domain ←←→ Domain** | ❌ (direct) | Domains should **not** call each other’s services. Communication must go through Core (context) or via events/messaging if needed later. |

**Violation Examples (to avoid)**
- A service doing `const { RecommendationEngine } = require('../core/recommendations'); ... engine.generate(...); userRecord.field = ...;` – mutating domain data from core.
- A controller putting business logic (e.g., GPA calculation) instead of delegating to a service or core analytics.
- Core importing `../services/AcademicProgressService` and calling `updateAcademicProgress`.

---

## 4. How a Domain Module Uses the Core (Typical Pattern)

1. **Fetch data** (inside a service method):
   ```js
   const { ContextAggregator } = require('../core/life-context');
   const { AnalyticsProcessor } = require('../core/analytics');
   const { InsightGenerator } = require('../core/insights');
   const { RecommendationEngine } = require('../core/recommendations');

   async function getEnrichedProgress(userId) {
     // 1. Build holistic context
     const context = await ContextAggregator.build(userId);

     // 2. Compute metrics (optional)
     const metrics = AnalyticsProcessor.process(context);

     // 3. Generate insights
     const insights = InsightGenerator.generate(context, metrics);

     // 4. Produce recommendations (if goals are known)
     const recommendations = RecommendationEngine.generate(context, insights, userGoals);

     // 5. Return enriched payload (DTO + intelligence)
     return {
       progress: progressDTO,          // from your own service
       context,                        // optional: for debugging
       metrics,
       insights,
       recommendations
     };
   }
   ```

2. **Controller uses enriched payload**:
   ```js
   const progressService = require('../services/AcademicProgressService');

   async function getProgress(req, res) {
     try {
       const enriched = await progressService.getEnrichedProgress(req.user.userId);
       res.json({ success: true, data: enriched });
     } catch (err) {
       // errorHandler will format correctly
       next(err);
     }
   }
   ```

---

## 5. Testing Guidance

- **Unit tests** for each core class should supply mocked context objects and assert the shape of the output.
- **Integration tests** can spin up a test DB, populate sample data via real services, then call the full pipeline (`context → analytics → insights → recommendations`) and verify non‑empty, schema‑conforming results.
- **No external calls** – core tests must not hit networks, filesystems, or databases (except via mocked service stubs).

---

## 6. Extending Core When a New Module Arrives

1. Ensure the new module exposes a **DTO getter** (e.g., `HealthService.getHealthSnapshot(userId)`).
2. Update `ContextAggregator.build()` to call that getter and merge its result under a sensible key (e.g., `health`).
3. Existing **AnalyticsProcessor**, **InsightGenerator**, and **RecommendationEngine** automatically receive the new data – no changes needed unless you want domain‑specific metrics or insights.

---

## 7. Summary of Rules

- **Core is pure**: no side effects, no direct data mutation.
- **Data flows one‑way**: Domain → Core → (Analytics/Insights/Recommendations) → Controllers/UI.
- **Controllers stay thin**: they delegate business logic to services and may call core for enrichment.
- **Never let core know about HTTP, Express, or persistence**.
- **Always return plain, serializable objects** – safe for JSON transport and caching.

Follow these contracts and the Intelligence Layer will remain a reliable, testable foundation that can evolve with ATLAS for decades.

--- 

*Keep this document up‑to‑date as the interfaces evolve.*