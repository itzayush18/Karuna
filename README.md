# Karuna – Smart Resource Allocation

AI-powered monorepo for NGO smart resource allocation, relief coordination, volunteer matching, and community impact tracking.

## Structure

```text
backend/   NestJS + Prisma + PostgreSQL + Gemini AI
mobile/    Expo React Native + TypeScript mobile app
web/       React + Vite + TypeScript admin dashboard
```

## Quick Start

```bash
# Install all dependencies
npm install

# Start the backend (NestJS)
npm run backend:dev

# Start the mobile app (Expo)
npm run mobile:start

# Start the web dashboard (Vite)
npm run web:dev
```

## Web Dashboard Pages

| Page           | Backend Endpoints Used                                |
| -------------- | ----------------------------------------------------- |
| Dashboard      | `/dashboard/*` – urgent-summary, completion-rates, map, active-volunteers, pending-reports |
| Tasks          | `/tasks`, `/tasks/urgent`, `/tasks/:id/score`         |
| Reports        | `/reports`, `/reports/sync`, `/reports/:id`            |
| Assignments    | `/assignments`, `/assignments/:id/approve|complete|override` |
| Volunteers     | `/volunteers`                                         |
| Analytics      | `/analytics/impact-summary`, `/analytics/ngo-report`  |
| Predictions    | `/predictions`, `/predictions/generate`               |
| Notifications  | `/notifications`, `/notifications/:id/read`           |
| Users          | `/users`, `/roles`, `/users/:id`                      |
| Audit Logs     | `/audit-logs`                                         |

See `backend/README.md`, `mobile/README.md`, and `web/.env.example` for app-specific setup.
