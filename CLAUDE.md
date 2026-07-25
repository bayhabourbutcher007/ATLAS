# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in the ATLAS repository.

## Project Vision

ATLAS (Adaptive Tracking and Life Analytics System) is a personal Life Operating System designed to empower individuals to take control of their personal growth by providing a unified platform to track, analyze, and improve key life domains. The vision is to create an intelligent, privacy-first system that helps users make data-driven decisions about their health, finances, education, career, and personal development.

## Current Features (Implemented)

As of July 25, 2026, the following core infrastructure has been implemented:

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

## Today's Progress (July 25, 2026)

- Implemented the Recommendation Engine component following the Model → Service → Controller → Route → Validation → ContextAggregator pattern.
- Created:
  - src/core/recommendations/RecommendationEngine.js (service layer with methods for generating recommendations from insights)
  - tests/recommendations/RecommendationEngine.test.js (comprehensive test suite covering all requirements)
- Updated:
  - No existing files were modified - the RecommendationEngine is a new standalone component that integrates with the existing intelligence layer
- Verified integration by running the existing core brain test (tests/coreBrainTest.test.js) which now includes recommendation generation in the intelligence pipeline and passes.
- All code follows existing patterns, naming conventions, and coding standards from the User, Academic, Finance, Skills, Health, Career, Time, and Emotional State modules.

## Today's Progress (July 23, 2026) – Continued

- **Completed:** Phase 3A of the Historical Layer: added snapshot models and history methods to all domain services.
- **Files created/modified:**
  - Created: src/core/life-context/HistoricalContextBuilder.js, src/models/UserSnapshot.js, src/models/AcademicSnapshot.js, src/models/FinanceSnapshot.js, src/models/SkillSnapshot.js, src/models/HealthSnapshot.js, src/models/CareerSnapshot.js, src/models/TimeSnapshot.js
  - Modified: src/core/life-context/index.js (export HistoricalContextBuilder), src/services/UserService.js (added getUserHistory), src/services/AcademicProgressService.js (addAcademicHistory), src/services/FinanceService.js (addFinanceHistory), src/services/SkillService.js (addSkillHistory), src/services/HealthService.js (addHealthHistory), src/services/CareerService.js (addCareerHistory), src/services/TimeService.js (getTimeHistory), src/services/EmotionalStateService.js (getEmotionalStateHistory)
- **Current project state:** Core data collection modules are complete; the Historical Layer foundation is in place, enabling time-series context building for the Intelligence Layer.
- **Bugs fixed:** None.
- **Next recommended step:** Proceed to Phase 3B – implement a background snapshot worker (cron job) to periodically populate the snapshot collections, then enhance the Analytics Processor for trend analysis.

## Current Development Phase

Core data collection modules completed.

Current focus:
Intelligence Layer

Next:
1. Insight Generator (src/core/insights/InsightGenerator.js) - Enhance pattern recognition and insight generation algorithms
2. Pattern Detection (src/core/analytics/AnalyticsProcessor.js) - Extend correlation analysis and trend detection capabilities

## Completed Modules

✅ User
✅ Academic
✅ Finance
✅ Skills
✅ Health
✅ Career
✅ Time
✅ Emotional State

## Intelligence Layer Components Status

✅ Context Aggregator (src/core/life-context/ContextAggregator.js) - Integrates all domain data
✅ Analytics Processor (src/core/analytics/AnalyticsProcessor.js) - Computes metrics and trends
✅ Trend Analyzer (src/core/analytics/TrendAnalyzer.js) - Statistical utilities for trend analysis
✅ Insight Generator (src/core/insights/InsightGenerator.js) - Generates insights from multi-module data
✅ Recommendation Engine (src/core/recommendations/RecommendationEngine.js) - Converts insights to actionable recommendations

## Session Summary (July 25, 2026)

- **Completed:** Implemented the Recommendation Engine component (src/core/recommendations/RecommendationEngine.js) that converts insights into actionable recommendations.
- **Files created:**
  - Created: src/core/recommendations/RecommendationEngine.js
  - Created: tests/recommendations/RecommendationEngine.test.js
- **Current project state:** All eight life-domain modules (User, Academic, Finance, Skills, Health, Career, Time, Emotional State) are connected to the Core Intelligence Layer; the Intelligence Layer components are now complete, enabling end-to-end insight generation and recommendation delivery.
- **Verification:** The existing core brain test (tests/coreBrainTest.test.js) passes and includes real recommendation data in the intelligence pipeline output, confirming end-to-end integration.
- **Next steps:** Begin enhancement of Intelligence Layer components starting with the Insight Generator for advanced pattern recognition.