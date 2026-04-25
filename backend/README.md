# Smart Resource Allocation Backend

Production-oriented NestJS backend for an NGO/community-help platform. It ingests scattered field data, uses Gemini to extract structured records, scores urgency, matches volunteers, tracks assignments and impact, and exposes dashboard/reporting APIs.

## Stack

- NestJS + TypeScript
- PostgreSQL + Prisma
- JWT auth + role guards
- Gemini API via `@google/genai`
- Local file staging under `uploads/`, with optional Cloudflare R2 object storage
- Swagger/OpenAPI at `/docs`
- Jest unit tests

## Quick Start

```bash
cd ..
npm install
cd backend
cp .env.example .env
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run prisma:seed
npm run start:dev
```

Open:

- API: `http://localhost:3000/api/v1`
- Swagger: `http://localhost:3000/docs`

Demo accounts seeded with password `Password123!`:

- `admin@karuna.local`
- `coordinator@karuna.local`
- `volunteer@karuna.local`

## Environment

Required:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/smart_resource_allocation?schema=public
JWT_SECRET=replace-with-a-long-random-secret
```

Create the database in your local PostgreSQL before running migrations:

```bash
createdb smart_resource_allocation
```

If your local Postgres user/password/database differs, update `DATABASE_URL` in `backend/.env`.

Optional Gemini:

```env
GEMINI_API_KEY=your-key
GEMINI_MODEL=gemini-3-flash-preview
```

To use the Vertex AI Gemini setup from the root-level `API TEST/index.js`, set:

```env
GEMINI_USE_VERTEX_AI=true
GEMINI_VERTEX_PROJECT=your-gcp-project-id
GEMINI_VERTEX_LOCATION=us-central1
GOOGLE_APPLICATION_CREDENTIALS=../API TEST/key.json
GEMINI_MODEL=gemini-2.5-flash
```

If neither Vertex AI nor `GEMINI_API_KEY` is configured, the app uses a deterministic demo extractor so hackathon flows still work offline.

Optional Cloudflare R2 storage:

```env
CLOUDFLARE_R2_ENABLED=true
CLOUDFLARE_R2_ACCOUNT_ID=your-account-id
CLOUDFLARE_R2_ACCESS_KEY_ID=your-r2-access-key
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your-r2-secret
CLOUDFLARE_R2_BUCKET=your-bucket
CLOUDFLARE_R2_PUBLIC_BASE_URL=https://media.example.org
```

Uploaded files are always staged under `uploads/` for local processing and Gemini inline file reads. When R2 is enabled, the backend also uploads the object to Cloudflare R2 and stores provider, bucket, object key, public URL, local path, MIME type, size, and processing state in PostgreSQL.

## Main Workflows

### Auth

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"coordinator@karuna.local","password":"Password123!"}'
```

Use the returned token:

```bash
export TOKEN="paste-access-token"
```

### Create a Text Report

```bash
curl -X POST http://localhost:3000/api/v1/reports \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "source": "TEXT",
    "rawText": "Urgent water support needed for 30 elderly people in Mullai Colony",
    "idempotencyKey": "mobile-001"
  }'
```

The backend stores the raw report, records an AI processing log, extracts fields, creates a task, and calculates urgency.

### Offline Sync

```bash
curl -X POST http://localhost:3000/api/v1/reports/sync \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "source": "SYNC",
    "rawText": "Food packets required for 18 families",
    "idempotencyKey": "device-a:report-42",
    "clientRecordId": "report-42",
    "deviceId": "device-a"
  }'
```

Repeated submissions with the same user and `idempotencyKey` return `duplicate: true`.

### Upload Survey Photo or Voice Note

```bash
curl -X POST http://localhost:3000/api/v1/reports/{reportId}/media \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@survey.jpg"
```

Supported demo MIME types include JPEG, PNG, WEBP, MP3, WAV, WEBM, MP4 audio, and M4A. Files are staged in `uploads/`, while metadata and processing status live in PostgreSQL. If Cloudflare R2 is enabled, file objects are mirrored to R2.

