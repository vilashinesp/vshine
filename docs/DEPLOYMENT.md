# Deployment Guide

## 1. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<your-username>/tailormate.git
git push -u origin main
```

## 2. Set up Supabase
1. Create a new project at https://supabase.com.
2. Open the SQL editor and run, in order:
   - `database/schema.sql`
   - `database/functions.sql`
   - `database/triggers.sql`
   - `database/policies.sql`
   - `database/seed.sql`
3. Copy your **Project URL**, **anon key**, **service_role key**, and the
   **connection string** (Settings → Database → Connection string → Session pooler).

## 3. Deploy the backend to Render
1. Create a new **Web Service** on Render, pointing at the `backend/` directory
   (or connect the repo and Render will detect `render.yaml`).
2. Set environment variables from `backend/.env.example`, using your real
   Supabase and payment gateway credentials.
3. Render will build the Dockerfile and run `uvicorn app.main:app`.
4. Once live, run migrations against the deployed database:
   ```bash
   alembic upgrade head
   ```

## 4. Deploy the frontend to Vercel
1. Import the repo into Vercel, set the **root directory** to `frontend/`.
2. Add environment variables from `frontend/.env.example`, pointing
   `NEXT_PUBLIC_API_URL` at your Render backend (e.g. `https://tailormate-api.onrender.com/api/v1`).
3. Deploy — Vercel auto-detects Next.js.

## 5. Connect a custom domain
- **Vercel**: Project → Settings → Domains → add your domain, update DNS
  (CNAME to `cname.vercel-dns.com` or A record as instructed).
- **Render**: Service → Settings → Custom Domain → add your API subdomain
  (e.g. `api.yourdomain.com`) and update DNS with the provided CNAME.
- Update `FRONTEND_URL` (backend) and `NEXT_PUBLIC_API_URL` (frontend) to the
  final domains and redeploy both.

## 6. Google OAuth setup
1. Create OAuth credentials in Google Cloud Console.
2. Add authorized origins: your Vercel domain and `http://localhost:3000`.
3. Add authorized redirect URI matching `GOOGLE_REDIRECT_URI`.
4. Set `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` in both frontend and backend env vars.

## 7. Payments
- **Stripe**: create an account, get test keys, set `STRIPE_SECRET_KEY` and
  configure a webhook endpoint at `/api/v1/payments/stripe/webhook`, copying
  the signing secret into `STRIPE_WEBHOOK_SECRET`.
- **Razorpay**: create an account, get test key ID/secret, set
  `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET`.

## Local development
```bash
docker-compose up --build
```
This starts Postgres, the FastAPI backend on `:8000`, and the Next.js frontend on `:3000`.
