# Capsi Books (Billing Studio)

Monorepo layout:

- **`frontend/`** — Next.js UI (pages, components)
- **`backend/`** — Express API + MongoDB

## Quick start

### 1. Backend

```bash
cd backend
cp .env.example .env   # edit if needed
npm install
npm run dev
```

API runs at **http://localhost:4000**

### 2. Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

App runs at **http://localhost:3000** — `/api/*` requests proxy to the backend.

### Requirements

- Node.js 20+
- MongoDB on `127.0.0.1:27017` (database: `billing`)

## Environment

| Variable | Where | Purpose |
|----------|--------|---------|
| `MONGODB_URI` | backend `.env` | MongoDB connection |
| `SESSION_SECRET` | backend + frontend | Must match for auth cookies |
| `FRONTEND_URL` | backend `.env` | CORS origin (`http://localhost:3000`) |
| `BACKEND_URL` | frontend `.env.local` | API proxy target |

## Scripts (from repo root)

```bash
npm install          # installs root helper only
npm run dev          # runs backend + frontend together (requires `npm install` in each folder first)
```
