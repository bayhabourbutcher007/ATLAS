# ATLAS Developer Guide

_A Handbook for Contributors_

---

## 1. Folder Structure

```
ATLAS/
├─ src/                     # Application Code                 ├─ api/                  Router files for various parts of   
 the application.
 │ 
 ┣ auth.js                 # Auth endpoints Register login logout
 │ 
 ┣ knowledgeGraph.js       # Placeholder
 │ 
 ┣ notebook.js             # Placeholder
 │ 
 ┣ planner.js              # Placeholder
 │ 
 ├ progress.js             # Placeholder
 │ 
 ┣ quiz.js                 # Placeholder
 │ 
 ┣ collaboration.js        # Placeholder
 │ 
 ┗ routes.js               # Mounts all modules to /api/v1
│ 
 ├─ config/
 └──── config.js          # Environment variables, constants
│ 
 ├─ controllers/
 └──── [module]Controller.js   # Thin request/response layer; calls Service │ 
│ 
 ├─ middleware/
 ├───── authMiddleware.js      # JWT validation & attachment to req.user
 ├───── validation.js          # Generic Joi validation middleware wrapper
 ├───── errorHandler.js        # Centralised error handling with custom errors
 ├───── apiVersionMiddleware.js# Adds API-Version header
 ├───── validationMiddleware.js# Express‑validator wrapper (legacy) – being phased out
 │ 
 ├─ models/
 └───── [module].js               # Mongoose schemas, indexes, instance methods │ 
│ 
 ├─ services/
 └───── [module]Service.js        # Business logic only; talks to Model; returns DTOs │ 
│ 
 ├─ utils/
 └───── errors.js                 # Custom error classes (AppError, ValidationError, etc.)
│ 
 ├─ validation/
 └───── [module].validation.js    # Joi schemas for request/response payloads (DTO-like)
│ 
 ├─ core/
 └───── Intelligence Layer (read‑only, side‑effect free)
 ├───── analytics/
 │      ├─ AnalyticsProcessor.js  # Computes metrics/KPIs from context
 │      └─ index.js
 │ 
 ├───── insights/
 │      ├─ InsightGenerator.js    # Generates human‑readable insights from context + metrics
 │      └─ index.js
 │ 
 ├───── life‑context/
 │      ├─ ContextAggregator.js   # Pulls DTOs from services → builds unified context
 │      └─ index.js
 │ 
 ├───── recommendations/
 │      ├─ RecommendationEngine.js# Turns insights & user goals into prioritized actions
 │      └─ index.js
 │ 
 └───── index.js                 # Re‑exports the four building blocks
│ 
 ├─ public/
 └───── index.html, css/, js/      # Static frontend (currently marketing page)│ 
│ 
 ├─ test/
 └───── (Jest tests – add unit/integration tests for new code)│ 
│ 
 ├─ docs/
 └───── (Project documentation – vision, principles, architecture, roadmap, etc.)│ 
│ 
 ├─ scripts/
 └───── (Utility scripts – e.g., seedDatabase.js)│ 
│ 
 ├─ .gitignore
 ├─ package.json
 ├─ Dockerfile
 ├─ docker-compose.yml
 └─ README.md
```

---

## 2. Coding Rules

