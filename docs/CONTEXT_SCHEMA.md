# ATLAS Context Snapshot Schema

This document defines the exact shape of the **context snapshot** that flows from the **Domain Services** → **Core** (`ContextAggregator`) and is consumed by the **Insight Generator** and **Recommendation Engine**.

The schema is intentionally **strict** (all keys present, values typed) to serve as a universal contract between every future ATLAS module and the Intelligence Layer.  
Individual domains may extend the schema with additional fields, but the core keys listed below MUST be supplied by the corresponding domain service.

---

## 1. Top‑Level Structure

```json
{
  "user": UserDTO,
  "goals": GoalDTO[],
  "academics": AcademicDTO,
  "finance": FinanceDTO,
  "skills": SkillDTO,
  "health": HealthDTO,
  "career": CareerDTO,
  "time": TimeDTO,
  "emotional_state": EmotionalStateDTO,
  "metadata": {
    "generatedAt": ISO8601String,
    "version": "1.0.0"
  }
}
```

All properties are **required** unless explicitly marked optional. If a domain has no data yet, it should return an empty object or array that matches the shape (e.g., `{}` or `[]`) rather than omitting the key.

---

## 2. Domain DTO Definitions

### 2.1 UserDTO
```json
{
  "id": "string (ObjectId)",
  "username": "string",
  "email": "string (lowercase)",
  "role": "enum: student | teacher | admin",
  "createdAt": ISO8601String,
  "profile": {
    "firstName": "string",
    "lastName": "string",
    "bio": "string (optional)",
    "avatarUrl": "string (optional)",
    "institution": "string (optional)",
    "major": "string (optional)",
    "graduationYear": "number (optional)"
  },
  "preferences": {
    "theme": "enum: light | dark | system",
    "notifications": {"email": boolean, "push": boolean},
    "language": "string (e.g., en, es)"
  }
}
```

### 2.2 GoalDTO
```json
{
  "id": "string",
  "title": "string",
  "description": "string (optional)",
  "type": "enum: GPA | Credits | StudyHours | CourseCompletion | SkillDevelopment | Other",
  "targetValue": "number (optional)",
  "startDate": "ISO8601String (optional)",
  "targetDate": "ISO8601String (optional)",
  "status": "enum: NotStarted | InProgress | Completed | Paused | Cancelled",
  "priority": "enum: Low | Medium | High",
  "completed": "boolean",
  "createdAt": ISO8601String,
  "updatedAt": ISO8601String
}
```

### 2.3 AcademicDTO
```json
{
  "currentTerm": {
    "term": "enum: Fall | Spring | Summer | Winter",
    "year": "number"
  },
  "gpa": {
    "semester": "number (0‑4.0, optional)",
    "cumulative": "number (0‑4.0, optional)"
  },
  "credits": {
    "completed": "number",
    "inProgress": "number",
    "planned": "number"
  },
  "courses": [
    {
      "id": "string",
      "courseId": "string",
      "courseName": "string",
      "courseCode": "string (optional)",
      "credits": "number (optional)",
      "instructor": "string (optional)",
      "term": "enum (optional)",
      "year": "number (optional)",
      "grade": "enum (optional)",
      "gradePoints": "number (0‑4.0, optional)",
      "status": "enum Enrolled | Completed | Dropped | Incomplete | Planned",
      "materials": [
        {
          "name": "string (optional)",
          "type": "enum Syllabus | Lecture Notes | Assignment | Reading | Video | Other (optional)",
          "url": "string (optional)"
        }
      ],
      "schedule": [
        {
          "dayOfWeek": "enum Monday … Sunday (optional)",
          "startTime": "string HH:MM (optional)",
          "endTime": "string HH:MM (optional)",
          "location": "string (optional)"
        }
      ],
      "customFields": [
        {
          "name": "string",
          "value": "*",
          "type": "enum text | number | date | boolean"
        }
      ]
    }
  ],
  "studyHours": {
    "total": "number (minutes)",
    "weekly": "number",
    "monthly": "number",
    "byCourse": [
      {
        "courseId": "string",
        "minutes": "number"
      }
    ],
    "lastUpdated": "ISO8601String (optional)"
  },
  "goals": [GoalDTO], // subset of user goals that are academic‑related
  "achievements": [
    {
      "id": "string",
      "title": "string",
      "description": "string (optional)",
      "date": "ISO8601String (optional)",
      "issuer": "string (optional)",
      "certificateUrl": "string (optional)",
      "category": "enum Academic | Leadership | Sports | Arts | CommunityService | Other"
    }
  ]
}
```

