# ATLAS Current State

This document captures the present condition of the ATLAS codebase (as of 2026‑07‑21). It is intended for developers, reviewers, and stakeholders who need a quick snapshot of what works, what is missing, and what comes next.

--- 

## 📦 What Exists Today

### Core Infrastructure
- **Backend** – Node.js + Express (MVC‑style) with MongoDB/Mongoose.
- **Authentication** – JWT‑based (`authMiddleware`, `/auth/login`, `/auth/refresh`, `/auth/logout`).
- **Centralized Error Handling** – custom error classes (`ValidationError`, `AuthenticationError`, `NotFoundError`, `ConflictError`, `RateLimitError`) in `src/utils/errors.js`; handled by `src/middleware/errorHandler.js`.
- **Validation Layer** – Joi‑based generic middleware (`src/middleware/validation.js`) and schema files in `src/validation/`.
- **API Versioning** – `/api/v1` prefix with `API-Version` header (`src/middleware/apiVersionMiddleware.js`).
- **Core Intelligence Layer** – pure, side‑effect‑free modules:
  - `src/core/life-context/ContextAggregator.js` – builds a normalized context snapshot by calling domain service getters.
  - `src/core/analytics/AnalyticsProcessor.js` – placeholder for KPI calculation.
  - `src/core/insights/InsightGenerator.js` – placeholder for insight generation.
  - `src/core/recommendations/RecommendationEngine.js` – placeholder for recommendation generation.
  - `src/core/index.js` re‑exports the four building blocks.
- **Domain Modules (Implementations)**
  - **User** – model, service (`UserService`), controller (`UserController`), routes (`src/routes/users.js`), Joi validation schemas (`src/validation/user.validation.js`).
  - **Academic Progress** – model, service (`AcademicProgressService`), controller (`AcademicProgressController`), routes (`src/routes/academicProgress.js`), Joi validation schemas (`src/validation/academicProgress.validation.js`).
  - **Auth** – controller & service (`AuthService`) already using Joi validation (`src/validation/auth.validation.js`).
- **Documentation**
  - `docs/PRODUCT_VISION.md` – long‑term vision.
  - `docs/ATLAS_PRINCIPLES.md` – permanent rules every feature must follow.
  - `docs/ATLAS_EXPLANATION.md` – high‑level overview of architecture and data flow.
  - `docs/DEVELOPER_GUIDE.md` – contributor handbook (folder structure, coding rules, how to add a module, naming conventions, things never to do).
  - `docs/CORE_INTERFACE.md` – contracts for the core layer.
  - `docs/CONTEXT_SCHEMA.md` – exact shape of the context snapshot exchanged between domain services and the core.
  - `docs/ROADMAP.md` – phased plan for future work.
  - Additional misc docs (`API.md`, `ARCHITECTURE.md`, `CHANGELOG.md`, `DESIGN_GUIDELINES.md`, `PROJECT_STRUCTURE.md`).

### Supporting Files
- Dockerfile & `docker-compose.yml` for containerised dev/prod.
- Basic frontend (`public/index.html`, `css/styles.css`, `js/main.js`) – currently a static marketing page.
- Test framework – Jest configured (`jest.config.js`), with placeholder test file (`test/coreBrainTest.js`) demonstrating the core pipeline.

--- 

## 🚧 What Is Incomplete

| Area | Missing / Incomplete |
|------|----------------------|
| **Domain Services** | Finance, Skills, Health, Career, Time, Emotional State – no models, services, controllers, routes, or validation schemas. |
| **Frontend** | Static HTML/CSS/JS only; no API consumption, no login flow, no dynamic views for insights/recommendations. |
| **Core Logic** | `AnalyticsProcessor`, `InsightGenerator`, `RecommendationEngine` are stubs (return empty/default values). No real metric calculations, insight detection, or recommendation prioritisation. |
| **Observability** | No structured logger (Winston/Pino), no request‑id tracing, no metrics endpoint beyond `/health`. |
| **API Completeness** | No OpenAPI/Swagger spec; missing pagination, filtering, sorting, and bulk‑operation endpoints. |
| **Privacy Controls** | No `DELETE /me` endpoint for full data erasure; no explicit data‑export/import endpoints. |
| **Testing** | Unit‑test coverage is low; only a handful of demonstration tests exist. |
| **DevOps** | No CI/CD pipeline configured; no automated security scans. |
| **Performance & Scaling** | No caching layer, no read‑replica/sharding guidance, no rate‑limit tuning beyond basic middleware. |
| **Internationalisation (i18n)** | UI strings are hard‑coded in English. |

