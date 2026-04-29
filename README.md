# Karuna

Karuna is an AI-assisted humanitarian operations platform for NGOs and community relief teams. It turns noisy field reports into structured needs, scores urgency, matches volunteers, tracks assignments, surfaces predictions, and gives coordinators a live dashboard for impact, governance, and auditability.

The repository is split into three runnable projects:

```text
Karuna/
  backend/   NestJS API, Prisma/PostgreSQL data model, AI processing, auth, matching, analytics
  web/       Next.js admin console for coordinators and administrators
  app/       Expo React Native field app for volunteers and field workers
```

## What Karuna Does

- Collects reports from text, forms, images, PDFs, voice notes, and offline sync payloads.
- Uses Gemini, or a deterministic fallback when Gemini is not configured, to extract structured needs from Tamil, English, or mixed-language reports.
- Converts extracted reports into actionable tasks.
- Calculates explainable urgency scores from severity, affected population, vulnerable groups, age of report, recurrence, fragility, and location isolation.
- Suggests volunteer matches using skills, languages, distance, availability, preferences, performance, workload, and fatigue.
- Supports assignment approval, override, completion, audit logs, notifications, impact metrics, and governance views.
- Provides a Next.js admin dashboard for live operations and an Expo mobile app for field reporting and volunteer workflows.

## Tech Stack

| Area | Stack |
| --- | --- |
| Backend API | NestJS 11, TypeScript, Swagger, Helmet, throttling, class-validator |
| Database | PostgreSQL, Prisma 7, `@prisma/adapter-pg` |
| Auth | JWT, password auth, Firebase ID tokens, Google/Firebase login |
| AI | `@google/genai`, Gemini API key or Vertex AI, Zod-backed JSON schemas |
| Storage | Local uploads, optional Cloudflare R2-compatible object storage |
| Admin web | Next.js 16, React 19, Tailwind CSS 4, Firebase web auth |
| Mobile app | Expo 55, React Native 0.83, Expo Router, Firebase auth, Axios |
| Tests | Jest for backend services and schema validation |

## Architecture

```text
Field worker / volunteer app
  -> Firebase login/register
  -> JWT session from backend
  -> Text/image/audio/PDF reports
  -> Backend report ingestion
  -> AI extraction
  -> Task creation
  -> Urgency scoring
  -> Matching and assignments
  -> Notifications, impact metrics, audit logs

Admin dashboard
  -> Login through Firebase or seeded local accounts
  -> Polls /api/v1 dashboard, analytics, tasks, reports, AI logs, audit logs
  -> Runs coordinator actions such as process report, rescore task, suggest matches,
     generate predictions, ingest reference data
```

### Backend Modules

| Module | Responsibility |
| --- | --- |
| `auth` | Password login/register, Firebase login/register, Google token verification, JWT issuing, organizations lookup |
| `directory` | Users, roles, permissions, volunteer directory |
| `locations` | Village/district/state records for maps and task geography |
| `reports` | Report creation, offline sync/idempotency, report listing/detail, automatic processing kickoff |
| `media` | Uploads for report images, PDFs, audio files, manual transcript retry flow |
| `ai` | Gemini extraction, deterministic fallback extraction, dashboard insights, governance insights, AI processing logs |
| `urgency` | Explainable 0-100 task urgency scoring |
| `tasks` | Task listing, urgent queue, manual rescoring |
| `matching` | Volunteer suggestions and batch assignment planning |
| `assignments` | Proposed/approved/in-progress/completed/overridden assignment lifecycle |
| `dashboard` | Urgent summary, map data, completion rates, active volunteers, pending reports, village status |
| `predictions` | Early-warning prediction records and generation endpoint |
| `analytics` | Impact summary, NGO report, governance insights, AI insight feed, reference-data ingestion |
| `audit` | Transparent action history |
| `notifications` | User notification feed and read state |

## Data Model

The Prisma schema models the complete operations loop:

- `Organization`, `User`, `Role`, `Permission`
- `Volunteer`, skills, languages, availability, preferences, fatigue, workload, points, badges
- `Location` with village, district, state, coordinates, and isolation score
- `CommunityReport`, extracted fields, media files, sync status, processing status
- `Task`, task skills, task history, urgency scores, assignments, feedback
- `ImpactMetric`, `Prediction`, `WeatherSignal`
- `AiProcessingLog`, `InsightReferenceDataset`
- `Notification`, `AuditLog`

