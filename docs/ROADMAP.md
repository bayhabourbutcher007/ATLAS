# Roadmap

This document outlines the planned milestones, feature releases, and timeline for the ATLAS project. It provides a high-level view of what is expected to be delivered and when, helping stakeholders and contributors align on future work.

## Vision Alignment
All roadmap items must adhere to the ATLAS Principles defined in `docs/ATLAS_PRINCIPLES.md`. Every feature or improvement should pass the "Does this belong in ATLAS?" test.

## Current State (Completed)
- **Foundation Established**: Core infrastructure (auth, user management, academic progress module) implemented with service layer pattern
- **Validation Standardized**: Joi validation schemas created for Auth and User modules, replacing express-validator
- **Documentation Defined**: Product Vision and Permanent Principles documented
- **Error Handling**: Centralized error handling with custom error classes in place

## Phase 1: Module Standardization & Consistency (Immediate)
*Goal: Apply established patterns to all remaining modules to ensure consistency and reduce cognitive load.*

### Outcomes:
- [ ] **Finance Manager Module**:
  - Create FinanceService with business logic (budgeting, expense tracking, investment overview)
  - Update FinanceController to be thin request/response layer
  - Implement Joi validation schemas (finance.validation.js)
  - Connect to existing auth/user services for contextual financial insights
  
- [ ] **Skills Learning Module**:
  - Create SkillsService for tracking skill development, learning goals, progress
  - Thin SkillsController delegating to service layer
  - Joi validation schemas (skills.validation.js)
  - Integration with Academic Progress for holistic learning view

- [ ] **Planner Module**:
  - Create PlannerService for task/event management with life-domain awareness
  - Thin PlannerController
  - Joi validation schemas (planner.validation.js)
  - Smart scheduling suggestions based on energy levels, commitments, and goals

- [ ] **Progress Tracking Module**:
  - Create ProgressService for cross-domain progress visualization
  - Thin ProgressController
  - Joi validation schemas (progress.validation.js)
  - Focus on decision-relevant metrics (not vanity metrics)

- [ ] **Collaboration Module**:
  - Create CollaborationService for secure, purpose-driven collaboration
  - Thin CollaborationController
  - Joi validation schemas (collaboration.validation.js)
  - Emphasis on privacy and consent in shared spaces

*Phase 1 Success Criteria*: All modules follow identical structure: Service (business logic) → Controller (thin layer) → Routes (with Joi validation) → Consistent error handling.

## Phase 2: Cross-Module Intelligence & Decision Support (Near-term)
*Goal: Enable ATLAS to surface insights across modules that help users make better life decisions.*

### Outcomes:
- [ ] **Context Engine**:
  - Service that analyzes patterns across modules (finance + time + energy + goals)
  - Generates proactive, contextual suggestions (e.g., "Your upcoming launch conflicts with family time—here are 3 adjustment options")
  
- [ ] **Decision Scoring**:
  - Lightweight system to evaluate options against user's stated priorities and constraints
  - Not AI-driven predictions, but transparent logic showing trade-offs (time, money, energy, alignment)
  
- [ ] **Life Event Modeling**:
  - Tools to simulate how major decisions (career change, relocation, major purchase) would impact multiple life domains
  - Based on user's current data, not generic assumptions

- [ ] **Pattern Recognition**:
  - Identifies positive and negative patterns across domains (e.g., "When you exercise 3x/week, your focus at work improves 20% and impulsive spending decreases")
  - Presented as insights, not judgments

*Phase 2 Success Criteria*: Users regularly encounter insights that reveal non-obvious connections between life domains, leading to better decisions without increased cognitive load.

## Phase 3: Long-Term Relevance & Future-Proofing (Ongoing)
*Goal: Ensure ATLAS remains valuable and usable across decades of a user's life.*

### Outcomes:
- [ ] **Adaptive Identity System**:
  - Modules dynamically emphasize/de-emphasize based on user's current life stage (student → professional → parent → retiree)
  - No manual "switching profiles"—system infers context from behavior patterns (with privacy safeguards)
  
- [ ] **Timeline Navigation**:
  - Ability to view past decisions and outcomes to inform future choices
  - Future projection mode based on current trajectories (with clear uncertainty indicators)
  
- [ ] **Legacy Data Import/Export**:
  - Standards-based import from common life management tools (CSV, JSON, iCal, OFX)
  - Export capabilities for external use (tax software, legacy planning, etc.)
  
- [ ] **Principle-Auditing System**:
  - Lightweight mechanism to ensure new features continuously respect ATLAS Principles
  - Not automated enforcement, but regular check-ins for the development team

*Phase 3 Success Criteria*: A user who starts with ATLAS at age 20 finds it equally valuable and relevant at ages 30, 40, 50, and beyond—without needing to learn a new system.

## Phase 4: Experience Refinement & Calmness (Continuous)
*Goal: Continuously refine the interface to embody the "calm, living interface" philosophy.*

### Outcomes:
- [ ] **Motion & Feedback Refinement**:
  - All transitions follow physics-based easing (no jarring or playful animations)
  - Feedback is subtle and informative, never alarming or exploitative
  
- [ ] **Information Density Optimization**:
  - Progressive disclosure: show only what's needed for the current decision
  - Advanced details available but never forced
  
- [ ] **Tone of Voice Library**:
  - Centralized messaging guidelines ensuring warm, precise, never-patronizing communication
  - Context-aware phrasing (different tone for crisis vs. planning vs. celebration)
  
- [ ] **Accessibility First**:
  - Full WCAG 2.1 AA compliance as a baseline, not an afterthought
  - Design choices that benefit all users (clear typography, sufficient contrast, logical navigation)

*Phase 4 Success Criteria*: Users report feeling calmer and more in control after using ATLAS, not more anxious or distracted—measured through regular sentiment surveys.

## Success Metrics (What We Measure)
We measure success by reduced decision fatigue and increased life agency—not traditional engagement metrics:

1. **Decision Quality Improvement**: User-reported increase in confidence when making cross-domain life decisions
2. **Cognitive Load Reduction**: Decreased time spent juggling between apps and mental spreadsheets
3. **Long-Term Retention**: Users continuing to find value across life transitions (not just single-phase usage)
4. **Principle Adherence**: Regular audits showing features consistently uphold ATLAS Principles
5. **Privacy Trust**: High opt-in rates for features requiring data sharing, low deletion rates indicating trust

## What We Explicitly Do NOT Track
- Login streaks or daily active users (could encourage unhealthy habits)
- Time spent in app (we want efficiency, not addiction)
- Comparative metrics ("you're doing better than X% of users")
- Anything that could induce shame, anxiety, or FOMO

## Review Cadence
- **Quarterly**: Re-assess roadmap priorities based on user feedback and life-stage relevance
- **Biannually**: Revisit ATLAS Principles to ensure they still capture our essence
- **After Major Life Events**: Special consideration for how features serve users during transitions (graduation, career change, parenthood, etc.)

--- 
*This roadmap is a living document. As ATLAS evolves with its users, these phases may overlap, reorder, or expand—but the north star remains: helping people make better decisions through a calm, intelligent life operating system.*