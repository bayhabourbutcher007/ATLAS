# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in the ATLAS repository.

## Project Vision

ATLAS (Adaptive Tracking and Life Analytics System) is a personal Life Operating System designed to empower individuals to take control of their personal growth by providing a unified platform to track, analyze, and improve key life domains. The vision is to create an intelligent, privacy-first system that helps users make data-driven decisions about their health, finances, education, career, and personal development.

## Current Features (Implemented)

As of July 27, 2026, the following core infrastructure has been implemented:

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

## Today's Progress (July 27, 2026) - Phase 5C.1

- **Completed:** Phase 5C.1 – Created CorrelationAnalyzer component and integrated it into the analytics pipeline.
  - Created: src/core/analytics/CorrelationAnalyzer.js (detects cross-domain correlations between metrics)
  - Updated: src/core/analytics/AnalyticsProcessor.js (added correlation analysis after trend analysis when history is enabled)
  - Updated: src/core/analytics/index.js (exported CorrelationAnalyzer)
  - Created: tests/analytics/CorrelationAnalyzer.test.js (comprehensive test suite for the correlation analyzer)
- **Current project state:** Intelligence Layer pipeline now includes correlation analysis step: AnalyticsProcessor → TrendAnalyzer → CorrelationAnalyzer → InsightGenerator → InsightScorer → RecommendationEngine. All tests pass.
- **Verification:** 
  - All existing tests continue to pass (no regressions).
  - New correlation analyzer tests pass.
  - Core brain test passes (uses fake analytics processor, unaffected).
- **Next steps:** Proceed to Phase 5C.2 – refine correlation analysis and begin integration with insight generation for predictive insights.

## Today's Progress (July 26, 2026)

- Implemented Insight Metadata and Scoring Foundation (Phase 5B.2) to enrich insights with metadata and prioritization scores.
- Created:
  - src/core/insights/InsightScorer.js (scoring logic for insights)
  - tests/insights/InsightScorer.test.js (comprehensive test suite for the scorer)
- Updated:
  - src/core/insights/InsightGenerator.js (refactored into modular generators and integrated InsightScorer to add domain, impact, urgency, dataQuality, basedOnMetrics, and score fields)
- Verified integration by running existing tests to ensure backward compatibility:
  - tests/coreBrainTest.test.js passes (end-to-end pipeline: AnalyticsProcessor → TrendAnalyzer → InsightGenerator → InsightScorer → RecommendationEngine)
  - tests/recommendations/RecommendationEngine.test.js passes (17/17)
  - All new InsightScorer tests pass (15/15)
  - Related component tests (TrendAnalyzer, analytics processor trends) remain passing
- All code follows existing patterns, naming conventions, and coding standards.

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
  - Modified: src/core/life-context/index.js (export HistoricalContextBuilder), src/services/UserService.js (addUserHistory), src/services/AcademicProgressService.js (addAcademicHistory), src/services/FinanceService.js (addFinanceHistory), src/services/SkillService.js (addSkillHistory), src/services/HealthService.js (addHealthHistory), src/services/CareerService.js (addCareerHistory), src/services/TimeService.js (getTimeHistory), src/services/EmotionalStateService.js (getEmotionalStateHistory)
- **Current project state:** Core data collection modules are complete; the Historical Layer foundation is in place, enabling time-series context building for the Intelligence Layer.
- **Bugs fixed:** None.
- **Next recommended step:** Proceed to Phase 3B – implement a background snapshot worker (cron job) to periodically populate the snapshot collections, then enhance the Analytics Processor for trend analysis.

## Current Development Phase

Core data collection modules completed.

Current focus:
Intelligence Layer - Phase 5B complete, Phase 5C.1 complete

Next:
Phase 5C.2 – Advanced Pattern Recognition (refinement and integration)

## Next Session Starting Point

Current stable state:
- All tests passing
- No known regressions
- Intelligence layer foundation complete
- Phase 5C.1 (Correlation Analyzer) completed

Next planned phase:
Phase 5C.2 – Advanced Pattern Recognition

Planned features:
- Refinement of correlation analysis
- Integration of correlation insights into insight generation
- Preliminary predictive analytics

## Completed

�User
-

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
✅ Insight Generator (src/core/insights/InsightGenerator.js) - Generates insights from multi‑module data (now modular, includes metadata/scoring via InsightScorer, and uses configurable thresholds)
✅ Insight Scorer (src/core/insights/InsightScorer.js) - Adds domain, impact, urgency, data quality, basedOnMetrics, and overall score to insights
✅ Recommendation Engine (src/core/recommendations/RecommendationEngine.js) - Converts insights to actionable recommendations

## Supporting Utilities (for Intelligence Layer)

✅ Insight Thresholds (src/core/insights/InsightThresholds.js) - Configuration for insight generation thresholds
✅ Insight Comparison (src/core/insights/InsightComparison.js) - Historical comparison utilities for trend analysis

## Session Summary (July 26, 2026)