| Rule | Description |
|------|-------------|
| **Service‑Layer First** | All business logic lives in `src/services/*Service.js`. Controllers must be thin – they only validate input, call the service, and format the response. |
| **DTO Over Models** | Services must return **plain JavaScript objects** (Data Transfer Objects). Never return raw Mongoose documents – strip `_id`, `__v`, and other internal fields. |
| **Validation** | Use Joi schemas from `src/validation/`. Attach them via the generic `validation.js` middleware (e.g., `validate(schema, 'body')`). Do not mix Joi and express‑validator in the same module. |
| **Error Handling** | Throw the predefined custom errors from `src/utils/errors.js` (`ValidationError`, `AuthenticationError`, `NotFoundError`, `ConflictError`, `RateLimitError`). The centralized `errorHandler` will map them to the correct HTTP status. Never throw a generic `Error` unless you intend a 500. |
| **Async/Await** | Use `async/await` for all asynchronous operations. Do not mix callbacks or `.then()` unless wrapping a library that only offers promises. |
| **No Side Effects in Core** | The `src/core` folder is the Intelligence Layer. It must **never** call a service mutator (create/update/delete) or touch the database. It only reads data via the Context Aggregator and returns plain objects. |
| **Immutable Data Flow** | Data flows **Domain → Core → (Analytics/Insights/Recommendations) → Controller → Client**. Never let Core modify domain data, and never let a Controller contain intelligence logic. |
| **Naming Conventions** | Use *camelCase* for variables and functions. *PascalCase* for classes and constructors. File names match the exported class/function (e.g., `AcademicProgressService.js`). |
| **Comments** | Write JSDoc‑style comments for every public class and method (`/** ... */`). Explain purpose, params, return values, and any thrown errors. |
| **Logging** | Do not use `console.log` in production code. Use the logger (once added) – for now, limit console output to debugging and remove before commit. |
| **Security** | Never hard‑code secrets. Use environment variables via `process.env`. Always validate and sanitize input (Joi). Use `helmet`, `cors`, and rate‑limiter (already configured). |
| **Testing** | Every new service method should have at least one unit test. When you add a route, add an integration test (using `supertest`) that verifies the response shape and status codes. |
| **Linting** | Run `npm run lint` before committing. Fix any ESLint errors. Use `npm run lint:fix` for auto‑fixable issues. |
| **Commit Messages** | Use the conventional format: `type(scope): short description`. Example: `feat(auth): add refresh‑token endpoint`. |

---

## 3. How to Create a New Module (e.g., Finance)

Follow these steps **exactly** to keep the architecture consistent.

### 3.1. Create the Model
`src/models/Finance.js`
```js
// src/models/Finance.js
const mongoose = require('mongoose');

const financeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  // Example fields – adjust to your domain
  accounts: [{
    id: { type: String, required: true },
    name: { type: String, required: true },
    type: { type: String, enum: ['checking','savings','credit','investment','loan'], required: true },
    balance: { type: Number, default: 0 },
    currency: { type: String, default: 'USD' },
    institution: { type: String },
    lastUpdated: { type: Date, default: Date.now }
  }],
  // … more fields as needed
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes
financeSchema.index({ userId: 1 });

// Instance methods (optional)
// financeSchema.methods.someHelper = function () { ... };

module.exports = mongoose.model('Finance', financeSchema);
```

### 3.2. Create the Service
`src/services/FinanceService.js`
```js
// src/services/FinanceService.js
const Finance = require('../models/Finance');
const { ValidationError, NotFoundError, ConflictError } = require('../utils/errors');

class FinanceService {
  /**
   * Get the finance snapshot for a user (DTO) – used by Core.
   * @param {string} userId
   * @returns {Promise<Object>} FinanceDTO (plain object)
   */
  static async getFinanceSnapshot(userId) {
    try {
      const finance = await Finance.findOne({ userId }).lean(); // lean() returns plain object
      if (!finance) {
        // Return an empty/default structure – Core expects the key to exist
        return this._emptyFinanceDTO();
      }
      // Convert Mongoose document to a clean DTO (remove internal fields)
      return this._toFinanceDTO(finance);
    } catch (error) {
      if (error instanceof ValidationError || error instanceof NotFoundError) {
        throw error;
      }
      throw new Error('Failed to retrieve finance snapshot');
    }
  }

  // Example mutator – create/update/delete as needed
  static async updateFinance(userId, updateData) {
    // … validation, update logic …
  }

  /* ----- Helper methods (private) ----- */
  static _toFinanceDTO(doc) {
    // Remove Mongoose metadata and shape the object exactly as the Core expects
    return {
      // Example – adjust to match your schema in CONTEXT_SCHEMA.md
      overview: {
        income: { monthly: 0, annual: 0, sources: [] },
        expenses: {
          monthly: 0,
          annual: 0,
          categories: {
            housing: 0, food: 0, transport: 0, utilities: 0,
            education: 0, entertainment: 0, health: 0, misc: 0
          }
        },
        netWorth: doc.netWorth ?? 0,
        savingsRate: doc.savingsRate ?? 0,
        emergencyFundMonths: doc.emergencyFundMonths ?? 0
      },
      accounts: (doc.accounts ?? []).map(acc => ({
        id: acc.id,
        name: acc.name,
        type: acc.type,
        balance: acc.balance,
        currency: acc.currency,
        institution: acc.institution ?? '',
        lastUpdated: acc.lastUpdated ? new Date(acc.lastUpdated).toISOString() : null
      })),
      debts: [],
      budgets: [],
      goals: [] // if you store goals elsewhere, map them here
    };
  }

  static _emptyFinanceDTO() {
    return {
      overview: {
        income: { monthly: 0, annual: 0, sources: [] },
        expenses: {
          monthly: 0,
          annual: 0,
          categories: {
            housing: 0, food: 0, transport: 0, utilities: 0,
            education: 0, entertainment: 0, health: 0, misc: 0
          }
        },
        netWorth: 0,
        savingsRate: 0,
        emergencyFundMonths: 0
      },
      accounts: [],
      debts: [],
      budgets: [],
      goals: []
    };
  }
}

module.exports = FinanceService;
```