Important enums include:

- Roles: `ADMIN`, `COORDINATOR`, `FIELD_WORKER`, `VOLUNTEER`, `VIEWER`
- Report sources: `TEXT`, `FORM`, `IMAGE`, `AUDIO`, `SYNC`
- Need categories: `FOOD`, `WATER`, `MEDICAL`, `SHELTER`, `SANITATION`, `EDUCATION`, `TRANSPORT`, `OTHER`
- Task states: `OPEN`, `ASSIGNED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`

## Prerequisites

- Node.js 20+ recommended
- npm, or pnpm if you prefer the checked-in pnpm lockfiles
- PostgreSQL
- Firebase project for web/mobile auth
- Optional: Gemini API key or Google Cloud Vertex AI credentials
- Optional: Cloudflare R2 bucket for object storage

There is no root package script. Run commands inside `backend`, `web`, or `app`.

## Quick Start

### 1. Backend

```bash
cd backend
npm install
copy .env.example .env
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run prisma:seed
npm run start:dev
```

Backend URLs:

- API base: `http://localhost:3000/api/v1`
- Swagger docs: `http://localhost:3000/docs`
- Static uploads: `http://localhost:3000/uploads/...`

Seeded demo users use password `Password123!`:

- `admin@karuna.local`
- `coordinator@karuna.local`
- `volunteer@karuna.local`

### 2. Admin Web App

```bash
cd web
npm install
npm run dev
```

Open `http://localhost:3000` if that port is free. If the backend is already using `3000`, run Next.js on another port:

```bash
npm run dev -- -p 3001
```

The dashboard stores the backend base URL and JWT in `localStorage`. Seeded `@karuna.local` accounts fall back to backend password login; other accounts use Firebase first.

### 3. Mobile App

```bash
cd app
npm install
copy .env.example .env
npm run start
```

Useful app commands:

```bash
npm run android
npm run ios
npm run web
npm run lint
```

The Expo app uses `http://10.0.2.2:3000/api/v1` on Android emulators and the Expo host IP on other platforms.

## Environment Variables

### Backend `backend/.env`

Required:

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/smart_resource_allocation?schema=public
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=1d
```

Firebase Admin / Firebase token verification:

```env
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
FIREBASE_WEB_API_KEY=
FIREBASE_AUTO_PROVISION=false
FIREBASE_AUTO_PROVISION_ROLE=ADMIN
```

Gemini with API key:

```env
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.5-flash
GEMINI_PROVIDER=api_key
GEMINI_TIMEOUT_MS=30000
GEMINI_MAX_RETRIES=2
```

Gemini with Vertex AI:

```env
GEMINI_PROVIDER=vertex
GEMINI_USE_VERTEX_AI=true
GEMINI_VERTEX_PROJECT=
GEMINI_VERTEX_LOCATION=us-central1
GOOGLE_APPLICATION_CREDENTIALS=
```

Uploads and optional Cloudflare R2:

```env
UPLOAD_DIR=uploads
MAX_FILE_SIZE_MB=20
PUBLIC_BASE_URL=http://localhost:3000
CLOUDFLARE_R2_ENABLED=false
CLOUDFLARE_R2_ACCOUNT_ID=
CLOUDFLARE_R2_ACCESS_KEY_ID=
CLOUDFLARE_R2_SECRET_ACCESS_KEY=
CLOUDFLARE_R2_BUCKET=
CLOUDFLARE_R2_PUBLIC_BASE_URL=
```

### Web `web/.env.local`

The web app reads Firebase client config from `NEXT_PUBLIC_*` variables:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
```

### Mobile `app/.env`

