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
- Created:
  - src/models/Career.js (Mongoose schema matching CareerDTO from CONTEXT_SCHEMA.md)
  - src/services/CareerService.js (service layer with methods for getting career snapshot and CRUD operations for career data,src/controllers/careerController.js (RESTful controller handling career data endpoints)
  -,src/routes/career.js (API routes for career data, mounted at /career)
  -,src/validation/career.validation.js (Joi validation schemas for all career-related data)
- Updated:
  -,src/core/life-context/ContextAggregator.js (integrated CareerService to provide real career data in the context snapshot)
  -,src/api/routes.js (mounted career routes and updated API documentation to include /career endpoint)
- Verified integration by running the existing core brain test (tests/coreBrainTest.test.js) which now includes real career data in the context snapshot.
- All code follows existing patterns, naming conventions, and coding standards from the User, Academic, Finance, Skills, and Health modules.

## Completed Modules

✅ User
✅ Academic
✅ Finance
✅ Skills
✅ Health
✅ Career

## Next Development Phase

Next modules to implement:
- Time Module  
- Emotional State Module

Each should follow the same architecture:
Model → Service → Controller → Route → Validation → ContextAggregator

## Session Summary (July 22, 2026)

- **Completed:** Implemented the Career module (model, service, controller, routes, validation) and integrated it into the Core Intelligence Layer via ContextAggregator.
- **Files created/modified:**
  - Created: src/models/Career.js, src/services/CareerService.js, src/controllers/careerController.js, src/routes/career.js, src/validation/career.validation.js
  - Modified: src/core/life-context/ContextAggregator.js (added CareerService call), src/api/routes.js (added career routes and updated API documentation)
- **Current project state:** Six life‑domain modules (User, Academic, Finance, Skills, Health, Career) are now connected to the Core Intelligence Layer; the foundation is ready for the Time module.
- **Verification:** The existing core brain test (tests/coreBrainTest.test.js) passes and includes real career data in the context snapshot, confirming end-to-end integration.
- **Next steps:** Proceed with implementing the Time module following the same pattern.

## Repository Status

The repository has progressed from early stages to having a complete foundation implemented; six life‑domain modules (User, Academic, Finance, Skills, Health, Career) are now connected to the Core Intelligence Layer. Core infrastructure is in place and ready for the remaining domain modules. The project follows modern web development practices with proper separation of concerns, security measures, and development workflows.

## Long-term Vision

As outlined in the Architecture Improvement Report, the ideal architecture for ATLAS as a long-term Life Operating System should embrace:
- Loose coupling, high cohesion through well-defined interfaces
- Domain-Driven Design with bounded contexts for each life domain
- Layered architecture with clear separation of responsibilities
- Event-driven communication where beneficial for loose coupling
- Observability-first design with built-in monitoring, logging, and tracing
- Security by design at all layers
- Testability built into the architecture
- Evolvability to change technologies, scale components, and add features
- Operational excellence for easy deployment, monitoring, and maintenance

This foundation will enable ATLAS to scale effectively to encompass all eight planned modules plus advanced features like AI recommendations, real-time collaboration, and offline capabilities while maintaining code quality and development velocity.