### 3.3. Create the Validation Schemas
`src/src/validation/finance.validation.js`
```js
// src/validation/finance.validation.js
const Joi = require('joi');

// Example schema for creating/updating a finance record (adjust as needed)
const financeSchema = Joi.object({
  accounts: Joi.array().items(
    Joi.object({
      id: Joi.string().required(),
      name: Joi.string().required(),
      type: Joi.string().valid('checking','savings','credit','investment','loan').required(),
      balance: Joi.number().min(0),
      currency: Joi.string().default('USD'),
      institution: Joi.string().allow(''),
      lastUpdated: Joi.date()
    })
  ),
  // add other top‑level fields as needed
});

module.exports = { financeSchema };
```

### 3.4. Create the Controller
`src/controllers/financeController.js`
```js
// src/controllers/financeController.js
const FinanceService = require('../services/FinanceService');
const { validate } = require('../middleware/validation');
const { financeSchema } = require('../validation/finance.validation');

// Validation middleware (example)
const validateFinance = validate(financeSchema, 'body');

class FinanceController {
  /**
   * GET /finance/snapshot – returns the finance DTO (used by Core or frontend)
   */
  async getFinanceSnapshot(req, res) {
    try {
      const snapshot = await FinanceService.getFinanceSnapshot(req.user.userId);
      res.json({ success: true, message: 'Finance snapshot retrieved', data: snapshot });
    } catch (err) {
      // errorHandler will format correctly
      throw err;
    }
  }

  // Example mutator endpoint
  async updateFinance(req, res) {
    try {
      const result = await FinanceService.updateFinance(req.user.userId, req.body);
      res.json({ success: true, message: 'Finance updated', data: result });
    } catch (err) {
      throw err;
    }
  }
}

module.exports = new FinanceController();
```

### 3.5. Wire the Route
Edit `src/api/routes.js` (or create a dedicated route file and mount it):
```js
// Inside src/api/routes.js after the const router = express.Router(); line
router.use('/finance', require('../controllers/financeController'));
```
Make sure the router is mounted under `/api/v1` in `src/app.js` (already done).

### 3.6. (Optional) Add Swagger/JSDoc annotations
Add JSDoc comments to the controller methods so the auto‑generated OpenAPI docs reflect the new endpoint.

### 3.7. Run the Linter & Tests
```bash
npm run lint
npm test
```
Fix any errors before committing.

---

## 4. How Modules Communicate with the Core

The Core (`src/core`) is **read‑only** and **side‑effect free**. Communication follows this pattern:

1. **Domain Service → Core**  
   - The service exposes a **getter** that returns a **DTO** (plain object) matching the shape defined in `docs/CONTEXT_SCHEMA.md`.  
   - Example: `FinanceService.getFinanceSnapshot(userId)` → returns a `FinanceDTO`.  
   - The service **does not** call any core function; it simply provides data.

