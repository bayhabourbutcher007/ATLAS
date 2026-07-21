# ATLAS Project Structure

## Overview
This document explains the organization of the ATLAS codebase.

## Directory Structure

```
atlas/
├── public/                 # Static assets served directly
│   ├── css/                # Stylesheets
│   ├── js/                 # Client-side JavaScript
│   ├── images/             # Image assets
│   ├── 404.html            # 404 error page
│   └── 500.html            # 500 error page
├── src/                    # Source code
│   ├── api/                # API-related code
│   │   ├── routes.js       # API route definitions
│   │   └── controllers/    # Request handlers
│   ├── config/             # Configuration files
│   │   └── config.js       # Application configuration
│   ├── controllers/        # Request handlers (MVC pattern)
│   ├── middleware/         # Custom Express middleware
│   ├── models/             # Database models
│   ├── routes/             # Route definitions (alternative to api/routes)
│   ├── services/           # Business logic
│   ├── utils/              # Utility functions
│   └── app.js              # Express application setup
├── tests/                  # Test files
│   ├── Unit tests          # Unit tests for individual components
│   └── Integration tests   # Integration tests
├── docs/                   # Documentation
│   ├── API.md              # API documentation
│   └── ...                 # Other documentation files
├── scripts/                # Utility scripts
│   └── seedDatabase.js     # Database seeding script
├── .env.example            # Environment variables template
├── .eslintrc.json          # ESLint configuration
├── .gitignore              # Git ignore rules
├── Dockerfile              # Docker container definition
├── docker-compose.yml      # Docker Compose configuration
├── jest.config.js          # Jest testing configuration
├── package.json            # Project dependencies and scripts
├── README.md               # Project overview and setup instructions
└── CLAUDE.md               # Development guidelines for Claude
```

## Key Directories

### `src/`
Contains all application source code following a modular structure.

### `models/`
Database models using Mongoose ODM for MongoDB.

### `controllers/`
Request handlers that process incoming requests and return responses.

### `services/`
Business logic layer that contains the core application functionality.

### `routes/`
API route definitions that map URLs to controller functions.

### `middleware/`
Custom Express middleware for authentication, validation, etc.

### `utils/`
Helper functions used across different parts of the application.

### `tests/`
Test files organized by type (unit, integration, end-to-end).

### `public/`
Static assets that are served directly by the web server.

### `docs/`
Documentation files for users and developers.

## Naming Conventions

- Files and directories: kebab-case
- JavaScript variables and functions: camelCase
- JavaScript classes: PascalCase
- Environment variables: UPPER_SNAKE_CASE
- Database collections: plural lowercase (e.g., users, notes)
- API endpoints: kebab-case with version prefix (e.g., /api/v1/auth/login)

## Data Flow

1. Client sends HTTP request to server
2. Express middleware processes request (authentication, validation, etc.)
3. Route matches URL to controller function
4. Controller calls service layer for business logic
5. Service interacts with models to access database
6. Model performs database operations
7. Data flows back: model → service → controller → response → client

## Dependency Management

- Production dependencies: listed in `package.json` dependencies
- Development dependencies: listed in `package.json` devDependencies
- Locked versions: maintained in `package-lock.json`
- Updates: use `npm update` or `npm install package@version`

## Environment Configuration

- Environment variables stored in `.env` file (not committed)
- Template provided in `.env.example`
- Different environments: development, testing, production
- Configuration loaded via `dotenv` package and centralized in `src/config/config.js`

## Extending the Application

To add a new feature:
1. Create model in `src/models/`
2. Create service in `src/services/` for business logic
3. Create controller in `src/controllers/` to handle requests
4. Define routes in `src/routes/` or `src/api/routes.js`
5. Add tests in `tests/`
6. Update documentation as needed

## Database Migrations

Currently using manual schema updates via model definitions.
For production deployments, consider implementing a migration system.