--- 

## 🏗️ Current Architecture Diagram

> The diagram below uses Mermaid syntax (supported by many markdown viewers). It shows the **data flow** from domain services → Core → intelligence modules → controller/client, and highlights which pieces are implemented (green) vs. placeholder (yellow).

```mermaid
flowchart TD
    %% Domain Services (Implemented)
    UserService[User Service<br/>✅]:::implemented
    AcademicService[AcademicProgress Service<br/>✅]:::implemented
    AuthService[Auth Service<br/>✅]:::implemented

    %% Domain Services (Not yet implemented)
    FinanceService[Finance Service<br/>❌]:::missing
    SkillsService[Skills Service<br/>❌]:::missing
    HealthService[Health Service<br/>❌]:::missing
    CareerService[Career Service<br/>❌]:::missing
    TimeService[Time Service<br/>❌]:::missing
    EmoService[Emotional State Service<br/>❌]:::missing

    %% Core
    subgraph Core["Core Intelligence Layer (src/core)"]
        Direction TB
        CA[ContextAggregator<br/>✅]:::implemented
        AP[AnalyticsProcessor<br/>⚠️]:::partial
        IG[InsightGenerator<br/>⚠️]:::partial
        RE[RecommendationEngine<br/>⚠️]:::partial
    end

    %% Controllers
    Controllers[Controllers<br/>(thin, call services)]:::implemented

    %% Client
    Client[Frontend / API Consumer<br/>⚠️]:::partial

    %% Connections: Service → Core (getters)
    UserService --> CA
    AcademicService --> CA
    FinanceService --> CA
    SkillsService --> CA
    HealthService --> CA
    CareerService --> CA
    TimeService --> CA
    EmoService --> CA

    %% Core → Intelligence (pure functions)
    CA --> AP
    CA --> IG
    CA --> RE

    %% Intelligence → Controller (enrich payload)
    AP --> Controllers
    IG --> Controllers
    RE --> Controllers

    %% Controller ↔ Client (HTTP)
    Controllers --> Client
    Client --> Controllers

    classDef implemented fill#d4edda,stroke#155724,color#155724;
    classDef partial   fill#fff3cd,stroke#856404,color#856404;
    classDef missing   fill#f8d7da,stroke#721c24,color#721c24;
```

*Legend*  
- **✅ Green** – Fully implemented and tested.  
- **⚠️ Yellow** – Exists but currently a stub/minimal implementation (needs real logic).  
- **❌ Red** – Not yet implemented.

--- 

## 🎯 Next Development Milestone

**Milestone: “Domain Module Completion & Core Integration”**  
Goal: Have **all six remaining domain modules** (Finance, Skills, Health, Career, Time, Emotional) follow the same pattern as User & AcademicProgress, plug their getters into `ContextAggregator`, and expose basic CRUD endpoints protected by JWT.

**Specific Deliverables**
1. **Model** – Mongoose schema with proper indexes, instance methods (if needed).  
2. **Service** – Static getter `get*Snapshot(userId)` that returns a clean DTO matching `CONTENT_SCHEMA.md`; plus any mutator methods required for the module’s API.  
3. **Validation** – Joi schema(s) in `src/validation/`.  
4. **Controller** – Thin layer; at minimum a `GET /<module>/snapshot` endpoint (used by the Core or frontend) and any create/update/delete endpoints the domain needs.  
5. **Route** – Mount in `src/api/routes.js` (or a dedicated file) under `/api/v1/<module>`.  
6. **Unit Tests** – Test the service getter (mock the model) and validation error paths.  
7. **Integration Test** – Verify the endpoint returns the expected DTO shape and correct HTTP codes.  
8. **Update Documentation** –  
   - Add the new DTO shape to `docs/CONTEXT_SCHEMA.md` (if new fields).  
   - Ensure `docs/CORE_INTERFACE.md` still accurately describes the contract (no changes needed if the schema stays the same).  
   - Add a short “Module‑X” section to `docs/DEVELOPER_GUIDE.md` if there are any special notes.

