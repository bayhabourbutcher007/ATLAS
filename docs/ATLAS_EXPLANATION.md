# ATLAS Architecture Explanation

_A simple guide for anyone opening this project years from now._

---

## 1. What is ATLAS?

**ATLAS (Adaptive Tracking and Life Analytics System)** is a personal life operating system.  
It gathers data from the different areas of your life (studies, money, health, work, skills, goals, etc.) and turns that raw information into clear insights and actionable recommendations.  
Think of it as a private, intelligent dashboard that helps you make better decisions without you having to juggle dozens of apps or mental spreadsheets.

---

## 2. Why does ATLAS exist?

Modern life is fragmented:
- One app for grades, another for budgeting, a third for fitness, etc.
- You constantly ask yourself: “How does staying up late affect my exam?” or “Will this new job hurt my savings?”
- Without a single view, you miss connections, feel overwhelmed, and waste energy figuring out what to do next.

ATLAS solves that by:
1. **Collecting** data from each life domain (through services and APIs).  
2. **Connecting** the dots automatically (low sleep ↔ low grades ↔ high stress ↔ spending).  
3. **Presenting** only what matters right now: one insight, one next step.  
4. **Keeping** you in control – you decide what to act on; the system never pushes gamified streaks or ads.

---

## 3. How the architecture works

ATLAS follows a clean **MVC‑style, service‑layer** pattern with an added **Intelligence (Core) Layer**.

```
+-------------------+      +-------------------+      +-------------------+
|   Controllers     |      |     Services      |      |      Models       |
| (API endpoints)  | ---> | (business logic) | ---> | (MongoDB schemas) |
+-------------------+      +-------------------+      +-------------------+
          |                         ^                         ^
          |                         |                         |
          v                         |                         |
+-------------------+               |                         |
|   Middleware      | --------------+                         |
| (auth, validation,|                                         |
|  error handling)  |                                         |
+-------------------+                                         |
          |                                                   |
          v                                                   |
+-------------------+                                         |
|    Core (Intelligence) Layer                              |
|  - ContextAggregator  (pulls DTOs from services)          |
|  - AnalyticsProcessor (computes metrics)                  |
|  - InsightGenerator   (creates human‑readable insights)   |
|  - RecommendationEngine (turns insights into actions)    |
+-------------------+                                         |
          |                                                   |
          v                                                   |
+-------------------+                                         |
|   Frontend (static HTML/JS) – consumes the API            |
+-------------------+                                         |
```

### Data flow (simplified)

1. **Client** (browser) calls an API endpoint → hits a **Controller**.  
2. Controller validates input (via Joi/Middleware) and delegates to a **Service**.  
3. Service contains **all business logic** – it talks to the **Model** (MongoDB) and returns plain JavaScript objects (**DTOs**).  
4. If the endpoint wants to enrich the response with intelligence, the Service (or a scheduled job) calls the **Core Layer**:
   - `ContextAggregator.build(userId)` → pulls the latest DTOs from every domain service (Academics, User, …) and merges them into one **context snapshot**.  
   - (Optional) `AnalyticsProcessor.process(context)` → derives metrics like savings rate, weekly study hours, etc.  
   - `InsightGenerator.generate(context, analytics)` → outputs an array of insight objects (title, description, confidence, source modules).  
   - `RecommendationEngine.generate(context, insights, userGoals)` → outputs a ranked list of recommendation objects (title, description, priority, effort, related insight IDs, suggested action).  
5. The Controller returns the final JSON to the client: `{ success, data: { …original DTO…, insights, recommendations, …} }`.  
6. Frontend receives the JSON and renders it – no business logic lives in the UI.

**Key guarantees**
- The Core never writes to the database; it’s **read‑only** and side‑effect free.  
- Services never call each other directly – they only talk through the Core (when intelligence is needed).  
- Validation, authentication, and error handling live in dedicated middleware, keeping controllers thin.

---

## 4. What each folder does

