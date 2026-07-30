# Database

TailorMate uses Supabase PostgreSQL. Schema files live in `/database` and are
applied directly via the Supabase SQL editor (or `psql`), while the backend's
SQLAlchemy models in `backend/app/models/` mirror the same tables for the API layer.

## Core tables
- **users** — all accounts (customer/tailor/admin), with optional Google OAuth linkage
- **tailor_profiles** — shop details, location, approval status, rating
- **categories / services** — service catalog per tailor
- **measurements** — saved customer body measurements, reusable across bookings
- **bookings** — a request for a service on a date/time, before payment/order creation
- **orders** — created once a booking is accepted; tracks the full stitching pipeline
- **order_status_history** — audit trail of every status change
- **payments** — one or more payment attempts per order (cash/upi/stripe/razorpay)
- **reviews** — one review per delivered order
- **wishlist** — saved tailors/services
- **chat_threads / chat_messages** — customer ↔ tailor messaging
- **notifications** — in-app notification feed
- **refresh_tokens** — JWT refresh token tracking (revocable)
- **coupons** — discount codes
- **site_settings** — key/value CMS settings for admin

## Order status flow
```
pending → accepted → measurement → cutting → stitching → ironing → ready → delivered
                 ↘ rejected                                          ↘ cancelled
```

## Row Level Security
All tables have RLS enabled (`database/policies.sql`). The backend issues its
own JWTs (not Supabase Auth tokens), so policies read the role/sub claims via
`current_setting('request.jwt.claims')` — the FastAPI service should connect
using the Supabase service role for trusted server-side writes, while any
direct client-side Supabase calls (e.g. realtime subscriptions) rely on RLS
using a JWT minted with the same claim shape.

## Triggers
- Auto-touch `updated_at` on every mutable table
- Auto-generate human-readable `order_number` (`TM-YYYYMMDD-0001`)
- Log every order status change into `order_status_history`
- Recalculate `tailor_profiles.avg_rating` / `total_reviews` on new reviews
- Insert a customer notification when a booking's status changes

## Migrations
The FastAPI backend also owns Alembic migrations (`backend/alembic/`) against
the same schema, for environments that prefer migration-driven schema changes
instead of running the raw SQL files directly. Keep both in sync when adding
columns.
