---
id: training/pattern/api-route-pattern
scope: project
created: 2026-07-07T22:48:37.538Z
updated: 2026-07-08T00:29:28.442Z
tags: ["training","pattern"]
---

<!-- training
kind: pattern
applied: 13
-->
# API Route Pattern
Each API route file follows this pattern:
1. Import Router, Response from express + AuthRequest from middleware/auth
2. Zod schema for request validation (z.object)
3. Router()
4. Each handler: wrap in try/catch, parse with Zod, return JSON
5. Standard error handling: Zod errors → 400, all others → 500
6. Export default router
Routes are registered in index.ts with authMiddleware for protected routes.
