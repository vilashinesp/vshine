# TailorMate

A modern, AI-powered tailoring management and customer booking platform —
book a vetted tailor, track your order from cutting to delivery, and chat
with your tailor along the way.

## Overview

TailorMate connects customers, tailors, and platform admins in one place:

- **Customers** browse tailors, book fittings, upload cloth/design references, track orders in real time, chat with their tailor, and pay online.
- **Tailors** manage incoming bookings, run their service catalog, advance orders through the stitching pipeline, and see revenue analytics.
- **Admins** approve tailors, moderate users, manage coupons, and monitor platform-wide metrics.

## Features

- Email + Google OAuth authentication with JWT access/refresh tokens
- Role-based dashboards (customer / tailor / admin)
- Full booking → order pipeline: pending → accepted → measurement → cutting → stitching → ironing → ready → delivered
- Real-time-feeling order tracking with a visual status timeline
- In-app chat between customers and tailors
- Notifications feed
- Wishlist, reviews & ratings
- Cash / UPI / Stripe / Razorpay payments
- AI measurement suggestions, tailoring chat assistant, and fabric/color recommendations (Anthropic API)
- Admin CMS-lite: coupons, tailor approvals, platform analytics

## Screenshots

_Add screenshots of the landing page, customer dashboard, and tailor order flow here._

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15, TypeScript, Tailwind CSS, Framer Motion, React Hook Form, Zod |
| Backend | FastAPI, SQLAlchemy, Alembic, JWT auth, Pydantic |
| Database | Supabase PostgreSQL (with RLS) |
| Storage | Supabase Storage |
| Payments | Stripe, Razorpay |
| AI | Anthropic API |
| Deployment | Vercel (frontend), Render (backend), Supabase (database) |

## Folder structure

```
TailorMate/
├── frontend/        Next.js app
├── backend/          FastAPI app
├── database/         Raw SQL: schema, RLS policies, triggers, functions, seed data
├── docs/               API, deployment, database, and architecture docs
├── .github/workflows/  CI for frontend and backend
└── docker-compose.yml  Local dev: Postgres + backend + frontend
```

See `docs/ARCHITECTURE.md` for a deeper breakdown of each layer.

## Getting started (local development)

### Prerequisites
- Node.js 20+, Python 3.12+, Docker (optional but recommended)

### Quick start with Docker
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
docker-compose up --build
```
Frontend: http://localhost:3000 · Backend docs: http://localhost:8000/docs

### Manual setup

**Backend**
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # fill in DATABASE_URL, SECRET_KEY, Supabase keys
alembic upgrade head
uvicorn app.main:app --reload
```

**Frontend**
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

**Database**
Run the SQL files in `database/` against your Supabase project in this order:
`schema.sql` → `functions.sql` → `triggers.sql` → `policies.sql` → `seed.sql`.

## Deployment

Full step-by-step instructions (GitHub → Vercel → Render → Supabase, custom
domains, OAuth, payment webhooks) are in `docs/DEPLOYMENT.md`.

## API documentation

See `docs/API.md` for the full endpoint reference, or run the backend and
visit `/docs` for interactive Swagger UI.

## License

MIT — see `LICENSE`.
