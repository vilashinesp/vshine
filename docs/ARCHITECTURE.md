# Architecture

## Overview
TailorMate is a three-tier application:

```
┌─────────────────┐      HTTPS/JSON       ┌──────────────────┐      SQL       ┌──────────────┐
│  Next.js 15      │ ───────────────────▶ │  FastAPI backend  │ ─────────────▶ │  Supabase     │
│  (Vercel)         │ ◀─────────────────── │  (Render, Docker)  │ ◀───────────── │  PostgreSQL   │
└─────────────────┘                        └──────────────────┘                 └──────────────┘
                                                     │
                                                     ▼
                                            Supabase Storage
                                        (images, invoices, chat files)
```

## Backend layering
- **api/** — FastAPI routers per domain (auth, users, tailors, bookings, orders, payments, chat, notifications, admin, ai). Routers only handle HTTP concerns: validation, auth guards, response shaping.
- **crud/** — database access functions, one module per domain, no HTTP awareness.
- **schemas/** — Pydantic request/response models.
- **models/** — SQLAlchemy ORM models, mirroring `database/schema.sql`.
- **services/** — integrations with external systems (Stripe, Razorpay, Anthropic AI).
- **core/** — config, JWT/security helpers, and dependency-injection guards (`get_current_user`, `require_*` role checks).

## Auth model
JWT-based, issued by the FastAPI backend (not Supabase Auth) so that a single
role-aware token works across REST calls and can carry custom claims. Access
tokens are short-lived (30 min default); refresh tokens are stored server-side
in `refresh_tokens` so they can be revoked on logout.

## Frontend structure
- **app/** — Next.js App Router pages, grouped by role where relevant (`/tailor/*`, `/admin/*`).
- **components/** — shared UI, split into `ui/` (primitives), `layout/` (shell, nav), and per-domain folders (`dashboard/`, `booking/`, `tailor/`, `admin/`).
- **services/** — typed wrappers around backend endpoints (`auth.ts`, `bookings.ts`).
- **lib/** — cross-cutting utilities: `api.ts` (axios instance with token refresh interceptor), `utils.ts` (class merging).
- **middleware.ts** — edge middleware protecting `/dashboard`, `/admin`, `/tailor`, etc., redirecting unauthenticated users to `/login` and enforcing role-based prefixes.

## Order lifecycle
A **booking** is a request; once a tailor accepts it, an **order** is created
automatically (see `bookings/router.py`) and moves through the fixed status
pipeline defined in `docs/DATABASE.md`. Every transition is both persisted
(`order_status_history`) and pushed to the customer as a notification.

## AI features
`services/ai_service.py` wraps the Anthropic API for three features:
measurement suggestion from height/weight/garment type, a general tailoring
chat assistant, and fabric/color recommendations — all called from `/api/v1/ai/*`.