| Folder / File | Purpose |
|---------------|---------|
| `/src/controllers` | Thin endpoint handlers – validate, call service, format response. |
| `/src/services` | **Business logic** – create, read, update, delete; talk to models; expose DTO getters for the Core. |
| `/src/models` | Mongoose schemas – define DB shape, validation, indexes, instance methods (e.g., GPA calculation). |
| `/src/middleware` | Reusable Express helpers: auth, validation, error handling, API versioning, etc. |
| `/src/validation` | Joi schemas that describe the shape of incoming/outgoing data (used by middleware). |
| `/src/core` | **Intelligence Layer** – see below. |
| `/src/config` | Environment‑based configuration (DB URI, JWT secrets, etc.). |
| `/src/api` | Route definitions that wire controllers to Express (`/api/v1/auth`, `/api/v1/user`, …). |
| `/src/utils` | Shared helpers – custom error classes, error formatter, etc. |
| `/public` | Static frontend files (HTML, CSS, JS) – served directly by Express. |
| `/test` | Automated tests (Jest). |
| `/docs` | Project documentation (this file, vision, principles, API, architecture, roadmap, etc.). |
| `/scripts` | Utility scripts – e.g., database seeding. |

### Core Layer (`/src/core`) breakdown

```
src/core/
├─ index.js               // re‑exports the four building blocks
├─ analytics/
│   ├─ AnalyticsProcessor.js   // computes metrics/KPIs from context
│   └─ index.js
├─ insights/
│   ├─ InsightGenerator.js     // turns context + metrics into human‑readable insights
│   └─ index.js
├─ life-context/
│   ├─ ContextAggregator.js    // pulls DTOs from services → builds a unified context snapshot
│   └─ index.js
├─ recommendations/
│   ├─ RecommendationEngine.js // creates prioritized actions from insights & goals
│   └─ index.js
```

All core classes are **pure functions** (no side effects, deterministic) – perfect for unit testing and future replacement with more sophisticated logic (still without external AI APIs).

---

## 5. Data flow example (Academic Progress)

1. **Frontend** → `GET /api/v1/academic-progress`  
2. **Router** (`src/api/routes.js`) → forwards to `academicProgressController.js`.  
3. **Controller** calls `AcademicProgressService.getAcademicProgress(userId)`.  
4. **Service**:
   - Loads the `AcademicProgress` document from MongoDB.  
   - Converts it to a plain AcademicProgressDTO (removes Mongoose metadata).  
   - (If intelligence is needed) calls the Core:
     ```js
     const context = await ContextAggregator.build(userId);
     const metrics   = AnalyticsProcessor.process(context);
     const insights  = InsightGenerator.generate(context, metrics);
     const recs      = RecommendationEngine.generate(context, insights, userGoals);
     ```
   - Returns `{ academicProgressDTO, insights, recommendations }` (or just the DTO if no enrichment).  
5. **Controller** wraps the result in the standard `{ success, message, data }` envelope and sends JSON back.  
6. **Frontend** displays the academic data plus the insight (“Low sleep, high stress, low savings … may impair performance”) and the recommendation (“Aim for 7 h sleep, review budget, take short breaks”).

---

## 6. Current development status (as of July 2026)

- ✅ **Foundation complete**: Express server, MongoDB connection, JWT auth, role‑based access, centralized error handling.  
- ✅ **Service‑layer pattern** implemented for **AcademicProgress**, **Auth**, and **User** modules (business logic in services, thin controllers).  
- ✅ **Validation**:  
  - Auth & User – Joi‑based (via `src/middleware/validation.js`).  
  - AcademicProgress – also switched to Joi (replaced legacy express‑validator).  
- ✅ **Core Intelligence Layer** in place (`src/core`) with interfaces defined; ready to receive real data from services.  
- ✅ **API versioning** (`/api/v1`) and basic documentation endpoint (`/api-docs` via Swagger) set up.  
- ✅ **Docker** support (`Dockerfile`, `docker-compose.yml`) for reproducible dev environment.  
- ❌ **Remaining domain modules** (Finance, Skills, Health, Career, Time, Emotional State) are *not* implemented yet – they await the same service‑layer + DTO pattern.  
- ❌ **Frontend** is currently a static marketing page; it does not yet call the API or display dynamic data.  
- ❌ **Advanced intelligence** (trend detection, anomaly detection, recommendation ranking) is stubbed – currently returns empty arrays or simple hard‑coded logic in tests.  
- ❌ **Logging / monitoring** – basic console logs in error handler; no structured logger (Winston/Pino) or health‑check extension yet.  
- ❌ **Pagination, filtering, sorting** – only placeholder query params; not fully wired.  