**Success Criteria**
- The Context Aggregator can successfully build a full context snapshot containing **all nine sections** (`user`, `goals`, `academics`, `finance`, `skills`, `health`, `career`, `time`, `emotional_state`, `metadata`) with real data from the implemented services (or empty/default placeholders for any still‑missing ones).  
- The core’s analytics/insight/recommendation modules remain unchanged (still receiving plain objects).  
- All new code passes `npm run lint` and `npm test`.  
- Documentation is up‑to‑date and reflects the new module structure.

--- 

## 🚫 What NOT to Build Yet

| Item | Reason to Defer |
|------|-----------------|
| **AI/ML model integration** (e.g., TensorFlow, HuggingFace APIs) | The core is deliberately kept pure and rule‑based to guarantee testability, privacy, and deterministic behaviour. ML can be explored later as an optional plug‑in, but it must not break the current contracts. |
| **Real‑time websockets / live collaboration** | Not required for the decision‑first vision; adds complexity and state that conflicts with the current stateless API. Re‑consider after the core modules are stable and the frontend is live. |
| **Social features (leaderboards, feeds, messaging)** | Directly violates the **Privacy Ownership** and **No Social Comparison** tenets of ATLAS. If social interaction is ever desired, it must be opt‑in, anonymous, and strictly limited to sharing aggregate insights—never personal data. |
| **Advertising or analytics tracking scripts** | Would compromise **Privacy Ownership** and introduce third‑party data collection. Revenue, if needed, should come from voluntary premium features or institutional licences. |
| **Heavy frontend frameworks (React, Angular, Vue) as a hard requirement** | Keep the API agnostic; the frontend may evolve, but the backend contract must stay stable. A lightweight vanilla or Alpine.js implementation is sufficient for the initial MVP. |
| **Micro‑service migration (e.g., Kubernetes, service mesh)** | The monolithic modular design is already clear, testable, and deployable via Docker. Splitting into services adds operational overhead prematurely. |
| **File‑upload/CDN for media (images, videos)** | Not needed for the core lifecycle tracking; if required later, it must follow strict validation, virus scanning, and storage policies. |
| **Advanced multi‑tenant role‑based access control (RBAC) beyond student/teacher/admin** | Current role model is sufficient; extend only after clear demand and after verifying it doesn’t complicate the core context flow. |
| **Hard‑coded limits or “magic numbers” scattered across code** | All limits (pagination size, validation minima/maxima) should be defined in `src/config/config.js` or as environment variables for easy tuning. |

--- 

## ✅ Quick Reference Checklist (for the upcoming milestone)

- [ ] Create model (`src/models/*.js`).
- [ ] Create service with `get*Snapshot(userId)` and any mutators (`src/services/*Service.js`).
- [ ] Add Joi validation schemas (`src/validation/*.validation.js`).
- [ ] Implement thin controller (`src/controllers/*Controller.js`).
- [ ] Wire route in `src/api/routes.js`.
- [ ] Write unit tests for service/getter and validation.
- [ ] Write integration test (using `supertest`) for the endpoint(s).
- [ ] Run `npm run lint` and `npm test` – ensure zero errors.
- [ ] Update `docs/CONTEXT_SCHEMA.md` if new DTO fields are added.
- [ ] Verify that `src/core/life-context/ContextAggregator.js` can call the new getter (no code change needed if you follow the naming convention `get*Snapshot` and export it from the service).
- [ ] No modifications to `src/core/*` that involve mutating the database or calling service mutators.
- [ ] Update any relevant documentation (e.g., add a short FAQ or usage note in `docs/DEVELOPER_GUIDE.md`).

--- 

*This file **does not modify** any existing source code; it only records the current status and outlines the immediate next steps.*