The Expo app reads Firebase client config from `EXPO_PUBLIC_*` variables:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=
```

## Backend API Map

All backend routes are served under `/api/v1`.

| Area | Endpoints |
| --- | --- |
| Auth | `POST /auth/register`, `POST /auth/login`, `POST /auth/firebase/login`, `POST /auth/firebase/register`, `POST /auth/google/login`, `POST /auth/google/register`, `GET /auth/me`, `GET /auth/organizations` |
| Directory | `GET/POST /users`, `PATCH /users/:id`, `GET/POST /roles`, `GET /volunteers` |
| Locations | `GET /locations`, `POST /locations` |
| Reports | `POST /reports`, `POST /reports/sync`, `GET /reports`, `GET /reports/:id` |
| Media | `POST /reports/:reportId/media`, `POST /reports/:reportId/media/:mediaId/transcript` |
| AI | `POST /ai/reports/:id/process`, `GET /ai/logs`, `GET /ai/status` |
| Tasks | `GET /tasks`, `GET /tasks/urgent`, `POST /tasks/:id/score` |
| Matching | `POST /matching/suggest`, `POST /matching/batch-plan` |
| Assignments | `POST /assignments`, `POST /assignments/:id/approve`, `POST /assignments/:id/complete`, `POST /assignments/:id/override` |
| Dashboard | `GET /dashboard/urgent-summary`, `/map`, `/completion-rates`, `/active-volunteers`, `/pending-reports`, `/village-status` |
| Predictions | `GET /predictions`, `POST /predictions/generate` |
| Analytics | `GET /analytics/impact-summary`, `/ngo-report`, `/governance-insights`, `/ai-insight-feed`, `/reference-data`, `POST /analytics/reference-data/ingest` |
| Notifications | `GET /notifications`, `POST /notifications/:id/read` |
| Audit | `GET /audit-logs` |

Most routes require a bearer token. Coordinator/admin-only routes use role guards.

## Core Workflows

### Login

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"coordinator@karuna.local\",\"password\":\"Password123!\"}"
```

Use the returned `accessToken`:

```bash
set TOKEN=your-jwt-token
```

### Submit a Text Report

```bash
curl -X POST http://localhost:3000/api/v1/reports \
  -H "Authorization: Bearer %TOKEN%" \
  -H "Content-Type: application/json" \
  -d "{\"source\":\"TEXT\",\"rawText\":\"Urgent water support needed for 30 elderly people in Mullai Colony\",\"idempotencyKey\":\"mobile-001\"}"
```

The backend stores the report, logs processing, extracts structured fields, creates a task, and calculates urgency.

### Offline Sync

```bash
curl -X POST http://localhost:3000/api/v1/reports/sync \
  -H "Authorization: Bearer %TOKEN%" \
  -H "Content-Type: application/json" \
  -d "{\"source\":\"SYNC\",\"rawText\":\"Food packets required for 18 families\",\"idempotencyKey\":\"device-a:report-42\",\"clientRecordId\":\"report-42\",\"deviceId\":\"device-a\"}"
```

If the same user submits the same `idempotencyKey`, the API returns a duplicate sync response.

### Upload Media for a Report

```bash
curl -X POST http://localhost:3000/api/v1/reports/REPORT_ID/media \
  -H "Authorization: Bearer %TOKEN%" \
  -F "file=@survey.jpg"
```

Supported media includes common images, PDFs, and audio files. Files are staged locally for AI processing. When R2 is enabled, the object is also copied to Cloudflare R2 and the public URL is stored.

### Retry Audio with Manual Transcript

```bash
curl -X POST http://localhost:3000/api/v1/reports/REPORT_ID/media/MEDIA_ID/transcript \
  -H "Authorization: Bearer %TOKEN%" \
  -H "Content-Type: application/json" \
  -d "{\"transcript\":\"Voice note says urgent medical support is needed for 8 elderly people.\"}"

curl -X POST http://localhost:3000/api/v1/ai/reports/REPORT_ID/process \
  -H "Authorization: Bearer %TOKEN%"
```

### Suggest Volunteers

```bash
curl -X POST http://localhost:3000/api/v1/matching/suggest \
  -H "Authorization: Bearer %TOKEN%" \
  -H "Content-Type: application/json" \
  -d "{\"taskId\":\"TASK_ID\"}"
```

### Generate Predictions

```bash
curl -X POST http://localhost:3000/api/v1/predictions/generate \
  -H "Authorization: Bearer %TOKEN%"
```

## AI Behavior

Karuna uses Gemini for three main jobs:

