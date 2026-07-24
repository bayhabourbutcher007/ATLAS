# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in the ATLAS repository.

## Project Vision

ATLAS (Adaptive Tracking and Life Analytics System) is a personal Life Operating System designed to empower individuals to take control of their personal growth by providing a unified platform to track, analyze, and improve key life domains. The vision is to create an intelligent, privacy-first system that helps users make data-driven decisions about their health, finances, education, career, and personal development.

## Current Features (Implemented)

As of July 22, 2026, the following core infrastructure has been implemented:

1. **Project Foundation** - Complete backend and frontend structure
   - Express.js server with proper middleware (security, CORS, rate limiting)
   - MongoDB/Mongoose database connection with environment configuration
   - RESTful API structure with authentication (JWT-based)
   - MVC pattern separation (controllers, services, models)
   - Input validation and error handling
   - Responsive frontend with HTML5, CSS3, and JavaScript

2. **Core Infrastructure Components**
   - User authentication system (registration, login, JWT tokens, password hashing)
   - User profile management
   - Configuration management (.env support)
   - API documentation structure
   - Development tooling (scripts, testing, linting)
   - Docker containerization support
   - Environment-specific configuration

3. **Frontend Foundation**
   - Responsive layout with modern UI/UX principles
   - Navigation system with smooth scrolling
   - Placeholder sections for all six core modules
   - Mobile-responsive design
   - Error pages (404, 500)

4. **Development & DevOps**
   - Complete package.json with scripts (dev, test, build, lint, seed)
   - ESLint configuration (Airbnb style)
   - Jest testing framework setup
   - Dockerfile and docker-compose.yml for containerization
   - Environment variable management
   - Database seeding scripts
   - .gitignore for Node.js projects
   - License (MIT) and contributing guidelines

## Today's Progress (July 22, 2026)

- Implemented the Career module following the Model → Service → Controller → Route → Validation → ContextAggregator pattern.
- Implemented Intelligence Layer V1 with rule-based analytics, insight generation, and recommendation engine.
- Created:
  - src/models/Career.js (Mongoose schema matching CareerDTO from CONTEXT_SCHEMA.md)
  - src/services/CareerService.js (service layer with methods for getting career snapshot and CRUD operations for career data)
  - src/controllers/careerController.js (RESTful controller handling career data endpoints)
  - src/routes/career.js (API routes for career data, mounted at /career)
  - src/validation/career.validation.js (Joi validation schemas for all career-related data)
  - src/core/life-context/ContextAggregator.js (integrated CareerService to provide real career data in the context snapshot)
  - src/api/routes.js (mounted career routes and updated API documentation to include /career endpoint)
- Updated:
  - src/core/life-context/ContextAggregator.js (integrated CareerService to provide real career data in the context snapshot)
  - src/api/routes.js (mounted career routes and updated API documentation to include /career endpoint)
- Verified integration by running the existing core brain test (tests/coreBrainTest.test.js) which now includes real career data in the context snapshot and passes with the new intelligence layer.
- All code follows existing patterns, naming conventions, and coding standards from the User, Academic, Finance, Skills, and Health modules.

## Today's Progress (July 23, 2026)

- Implemented the Emotional State module following the Model → Service → Controller → Route → Validation → ContextAggregator pattern.
- Created:
  - src/models/EmotionalState.js (Mongoose schema matching EmotionalStateDTO from CONTEXT_SCHEMA.md)
  - src/services/EmotionalStateService.js (service layer with getEmotionalStateSnapshot, CRUD operations, and DTO transformation)
  - src/controllers/emotionalStateController.js (RESTful controller for emotional state management)
  - src/routes/emotionalState.js (API routes for emotional state data)
  - src/validation/emotionalState.validation.js (Joi validation schemas for all emotional state-related data)
- Updated:
  - src/core/life-context/ContextAggregator.js (integrated EmotionalStateService to provide real emotional state data in the context snapshot)
  - src/api/routes.js (mounted emotionalState routes and updated API documentation to include /emotionalState endpoint)
- Verified integration by running the core brain test (tests/coreBrainTest.test.js) which now includes emotional state data in the context snapshot and passes.
- All code follows existing patterns, naming conventions, and coding standards from the User, Academic, Finance, Skills, Health, Career, and Time modules.

## Today's Progress (July 23, 2026) – Continued

- Completed Phase 3A of the Historical Layer: added snapshot models and history methods to all domain services.
- Created snapshot models: UserSnapshot, AcademicSnapshot, FinanceSnapshot, SkillSnapshot, HealthSnapshot, CareerSnapshot, TimeSnapshot (EmotionalState already timestamped).
- Added history methods to each service: get<Model>History(userId, options) returning arrays of DTOs for a date range (raw interval only).
- Updated src/core/life-context/index.js to export HistoricalContextBuilder.
- No changes to ContextAggregator or existing snapshot methods; real‑time flows remain intact.
- All new and modified files pass syntax checks and can be required without error.