If direct Gemini audio extraction fails, the report and media are marked `TRANSCRIPTION_REQUIRED`. A coordinator can add a manual transcript and retry processing:

```bash
curl -X POST http://localhost:3000/api/v1/reports/{reportId}/media/{mediaId}/transcript \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"transcript":"Voice note says urgent medical support is needed for 8 elderly people."}'

curl -X POST http://localhost:3000/api/v1/ai/reports/{reportId}/process \
  -H "Authorization: Bearer $TOKEN"
```

### Urgent Tasks

```bash
curl http://localhost:3000/api/v1/tasks/urgent \
  -H "Authorization: Bearer $TOKEN"
```

Urgency scores are explainable JSON breakdowns with severity, affected people, vulnerable groups, report age, fragile people, recurrence, and isolation factors.

### Matching

```bash
curl -X POST http://localhost:3000/api/v1/matching/suggest \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"taskId":"TASK_ID"}'
```

Batch planning:

```bash
curl -X POST http://localhost:3000/api/v1/matching/batch-plan \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"taskIds":["TASK_ID_1","TASK_ID_2"]}'
```

### Assignment Approval

```bash
curl -X POST http://localhost:3000/api/v1/assignments \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"taskId":"TASK_ID","volunteerId":"VOLUNTEER_ID","matchScore":86,"explanation":{"reason":"nearby and skilled"}}'

curl -X POST http://localhost:3000/api/v1/assignments/{assignmentId}/approve \
  -H "Authorization: Bearer $TOKEN"
```

Approval creates audit logs and volunteer notifications.

## API Areas

- `/api/v1/auth`
- `/api/v1/users`, `/api/v1/roles`, `/api/v1/volunteers`
- `/api/v1/reports`
- `/api/v1/reports/:id/media`
- `/api/v1/ai`
- `/api/v1/tasks`
- `/api/v1/matching`
- `/api/v1/assignments`
- `/api/v1/dashboard`
- `/api/v1/predictions`
- `/api/v1/analytics`
- `/api/v1/notifications`
- `/api/v1/audit-logs`
- `/api/v1/locations`

## Gemini Notes

The AI service uses:

- Structured JSON output with a Zod-derived JSON schema
- Inline image/audio parts for files under the configured upload size
- Vertex AI Gemini config compatible with the provided `API TEST` folder
- Processing logs with model, prompt version, request type, latency, confidence, status, and sanitized error text

If direct audio extraction fails, the report/media remains in a failed processing state and can be retried through `POST /api/v1/ai/reports/:id/process`.

## Testing

```bash
npm test
```

Current tests cover:

- Gemini extraction schema validation
- Urgency score bounds and breakdown persistence
- Batch matching uniqueness
- Offline sync duplicate handling

## Project Structure

```text
src/
  ai/             Gemini extraction and AI processing logs
  analytics/      Impact summaries and NGO reports
  assignments/    Assignment approval/completion workflows
  audit/          Audit log API
  auth/           JWT auth
  common/         Guards, decorators, filters, interceptors, DTO helpers
  dashboard/      Live dashboard REST polling data
  directory/      Users, roles, volunteers
  locations/      Map-ready village/district data
  matching/       Volunteer scoring and batch allocation
  media/          Local upload metadata and validation
  notifications/  In-app notification history
  predictions/    Early-warning alerts
  prisma/         Prisma client service
  reports/        Report ingestion and offline sync
  tasks/          Needs/tasks and urgent queue
  urgency/        Explainable urgency scoring
prisma/
  schema.prisma
  seed.ts
```

## Production Hardening Next Steps

- Replace immediate in-process AI processing with BullMQ/Redis workers.
- Enable S3-compatible storage through the media service interface.
- Add refresh tokens, password reset, and stronger account lifecycle controls.
- Add row-level organization scoping policies at the service layer.
- Add live updates via SSE/WebSockets for dashboards and assignment alerts.
