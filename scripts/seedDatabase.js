# Database Seed Script

This script populates the database with sample data for development and testing purposes.

## Usage

```bash
npm run seed
```

Or run directly with Node:

```bash
node scripts/seedDatabase.js
```

## What It Seeds

1. Sample users with different roles
2. Sample notes for each user
3. Sample knowledge graph nodes and edges
4. Sample study plans and sessions
5. Sample quiz questions
6. Sample progress tracking entries
7. Sample study groups and collaborations

## Safety Features

- Only runs in development environment by default
- Can be forced to run in other environments with FORCE_SEED=true
- Checks for existing data to avoid duplicates
- Provides clear output of what was created

## Customization

Modify the seed data in this file to suit your development needs:
- Adjust user profiles
- Add sample content relevant to your testing scenarios
- Modify relationships between entities

## Notes

- Passwords for all seed users are set to 'Password123!' (change in production!)
- Sample data is designed to demonstrate various features of the application
- Run this script periodically during development to refresh test data