## Current Development Phase

Core data collection modules completed.

Current focus:
Intelligence Layer

Next:
1. Insight Generator (src/core/insights/InsightGenerator.js) - Enhance pattern recognition and insight generation algorithms
2. Recommendation Engine (src/core/recommendations/RecommendationEngine.js) - Improve recommendation logic and action specificity
3. Pattern Detection (src/core/analytics/AnalyticsProcessor.js) - Extend correlation analysis and trend detection capabilities

## Completed Modules

✅ User
✅ Academic
✅ Finance
✅ Skills
✅ Health
✅ Career
✅ Time
✅ Emotional State

## Next Development Phase

Work is currently focused on enhancing the Intelligence Layer components:
- **Enhancing**: Insight Generator (src/core/insights/InsightGenerator.js) for advanced pattern recognition and contextual insight generation
- **Improving**: Recommendation Engine (src/core/recommendations/RecommendationEngine.js) for more specific, actionable recommendations based on enhanced insights
- **Expanding**: Pattern Detection capabilities in Analytics Processor (src/core/analytics/AnalyticsProcessor.js) to identify cross-domain correlations and temporal trends
- **Integrating**: Ensuring seamless data flow from all 8 domain modules through ContextAggregator → Analytics Processor → Insight Generator → Recommendation Engine

## Session Summary (July 22, 2026)

- **Completed:** Implemented the Career module (model, service, controller, routes, validation) and integrated it into the Core Intelligence Layer via ContextAggregator.
- **Files created/modified:**
  - Created: src/models/Career.js, src/services/CareerService.js, src/controllers/careerController.js, src/routes/career.js, src/validation/career.validation.js
  - Modified: src/core/life-context/ContextAggregator.js (added CareerService call), src/api/routes.js (added career routes and updated API documentation)
- **Current project state:** Six life‑domain modules (User, Academic, Finance, Skills, Health, Career) are now connected to the Core Intelligence Layer; the foundation is ready for the Time module.
- **Verification:** The existing core brain test (tests/coreBrainTest.test.js) passes and includes real career data in the context snapshot, confirming end‑to‑end integration.
- **Next steps:** Proceed with implementing the Time module following the same pattern.


## Session Summary (July 23, 2026)

- **Completed:** Implemented the Emotional State module (model, service, controller, routes, validation) and integrated it into the Core Intelligence Layer via ContextAggregator.
- **Files created/modified:**
  - Created: src/models/EmotionalState.js, src/services/EmotionalStateService.js, src/controllers/emotionalStateController.js, src/routes/emotionalState.js, src/validation/emotionalState.validation.js
  - Modified: src/core/life-context/ContextAggregator.js (added EmotionalStateService call), src/api/routes.js (added emotionalState routes and updated API documentation)
- **Current project state:** All eight life-domain modules (User, Academic, Finance, Skills, Health, Career, Time, Emotional State) are now connected to the Core Intelligence Layer; the foundation is complete for the Intelligence Layer to provide comprehensive insights and recommendations.
- **Verification:** The existing core brain test (tests/coreBrainTest.test.js) passes and includes real emotional state data in the context snapshot, confirming end-to-end integration.
- **Next steps:** Begin enhancement of Intelligence Layer components starting with the Insight Generator.

## Session Summary (July 23, 2026) – Continued

- **Completed:** Phase 3A of the Historical Layer: added snapshot models and history methods to all domain services.
- **Files created/modified:**
  - Created: src/core/life-context/HistoricalContextBuilder.js, src/models/UserSnapshot.js, src/models/AcademicSnapshot.js, src/models/FinanceSnapshot.js, src/models/SkillSnapshot.js, src/models/HealthSnapshot.js, src/models/CareerSnapshot.js, src/models/TimeSnapshot.js
  - Modified: src/core/life-context/index.js (export HistoricalContextBuilder), src/services/UserService.js (added getUserHistory), src/services/AcademicProgressService.js (added getAcademicHistory), src/services/FinanceService.js (added getFinanceHistory), src/services/SkillService.js (added getSkillHistory), src/services/HealthService.js (added getHealthHistory), src/services/CareerService.js (added getCareerHistory), src/services/TimeService.js (getTimeHistory), src/services/EmotionalStateService.js (getEmotionalStateHistory)
- **Current project state:** Core data collection modules are complete; the Historical Layer foundation is in place, enabling time‑series context building for the Intelligence Layer.
- **Bugs fixed:** None.
- **Next recommended step:** Proceed to Phase 3B – implement a background snapshot worker (cron job) to periodically populate the snapshot collections, then enhance the Analytics Processor for trend analysis.