2. **Core → Domain Services** (via Context Aggregator)  
   - The `ContextAggregator.build(userId)` (inside `src/core/life-context/ContextAggregator.js`) **imports each domain service’s getter** and calls it.  
   - It merges the returned DTOs into a single **context snapshot** object whose keys are the module names (`user`, `goals`, `academics`, `finance`, `skills`, `health`, `career`, `time`, `emotional_state`, `metadata`).  
   - If a domain has not been implemented yet, the aggregator supplies an **empty/default structure** so the schema stays complete.

3. **Core → Analytics / Insights / Recommendations**  
   - The snapshot (and optionally the output of `AnalyticsProcessor.process(context)`) is passed to:  
     * `InsightGenerator.generate(context, analytics)` → returns an array of insight objects.  
     * `RecommendationEngine.generate(context, insights, userGoals)` → returns an array of recommendation objects.  
   - These functions are **pure** – they read the input, compute/output, and never modify the database or call services.

4. **Controller (or scheduled job) → Core**  
   - A service method (or a controller) may call the aggregator, then the analytics/insight/recommendation steps, and attach the results to the response:  
     ```js
     const context = await ContextAggregator.build(userId);
     const metrics   = AnalyticsProcessor.process(context);
     const insights  = InsightGenerator.generate(context, metrics);
     const recs      = RecommendationEngine.generate(context, insights, userGoals);
     return { ...dto, insights, recommendations };
     ```

### Key Rules
| Direction | Allowed? | Reason |
|-----------|----------|--------|
| Domain → Core (getter) | ✅ | Core needs data but must not mutate it. |
| Core → Domain (mutater) | ❌ | Core must stay read‑only; mutation belongs to services. |
| Core → Controller (direct call) | ❌ | Core must not know about Express/HTTP; it returns plain data only. |
| Controller → Core | ✅ | Controllers may enrich responses with intelligence. |
| Module ↔ Module (direct) | ❌ | Communication must go through the Core to avoid tangled dependencies. |

---

## 5. Naming Conventions

| Item | Convention |
|------|------------|
| **Files & Classes** | `PascalCase` matching the exported class/function (e.g., `AcademicProgressService.js` exports class `AcademicProgressService`). |
| **Constants** | `UPPER_SNAKE_CASE` (e.g., `DEFAULT_PAGE_SIZE`). |
| **Variables & Functions** | `camelCase`. |
| **Database Fields** | `snake_case` (Mongoose will convert to camel in JS objects, but keep schema definitions snake for consistency with MongoDB). |
| **Environment Variables** | `UPPER_SNAKE_CASE` prefixed with `ATLAS_` if needed (e.g., `ATLAS_JWT_SECRET`). |
| **API Endpoints** | Use kebab‑case in the URL (`/api/v1/finance/snapshot`). |
| **Event Names (if any)** | `kebab-case` or `camelCase` depending on context, but keep consistent within the file. |
| **Test Files** | Same name as the source file with `.test.js` suffix (`financeService.test.js`). |
| **Documentation** | `kebab-case` for markdown files (`developer-guide.md`). |

---

##`). |

---

## 6. What Developers Should **IDL/DTO field names** – use `camelCase` (e.g., `savingsRate`, `hoursPerNight`). This matches the JSON that will travel over HTTP.

---

## 7. What Developers Should Never Do

