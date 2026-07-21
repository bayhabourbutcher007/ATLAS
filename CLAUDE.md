# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in the ATLAS repository.

## Project Vision

ATLAS (Adaptive Tracking and Life Analytics System) is a personal Life Operating System designed to empower individuals to take control of their personal growth by providing a unified platform to track, analyze, and improve key life domains. The vision is to create an intelligent, privacy-first system that helps users make data-driven decisions about their health, finances, education, career, and personal development.

## Current Features (Implemented)

As of July 20, 2026, the following core infrastructure has been implemented:

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

## Today's Progress (July 21, 2026)

- Updated documentation: rewrote PRODUCT_VISION.md to reflect ATLAS as a lifelong personal operating system; added ATLAS_PRINCIPLES.md; updated ROADMAP.md; added ATLAS_EXPLANATION.md, ATLAS_CURRENT_STATE.md, CORE_INTERACTION.md, CONTEXT_SCHEMA.md.
- Established the Core Intelligence Layer (`/src/core`) with interfaces for ContextAggregator, AnalyticsProcessor, InsightGenerator, RecommendationEngine.
- Connected existing domain modules (User, AcademicProgress) to the Core: modified ContextAggregator to pull real DTOs from UserService.getUserById and AcademicProgressService.getAcademicProgress, providing a live context snapshot.
- Fixed a syntax error in UserService.js (duplicate line in deleteUser method).
- Verified integration with a self‑contained test (test/coreBrainTest.js) that builds a realistic context (low sleep, upcoming exam, low savings, high stress) and generates an insight and a recommendation using the real core classes.
- No changes to existing feature code; all work is additive and documented.

## Today's Progress (July 21, 2026)

- Skills module completed
- Skill model, service, controller, routes, validation implemented
- Skills integrated into ContextAggregator
- Integration tests passed
- Git initialized
- First commit created:
  "Completed Skills module"
- GitHub repository connected

## Completed Modules

✅ User
✅ Academic
✅ Finance
✅ Skills

## Next Development Phase

Next module to implement:
Health Module

Explain that Health should follow the same architecture:
Model → Service → Controller → Route → Validation → ContextAggregator

## Next Steps

Based on the work completed to date, the immediate priority is to finish the remaining domain modules, bring the core intelligence to life, and prepare a functional frontend that consumes the API. The focus remains on delivering value through better decisions while preserving the established architecture and principles.

1. **Complete Remaining Domain Modules (Finance, Skills, Health, Career, Time, Emotional State)**
   - For each module: create Mongoose model, service layer (including a `get*Snapshot` DTO getter and any needed mutators), Joi validation schemas, thin controller, and route entry under `/api/v1`.
   - Ensure each service returns plain objects that conform to the shapes defined in `docs/CONTEXT_SCHEMA.md`.
   - Add unit tests for service/getter and validation, and integration tests (using supertest) for the exposed endpoints.

2. **Activate the Core Intelligence Layer**
   - Replace the stub implementations in `AnalyticsProcessor`, `InsightGenerator`, and `RecommendationEngine` with meaningful, pure logic:
     * `AnalyticsProcessor`: compute key metrics (savings rate, weekly study hours, goal completion %, stress‑sleep correlation, etc.).
     * `InsightGenerator`: detect recurring patterns (e.g., low sleep ↔ high stress ↔ low savings before an exam, spending spikes after income drops, skill practice uplift correlating with mood).
     * `RecommendationEngine`: prioritize actions based on impact, effort, and user‑stated goals, producing concrete, ranked suggestions.
   - Keep all functions side‑effect free and deterministic for testability.

3. **Develop a Minimal Viable Frontend**
   - Create a simple JavaScript service (`public/js/api.js`) that attaches JWT (from httpOnly cookie or localStorage) and provides helper functions (`login`, `logout`, `fetchUserContext`, `fetchInsights`, `fetchRecommendations`).
   - Build a few core views (dashboard, insight feed, recommendation card) using vanilla JavaScript or a lightweight framework (e.g., Alpine.js) that:
     * Shows the top insight and top recommendation prominently.
     * Allows the user to log quick data points (sleep hours, mood, expense) via modal forms that POST to the appropriate endpoints.
   - Ensure the UI follows the calm, living interface principles (soft colors, ample whitespace, subtle motion, no jarring animations).

4. **Strengthen Observability & Operability**
   - Integrate a structured logger (Winston or Pino) with request IDs; log incoming requests, outgoing responses, and errors.
   - Enhance the `/health` endpoint to report database connectivity, memory usage, and uptime.
   - Add rate‑limit tuning and basic HTTP security headers (Helmet is already in place).

5. **Finalize Documentation & Quality Gates**
   - Keep `docs/CONTEXT_SCHEMA.md` up‑to‑date as new DTO fields are added.
   - Update `docs/CORE_INTERFACE.md` if any core contracts evolve (they should remain stable).
   - Ensure `README.md` contains a clear getting‑started guide (clone, `npm install`, set `.env`, `npm run dev`).
   - Run `npm run lint` and `npm test` on every commit; fix any failures before merging.
   - Add a basic GitHub Actions workflow (or similar) to run lint, test, and build the Docker image on push to main.

6. **Avoid Premature Optimizations & Scope Creep**
   - Do **not** introduce AI/ML APIs, real‑time websockets, social features (leaderboards, feeds), advertising, or heavyweight frontend frameworks as hard dependencies.
   - Keep the API contract stable; the frontend may evolve, but the backend should remain usable by any client (web, mobile, CLI).

## Suggested Sections to Add

As development progresses, consider adding sections for:

### Project Setup ✓ COMPLETED
- Instructions for setting up the development environment
- Installation instructions for dependencies
- Configuration setup instructions

### Build Instructions ✓ COMPLETED
- How to build/run the application
- Development server commands
- Production build commands

### Testing ✓ PARTIAL
- How to run tests
- How to run individual tests
- Testing framework used
- Test coverage requirements

### Code Architecture
- Overview of project structure
- Key architectural decisions
- Major components/modules
- Data flow architecture
- API design patterns (if applicable)
- State management approach (if applicable)

### Common Tasks
- How to add new tracking modules
- How to update data models
- How to add new features
- How to modify existing functionality
- Database migration procedures (if applicable)

### Dependencies
- Key technologies/frameworks used
- How to manage/update dependencies
- Development vs production dependencies

### Scripts
- Useful npm/yarn scripts (if applicable)
- Custom development scripts
- Build/deployment scripts
- Testing scripts

## Repository Status

The repository has progressed from early stages to having a **complete foundation implemented**; four life‑domain modules (User, Academic, Finance, Skills) are now connected to the Core Intelligence Layer. Core infrastructure is in place and ready for the remaining domain modules. The project follows modern web development practices with proper separation of concerns, security measures, and development workflows.

## Long-term Vision

As outlined in the Architecture Improvement Report, the ideal architecture for ATLAS as a long-term Life Operating System should embrace:
- Loose coupling, high cohesion through well-defined interfaces
- Domain-Driven Design with bounded contexts for each life domain
- Layered architecture with clear separation of concerns
- Event-driven communication where beneficial for loose coupling
- Observability-first design with built-in monitoring, logging, and tracing
- Security by design at all layers
- Testability built into the architecture
- Evolvability to change technologies, scale components, and add features
- Operational excellence for easy deployment, monitoring, and maintenance

This foundation will enable ATLAS to scale effectively to encompass all eight planned modules plus advanced features like AI recommendations, real-time collaboration, and offline capabilities while maintaining code quality and development velocity.