### 2.4 FinanceDTO
```json
{
  "overview": {
    "income": {
      "monthly": "number",
      "annual": "number",
      "sources": [
        {
          "id": "string",
          "description": "string",
          "amount": "number",
          "frequency": "enum monthly | biweekly | weekly | one‑time"
        }
      ]
    },
    "expenses": {
      "monthly": "number",
      "annual": "number",
      "categories": {
        "housing": "number",
        "food": "number",
        "transport": "number",
        "utilities": "number",
        "education": "number",
        "entertainment": "number",
        "health": "number",
        "misc": "number"
      }
    },
    "netWorth": "number",
    "savingsRate": "number (0‑1)",
    "emergencyFundMonths": "number"
  },
  "accounts": [
    {
      "id": "string",
      "name": "string",
      "type": "enum checking | savings | credit | investment | loan",
      "balance": "number",
      "currency": "string (USD/EUR/etc)",
      "institution": "string",
      "lastUpdated": "ISO8601String"
    }
  ],
  "debts": [
    {
      "id": "string",
      "creditor": "string",
      "principal": "number",
      "interestRate": "number (APR)",
      "minimumPayment": "number",
      "dueDate": "ISO8601String",
      "paidOff": "boolean"
    }
  ],
  "budgets": [
    {
      "category": "string",
      "limit": "number",
      "spent": "number",
      "period": "enum monthly | weekly"
    }
  ],
  "goals": [GoalDTO] // financial goals subset
}
```

### 2.5 SkillDTO
```json
{
  "skills": [
    {
      "id": "string",
      "name": "string",
      "category": "string (e.g., Programming | Design | Language)",
      "proficiency": "number (0‑100)",
      "evidence": [
        {
          "type": "enum course | project | certification | self‑assessment",
          "description": "string",
          "date": "ISO8601String",
          "url": "string (optional)"
        }
      ],
      "lastPracticed": "ISO8601String (optional)",
      "goalLevel": "number (0‑100, optional)"
    }
  ],
  "learningHours": {
    "total": "number (minutes)",
    "weekly": "number",
    "bySkill": [
      {
        "skillId": "string",
        "minutes": "number"
      }
    ],
    "lastUpdated": "ISO8601String (optional)"
  }
}
```

### 2.6 HealthDTO
```json
{
  "vitals": {
    "weight": "number (kg) (optional)",
    "height": "number (cm) (optional)",
    "bmi": "number (optional)",
    "bloodPressure": {
      "systolic": "number (optional)",
      "diastolic": "number (optional)"
    },
    "restingHeartRate": "number (optional)"
  },
  "activity": {
    "steps": "number (daily)",
    "activeMinutes": "number (weekly)",
    "workouts": [
      {
        "type": "string (e.g., running, yoga)",
        "durationMinutes": "number",
        "date": "ISO8601String",
        "caloriesBurned": "number (optional)"
      }
    ]
  },
  "sleep": {
    "hoursPerNight": "number (average)",
    "quality": "enum poor | fair | good (optional)",
    "consistency": "number (0‑1, std dev of nightly hours)"
  },
  "nutrition": {
    "mealsPerDay": "number",
    "caloriesPerDay": "number (average)",
    "waterIntakeLiters": "number (optional)"
  },
  "goals": [GoalDTO] // health‑related goals
}
```

### 2.7 CareerDTO
```json
{
  "currentPosition": {
    "title": "string",
    "company": "string",
    "startDate": "ISO8601String",
    "employmentType": "enum full‑time | part‑time | contract | freelance | internship",
    "location": "string (city, country)",
    "remote": "boolean",
    "industry": "string",
    "salary": {
      "amount": "number",
      "currency": "string",
      "frequency": "enum monthly | annual"
    }
  },
  "experience": [
    {
      "id": "string",
      "title": "string",
      "company": "string",
      "startDate": "ISO8601String",
      "endDate": "ISO8601String (optional)",
      "description": "string (optional)",
      "skillsUsed": ["string"]
    }
  ],
  "education": [
    {
      "institution": "string",
      "degree": "string",
      "fieldOfStudy": "string",
      "startDate": "ISO8601String",
      "endDate": "ISO8601String (optional)",
      "gpa": "number (optional)"
    }
  ],
  "certifications": [
    {
      "name": "string",
      "issuer": "string",
      "date": "ISO8601String",
      "expiryDate": "ISO8601String (optional)",
      "credentialId": "string (optional)"
    }
  ],
  "goals": [GoalDTO] // career‑related goals
}
```

### 2.8 TimeDTO
```json
{
  "calendar": [
    {
      "id": "string",
      "title": "string",
      "description": "string (optional)",
      "start": "ISO8601String",
      "end": "ISO8601String",
      "allDay": "boolean",
      "location": "string (optional)",
      "attendees": ["string"], // userIds or emails
      "recurrence": {
        "frequency": "enum daily | weekly | monthly | yearly",
        "interval": "number",
        "until": "ISO8601String (optional)",
        "byday": ["string"] // e.g., ["MO", "WE", "FR"]
      },
      "category": "enum work | personal | health | finance | learning | social"
    }
  ],
  "timeZones": {
    "home": "string (IANA tz)",
    "work": "string (optional)"
  },
  "availability": {
    "slots": [
      {
        "start": "ISO8601String",
        "end": "ISO8601String",
        "type": "enum focus | meeting | break | personal"
      }
    ]
  }
}
```

