# ATLAS API Documentation

## Base URL
```
/api/v1
```

## Authentication
Most endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Response Format
All API responses follow this format:
```json
{
  "success": boolean,
  "message": string,
  "data": object|array|null,
  "errors": array|null
}
```

## Endpoints

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login user
- `GET /auth/profile` - Get authenticated user profile
- `PUT /auth/profile` - Update user profile
- `POST /auth/logout` - Logout user

### Notes
- `GET /notes` - Get all user notes
- `POST /notes` - Create a new note
- `GET /notes/:id` - Get a specific note
- `PUT /notes/:id` - Update a note
- `DELETE /notes/:id` - Delete a note

### Knowledge Graph
- `GET /knowledge-graph` - Get user's knowledge graph
- `POST /knowledge-graph/nodes` - Add a node to the graph
- `POST /knowledge-graph/edges` - Add an edge to the graph
- `DELETE /knowledge-graph/nodes/:id` - Remove a node
- `DELETE /knowledge-graph/edges/:id` - Remove an edge

### Study Planner
- `GET /planner/schedule` - Get study schedule
- `POST /planner/schedule` - Create study session
- `PUT /planner/schedule/:id` - Update study session
- `DELETE /planner/schedule/:id` - Delete study session
- `GET /planner/goals` - Get learning goals
- `POST /planner/goals` - Set learning goal

### Quiz & Exams
- `GET /quiz` - Get available quizzes
- `POST /quiz` - Generate new quiz
- `POST /quiz/:id/attempt` - Submit quiz attempt
- `GET /quiz/attempts` - Get user's quiz attempts
- `GET /quiz/attempts/:id` - Get specific quiz attempt

### Progress Tracking
- `GET /progress/overview` - Get learning progress overview
- `GET /progress/topics` - Get progress by topic
- `GET /progress/time` - Get time spent statistics
- `POST /progress/events` - Log learning activity

### Collaboration
- `GET /collab/groups` - Get user's study groups
- `POST /collab/groups` - Create study group
- `GET /collab/groups/:id` - Get group details
- `POST /collab/groups/:id/members` - Add member to group
- `DELETE /collab/groups/:id/members/:userId` - Remove member from group
- `GET /collab/groups/:id/chat` - Get group chat messages
- `POST /collab/groups/:id/chat` - Send message to group

## Error Responses
- `400` - Bad Request (validation errors, missing parameters)
- `401` - Unauthorized (invalid or missing token)
- `403` - Forenticated.io/api/v1
   说明需要身份验证.
  - '404' - 未找到 (资源不存在)
  - '429' - 请求过多 (超出限流限制)
  - '500' - 内部服务器错误

## 速率限制
 API 端点受到速率限制，以防滥用：
 - 每个 IP 地址 900,000 每于 15 分钟） 100 次请求

## 版本控制
 当前 API 版本: v1
 未来版本将通过 URL 路径进行版本控制 (例如 `/api/v2/`)

## SDK 和客户端库
 官方客户端库可用于：
 - JavaScript/TypeScript: npm 包 `@atlas/sdk-js`
 - Python: PyPI 包 `atlas-sdk-python`
 - 移动端: iOS 和 Android 原生 SDK

## 支持
 有关 API 使用方面的问题，请联系：
 - 文档: https://docs.atlas.learning/api
 - 支持邮箱: api-support@atlas.learning
 - 问题跟踪: https://github.com/atlas-learning/atlas-api/issues