1. Report extraction: structured location, category, affected people, severity, vulnerable groups, language, summary, confidence.
2. Dashboard insights: grounded, JSON-only insight cards based on recent reports, tasks, predictions, volunteers, audit logs, and reference data.
3. Governance insights: short administrative summaries from audit/user/task activity.

The AI service is designed to be resilient:

- Zod-derived JSON schema guides report extraction.
- Gemini calls include retry and timeout handling.
- Errors redact API keys before logging.
- If Gemini is not configured, text reports use deterministic demo extraction.
- If audio/media extraction fails, audio reports can move to `TRANSCRIPTION_REQUIRED` and be retried with a transcript.
- AI processing logs store model, prompt version, request type, status, latency, confidence, response JSON, and sanitized errors.

## Admin Web Console

The Next.js app is the coordinator/admin cockpit. It includes:

- Login screen with Firebase auth and seeded local-account fallback.
- Overview with urgent summary, live map/task cards, active volunteer stats, pending reports, and quick system health.
- Reports page with recent reports, pending reports, AI logs, and process-report action.
- Tasks page with urgent tasks, match suggestions, and task rescoring.
- Volunteers page with roster, engagement, workload, and notifications.
- AI Insights page with Gemini-generated insight feed and reference-data ingestion.
- Predictions page for early warning signals.
- Governance page for fairness, load, regional distribution, and AI governance text.
- Audit page for transparent activity history.
- Impact page for metrics and NGO reports.

The admin app calls the backend through `web/components/admin-api.ts` and expects the API envelope produced by the backend response interceptor.

## Mobile Field App

The Expo app is designed for volunteers and field workers. It includes:

- Firebase login/register and backend JWT exchange.
- Dashboard with live map markers, urgent counts, completion rates, predictions, and top urgent need.
- Smart Report screen for camera scan, voice recording, WhatsApp handoff, PDF/image upload, manual entry, and quick text reports.
- Tasks screen with urgent task feed, AI urgency explanations, and accept/decline UI.
- Impact screen with live community summary and network pulse.
- Profile screen with points, badges, AI coach copy, local profile edit, and logout.

## Testing and Quality

Backend:

```bash
cd backend
npm run lint
npm test
npm run build
```

Web:

```bash
cd web
npm run lint
npm run build
```

Mobile:

```bash
cd app
npm run lint
```

Existing backend tests cover:

- Extraction schema validation
- Urgency scoring bounds and persistence
- Matching batch uniqueness
- Offline sync duplicate handling

## Development Notes

- Run backend and web on different ports. The backend defaults to `3000`; use `3001` for Next.js when needed.
- Create and migrate the PostgreSQL database before seeding.
- Seed data creates demo roles, permissions, an NGO, users, locations, skills, languages, a sample report, task, assignment, notification, impact metric, prediction, and audit entry.
- The backend response interceptor wraps successful responses in a consistent API envelope.
- Global validation strips unknown DTO properties and rejects non-whitelisted fields.
- Swagger is available at `/docs` after the backend starts.
- The mobile app currently has API base URL logic in `app/src/api/client.ts`.
- Generated dependency directories such as `node_modules` are not part of the architecture and should stay out of commits.

## Deployment Notes

Backend:

- Set production `DATABASE_URL`, `JWT_SECRET`, Firebase service credentials, Gemini configuration, and storage settings.
- Run `npm run prisma:deploy` before `npm run start:prod`.
- Serve behind HTTPS and configure CORS for the admin and mobile clients.

Web:

- Deploy as a Next.js app.
- Set `NEXT_PUBLIC_FIREBASE_*` variables.
- Point the login screen to the deployed backend base URL.

Mobile:

- Set `EXPO_PUBLIC_FIREBASE_*` variables for the build profile.
- Update API base URL logic for production backend URLs before release builds.

## Useful Commands

```bash
# Backend
cd backend
npm run start:dev
npm run prisma:migrate -- --name init
npm run prisma:seed
npm test

# Admin web
cd web
npm run dev -- -p 3001
npm run build

# Mobile app
cd app
npm run start
npm run android
npm run ios
```

## Repository Status

This README describes the current codebase as a three-part application: NestJS backend, Next.js admin dashboard, and Expo mobile app. The most important next improvements would be adding root-level orchestration scripts, a Docker Compose file for PostgreSQL/backend/web, and production environment examples for each deployment target.