- **Completed:** Step 1 of Phase 5B enhancement – added new positive insight generators for stress improvement, expense ratio improvement, academic improvement (GPA and study hours), and net worth improvement.
- **Files created:**
  - Created: tests/insights/InsightGenerator.test.js
- **Files updated:**
  - Updated: src/core/insights/InsightGenerator.js (added _generatePositiveStressInsights, _generatePositiveFinanceInsights, _generatePositiveAcademicInsights, _generatePositiveNetWorthInsights, and updated _positives to call them)
- **Current project state:** InsightGenerator now generates positive reinforcement insights for stress, expense ratio, GPA, study hours, and net worth improvements, in addition to existing insights. All tests pass.
- **Verification:** 
  - New insight generator tests pass (8/8).
  - Existing core brain test passes.
  - Existing recommendation engine test passes.
  - No regressions in existing insight-related tests.
- **Next steps:** Proceed to Step 2 – enhance goal milestone detection with encouragement for >90% progress and acceleration detection.

## Session Summary (July 27, 2026)

- **Completed:** Implemented Advanced Insight Generation Foundation (Phase 5B.3) that adds positive reinforcement insights, adaptive thresholds, and historical comparison utilities to the InsightGenerator.
- **Files created:**
  - Created: src/core/insights/InsightThresholds.js
  - Created: src/core/insights/InsightComparison.js
  - Created: tests/insights/InsightThresholds.test.js
  - Created: tests/insights/InsightComparison.test.js
- **Files updated:**
  - Updated: src/core/insights/InsightGenerator.js (added positive insight generators, integrated thresholds, and used InsightComparison for positive insights)
- **Current project state:** Intelligence Layer pipeline now produces enriched insights with positive reinforcement, adaptive thresholds, and historical comparisons, ready for scoring and recommendation.
- **Verification:** All relevant tests pass (core brain test, recommendation engine test, new insight-related tests, plus existing Trend Analytics and analytics processor tests).
- **Next steps:** Enhance Insight Generator for more sophisticated pattern recognition (e.g., cross-domain correlations, predictive insights) and expand Pattern Detection in Analytics Processor for advanced trend analysis.

## Session Summary (July 26, 2026)

- **Completed:** Implemented Insight Metadata and Scoring Foundation (Phase 5B.2) that enriches insights with domain, impact, urgency, data quality, urgency, data quality, basedOnMetrics, and a priority score.
- **Files created:**
  - Created: src/core/insights/InsightScorer.js
  - Created: tests/insights/InsightScorer.test.js
- **Files updated:**
  - Updated: src/core/insights/InsightGenerator.js (modular insight generators and integration with InsightScorer)
- **Current project state:** Intelligence Layer pipeline now produces scored, metadata‑rich insights ready for prioritization by the Recommendation Engine.
- **Verification:** All relevant tests pass (core brain test, recommendation engine test, new insight scorer test, plus existing Trend Analytics and analytics processor tests).
- **Next steps:** Begin enhancement of Insight Generator for advanced pattern recognition (e.g., positive insights, correlations, predictive analytics) as outlined in the “Next” section above.

## Session Summary (July 25, 2026)

- **Completed:** Implemented the Recommendation Engine component (src/core/recommendations/RecommendationEngine.js) that converts insights into actionable recommendations.
- **Files created:**
  - Created: src/core/recommendations/RecommendationEngine.js
  - Created: tests/recommendations/RecommendationEngine.test.js
- **Current project state:** All eight life‑domain modules (User, Academic, Finance, Skills, Health, Career, Time, Emotional State) are connected to the Core Intelligence Layer; the Intelligence Layer components are now complete, enabling end‑to‑end insight generation and recommendation delivery.
- **Verification:** The existing core brain test (tests/coreBrainTest.test.js) passes and includes real recommendation data in the intelligence pipeline output, confirming end‑to‑end integration.
- **Next steps:** Begin enhancement of Intelligence Layer components starting with the Insight Generator for advanced pattern recognition.

## Session Summary (July 27, 2026) – Step 2 of Phase 5B Enhancement

- **Completed:** Step 2 of Phase 5B enhancement – added advanced goal milestone detection (near completion encouragement, acceleration detection, completion celebration, improved risk detection).
- **Files updated:**
  - Updated: src/core/insights/InsightGenerator.js (added _generateGoalRiskInsights, _generateGoalPositiveInsights, replaced goal stagnation block, enhanced _positives)
  - Updated: tests/insights/InsightGenerator.test.js (added tests for near completion, acceleration, completion, stagnation, low velocity, missing data, metadata)
- **Current project state:** InsightGenerator now generates intelligent goal insights including near completion warnings, acceleration positives, completion celebrations, and improved risk detection (stagnation and low velocity). All tests pass.
- **Verification:** 
  - New insight generator tests pass (all tests pass).
  - Existing core brain test passes.
  - Existing recommendation engine test passes.
  - No regressions in existing insight-related tests.
- **Next steps:** Proceed to Step 3 – improve confidence calculation across all insights and ensure subCategory metadata is uniformly applied.