All of the above can be tackled incrementally without changing the core contracts.

---

## 7. Future roadmap (high‑level)

| Phase | Goal | Key Milestones |
|-------|------|----------------|
| **Phase 1 – Stabilize & Standardize** | Make the existing codebase rock solid and ready for new modules. | • Finish JWT refresh‑token flow & secure cookie handling. <br>• Implement structured logging (Winston) + request IDs. <br>• Add OpenAPI/Swagger UI with full endpoint docs. <br>• Implement pagination/filtering/sorting middleware (limit, offset, sort, fields). <br>• Add a `DELETE /me` endpoint for full data erasure (privacy ownership). |
| **Phase 2 – Complete Domain Modules** | Build the remaining life‑domain services using the proven pattern. | • FinanceService (budget, accounts, debts, net worth). <br>• SkillsService (skill inventory, proficiency, learning hours). <br>• HealthService (sleep, activity, vitals, nutrition). <br>• CareerService (positions, experience, certifications). <br>• TimeService (calendar events, time zones, availability). <br>• EmotionalStateService (mood, stress, energy, focus). <br>Each module creates: Model → Service (DTO getters) → Controller (thin) → Route & Joi validation. |
| **Phase 3 – Hook Into Core** | Have each new Module’s service called automatically by the ContextAggregator. | • Update `ContextAggregator.build()` to call each new service’s getter and merge its DTO into the context snapshot under the correct key (`finance`, `skills`, `health`, …). <br>• Verify that the core’s analytics, insight, and recommendation engines receive the new data without code changes (thanks to the plain‑object contract). |
| **Phase 4 – Enrich Intelligence** | Replace stubbed core logic with meaningful, rule‑based analysis (still no external AI). | • InsightGenerator: detect common patterns (e.g., low sleep ↔ low GPA ↔ high stress, savings dip before big expense). <br>• RecommendationEngine: prioritize actions based on user‑defined goals, effort, impact. <br>• AnalyticsProcessor: compute useful KPIs (savings rate, weekly study hours, goal completion %). <br>All logic stays pure, testable, and side‑effect free. |
| **Phase 5 – Frontend Activation** | Turn the static HTML into a living client that consumes the API. | • Create a simple JS service layer (`src/public/js/api.js`) that attaches JWT, handles login/logout, fetches data from `/api/v1/*`. <br>• Build reactive views (vanilla JS or a lightweight framework like Alpine.js) that show: current metrics, insights, recommendations, and allow users to log data (e.g., quick sleep check‑in, expense entry). <br>• Use progressive disclosure: one insight + one recommendation per screen to avoid overwhelm. |
| **Phase 6 – Polish & Release** | Ensure the system feels calm, fast, and trustworthy. | • Introduce subtle motion/transitions (physics‑based) to convey a “living” interface. <br>• Add user‑definable goals and a way to mark them complete. <br>• Provide data export (JSON/CSV) and import (for migrating from other tools). <br>• Conduct usability testing with real students / young professionals. |
| **Phase 7 – Long‑Term Evolution** | Keep ATLAS relevant through life’s stages. | • Allow the system to de‑emphasize irrelevant modules automatically (e.g., after graduation, Academics less prominent). <br>• Explore optional plug‑in architecture for community‑hosted insights (still privacy‑first). <br>• Continue to follow the ATLAS Principles – every new feature must pass the “Does this help me make a better decision?” test. |

---

## 8. TL;DR – Quick cheat sheet

- **ATLAS = life‑wide decision helper.**  
- **Backend**: Node/Express → MVC + Service Layer → MongoDB.  
- **Core Intelligence**: pulls DTOs from services → makes context → generates insights → recommends actions.  
- **Frontend**: static for now; will become a thin API consumer.  
- **Current**: Auth, User, AcademicProgress services + core skeleton ready.  
- **Next**: build the remaining domain modules using the same pattern, plug them into the Core, then enrich the intelligence and UI.  

_When you return to this project in five years, look at the `src/core` folder – if the Interface files still exist and the contracts unchanged, you can safely drop in new services and the “brain” will just work._

--- 

*Keep this document handy; it’s the map any new code to the structure above, ATLAS will stay coherent, testable, and true to its vision for years to come.*