| ❌ Never Do | Why |
|------------|-----|
| **Put business logic in controllers** | Controllers must stay thin; logic belongs in services. Breaks separation of concerns and makes testing harder. |
| **Return raw Mongoose documents from services** | Exposes internal fields (`__v`, `_id` as ObjectId) and ties the API shape to the database schema. Always return a clean DTO. |
| **Mix Joi and express‑validator validation** | Leads to confusion and duplicate effort. Stick to Joi via the generic `validation.js` middleware. |
| **Call another service’s mutator directly from a service** | Creates hidden dependencies and bypasses the Core’s read‑only guarantee. Use the Core (context) if you need data from another domain. |
| **Modify the database or call service mutators from inside `src/core`** | Core is the Intelligence Layer – it must be pure, side‑effect free, and testable. Any mutation invalidates that guarantee. |
| **Hard‑code secrets, API keys, or database URLs** | Use environment variables (`process.env`). Never commit them to the repo. |
| **Use `console.log` for production logging** | It clutters output and lacks log levels. Once a logger is added, use it; otherwise remove console statements before merging. |
| **Skip validation on incoming request bodies** | Always validate with Joi schemas; otherwise you risk injection, malformed data, and security issues. |
| **Ignore error types and throw generic `Error`** | The centralized error handler relies on specific custom error classes to map to correct HTTP statuses. Generic errors become 500s and hide the real problem. |
| **Expose routes without authentication (when they should be protected)** | Every endpoint that touches user data must be guarded by `authMiddleware` (or a role‑based variant). |
| **Neglect to update `docs/CONTEXT_SCHEMA.md` when adding a new field to a DTO** | The Core’s contract depends on this schema; outdated docs cause integration failures. |
| **Commit code that fails `npm run lint` or `npm test`** | The CI will break; keep the build green. |
| **Assume the frontend will always be a specific framework** | Keep the API contract stable; the frontend may change (vanilla, React, etc.) but the API should not. |
| **Add business logic to the Core (AnalyticsProcessor, InsightGenerator, RecommendationEngine)** beyond pure functions. | These must stay pure and side‑effect free to guarantee testability and reproducibility. |
| **Forget to add unit and integration tests** | Untested code is a liability. Write tests alongside implementation. |
| **Leave `TODO`s or commented‑out code in production** | Clean up before merging; use issue trackers for future work. |

---

## 8. Quick Checklist Before Submitting a Pull Request

- [ ] All new files follow the naming conventions.  
- [ ] Business logic is in a `*Service.js` file.  
- [ ] Controller is thin (validation → service → response).  
- [ ] Service returns plain DTOs (no Mongoose metadata).  
- [ ] Validation uses Joi schemas from `src/validation/`.  
- [ ] Errors thrown are from `src/utils/errors.js`.  
- [ ] No `console.log` statements left in production code.  
- [ ] `npm run lint` passes (fix any errors).  
- [ ] `npm test` passes (add/update tests as needed).  
- [ ] Documentation updated (`docs/CONTEXT_SCHEMA.md` if DTO shape changed, `docs/CORE_INTERACTION.md` if the Core contract changed, and any relevant module‑specific README).  
- [ ] If adding a new module, you have: Model, Service, Validation schemas, Controller, Route entry, and (if you want it to feed the Core) a getter method (`get*Snapshot`) that the Context Aggregator can call.  
- [ ] Core remains read‑only: you did **not** modify any file inside `src/core` to call a service mutator or touch the database.  

---

## 9. Getting Started (for newcomers)

1. **Clone the repo** and install dependencies:  
   ```bash
   git clone <repo-url>
   cd ATLAS
   npm install
   ```
2. **Set up environment**: copy `.env.example` to `.env` and fill in values (MongoDB URI, JWT secret, PORT, etc.).  
3. **Run the dev server**:  
   ```bash
   npm run dev   # uses nodemon
   ```
4. **Explore the existing modules**: look at `src/services/AcademicProgressService.js`, `src/controllers/academicProgressController.js`, and `src/routes/academicProgress.js` as a reference.  
5. **When you’re ready to add a module**, follow the **“How to Create a New Module”** section above.  
6. **Run tests** frequently: `npm test`.  
7. **Ask for help** – tag the maintainers or drop a question in the project’s Discord/Slack (if any).  

---

### Remember the Guiding Question

> **“Does this feature help the user make a better decision?”**

If the answer is **no** or **unclear**, revisit the design. ATLAS exists to reduce decision fatigue, reveal hidden connections, and give users a calm, intelligent view of their life – not to add more checkboxes, streaks, or ads.

Happy coding, and thank you for contributing to ATLAS!