### 2.9 EmotionalStateDTO
```json
{
  "timestamp": "ISO8601String",
  "mood": {
    "value": "number (‑5 to +5)",
    "label": "enum very_sad | sad | neutral | happy | very_happy"
  },
  "stress": "number (0‑100)",
  "energy": "number (0‑100)",
  "focus": "number (0‑100)",
  "notes": "string (optional)",
  "tags": ["string"] // e.g., ["exam", "deadline", "social"]
}
```

### 2.10 Metadata
```json
{
  "generatedAt": "ISO8601String (UTC)",
  "version": "string (semver, e.g., 1.0.0)"
}
```

---

## 3. Contracts Between Layers

### 3.1 Domain Services → Core (ContextAggregator)

*Each domain service must expose a method that returns a DTO matching the schema above.*

```js
// Example signatures (to be implemented by each service)
async function getUserSnapshot(userId)          // → UserDTO
async function getGoalsSnapshot(userId)        // → GoalDTO[]
async function getAcademicSnapshot(userId)     // → AcademicDTO
async function getFinanceSnapshot(userId)      // → FinanceDTO
async function getSkillsSnapshot(userId)       // → SkillDTO
async function getHealthSnapshot(userId)       // → HealthDTO
async function getCareerSnapshot(userId)       // → CareerDTO
async function getTimeSnapshot(userId)         // → TimeDTO
async function getEmotionalStateSnapshot(userId) // → EmotionalStateDTO
```

*The `ContextAggregator.build(userId)` will call each of these functions, await the results, and assemble the top‑level object. If a service throws, the propagates the error (or returns a partial snapshot with an error flag – implementation detail left to the service layer).*

### 3.2 Core → Insight Generator

*Input*:  
- `context` – the full snapshot object (as defined).  
- `analytics` (optional) – output from `AnalyticsProcessor.process(context)`.

*Output*:  
```js
[
  {
    id: "string (uuid)",
    type: "enum: trend | anomaly | opportunity | correlation | insight",
    title: "string (max ~60 chars)",
    description: "string",
    confidence: "number (0‑1, optional)",
    sourceModules: ["string"], // e.g., ["academics", "finance"]
    suggestedActions: [ // optional, lightweight hints
      {
        type: "string", // e.g., "log", "schedule", "review"
        payload: {}     // free‑ data needed for the action, defined by the action type
      }
    ]
  }
]
```
*The InsightGenerator must be a pure function: no side effects, deterministic for identical inputs.*

### 3.3 Core → Recommendation Engine

*Input*:  
- `context` – snapshot.  
- `insights` – array produced by the InsightGenerator.  
- `userGoals` (optional) – subset of `goals` relevant to the current recommendation context (can be the full goals array).  

*Output*:  
```js
[
  {
    id: "string (uuid)",
    title: "string",
    description: "string",
    priority: "number (higher = more urgent)",
    effortEstimate: "string (e.g., '5 min', '1 hour', '1 day')",
    expectedImpact: "string (qualitative or reference to a metric)",
    relatedInsightIds: ["string"] // ids from the insights array
  }
]
```
*Again, pure and deterministic.*

---

## 4. Usage Example (Pseudo‑code)

```js
// In a service or scheduled job
const { ContextAggregator } = require('../core/life-context');
const { AnalyticsProcessor } = require('../core/analytics');
const { InsightGenerator } = require('../core/insights');
const { RecommendationEngine } = require('../core/recommendations');

async function generateInsightsForUser(userId) {
  // 1️⃣ Pull domain data
  const context = await ContextAggregator.build(userId);

  // 2️⃣ (Optional) compute metrics
  const analytics = AnalyticsProcessor.process(context);

  // 3️⃣ Generate insights
  const insights = InsightGenerator.generate(context, analytics);

  // 4️⃣ Produce recommendations
  const recommendations = RecommendationEngine.generate(
    context,
    insights,
    // optionally filter goals:
    context.goals.filter(g => g.status === 'InProgress')
  );

  return { context, analytics, insights, recommendations };
}
```

---

## 5. Extending the Schema

When a new domain (e.g., `environment`, `social`, `spirituality`) is added:

1. Define its DTO shape (following the same plain‑object convention).  
2. Add a top‑level key to the context snapshot (e.g., `"environment": EnvironmentDTO`).  
3. Update `ContextAggregator` to call the new service getter and merge the result.  
4. No changes required to `AnalyticsProcessor`, `InsightGenerator`, or `RecommendationEngine` – they will automatically receive the new data via the `context` object.

---

## 6. Validation & Testing

*Unit tests* for each core class should:
- Supply a mock context that strictly conforms to this schema.
- Verify output shape (insights/recommendations) matches the contracts.
- Ensure pure function behavior (same input → same output).

*Integration tests* can spin up a test database, populate sample records via real domain services, call the full pipeline, and assert that the final JSON is serializable and contains expected keys.

--- 

**End of document**. This schema is the **universal language** that every future ATLAS module must speak to participate in the Intelligence Layer. No business logic belongs here – only the contract. Implementations of the domain services will fill in the actual data.