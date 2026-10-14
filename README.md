# SpiderGPT — Your AI Sidekick

Production-oriented full-stack SpiderGPT application using **Supabase for PostgreSQL + Google authentication**, with an Express API and React/Vite frontend.

## Product rules

- Free: 30 AI responses/day; Brain, Chill, Focus; 1 Spider name change/month; 2 legacy appearance changes/month; no custom appearance; 3 image generations/day.
- Pro: 150 AI responses/day; Brain, Chill, Chaos, Create, Focus; 5 name changes/month; 10 legacy appearance changes/month; custom appearance entitlement; 15 image generations/day.
- Plus: unlimited AI responses; all six modes; unlimited name changes; unlimited legacy appearance changes; custom appearance entitlement; 35 image generations/day.
- Customize Spider is behavior/personalization only. It does not change or upload a Spider photo.

## Stack

- Frontend: React + Vite
- Backend: Node.js + Express
- Database: Supabase PostgreSQL
- Authentication: Supabase Auth + Google OAuth
- Application session: secure HTTP-only cookies with short-lived access and rotated refresh tokens
- Optional production rate limiting: Redis
- AI: Gemini/OpenAI/OpenRouter adapters
- Payments: Razorpay subscriptions and Stripe subscriptions

## Requirements

- Node.js 20+ (22 recommended)
- A Supabase project
- Google provider enabled in Supabase Auth
- One supported AI provider key
- At least one payment provider for production
- Redis is recommended for production distributed rate limiting, but is not required for local development

## Supabase setup

1. Create a Supabase project.
2. In **Authentication → Providers → Google**, enable Google.
3. Configure the Google OAuth credentials in Supabase. Use the callback URL shown by Supabase for your project.
4. In **Authentication → URL Configuration**, add the local frontend URL:
   - `http://localhost:5173`
5. In **Project Settings → API**, copy:
   - Project URL
   - anon/public key
6. In **Project Settings → Database → Connect**, copy a PostgreSQL connection string. The Session Pooler connection string is usually the easiest option on Windows/local networks.
7. Never put the Supabase service-role key in the frontend.

## Local setup

### Backend

Copy:

```text
server/.env.example → server/.env
```

Set at least:

```env
WEB_ORIGIN=http://localhost:5173
DATABASE_URL=<Supabase Postgres connection string>
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_ANON_KEY=<Supabase anon key>
JWT_SECRET=<long random secret>
AI_PROVIDER=gemini
AI_API_KEY=<Gemini key>
AI_MODEL=gemini-2.5-flash
```

For local development, `REDIS_URL` can be left empty. The rate limiter falls back to memory. Production should use Redis.

### Database migrations

Run the SQL files in order against the Supabase database:

```bash
psql "$DATABASE_URL" -f db/001_init.sql
psql "$DATABASE_URL" -f db/002_auth.sql
psql "$DATABASE_URL" -f db/003_plans.sql
psql "$DATABASE_URL" -f db/004_production.sql
psql "$DATABASE_URL" -f db/005_supabase.sql
psql "$DATABASE_URL" -f db/seed_prices.sql
```

You can also paste the SQL contents into the Supabase SQL Editor in the same order.

### Frontend

Copy:

```text
web/.env.example → web/.env
```

Set:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=<Supabase anon key>
```

Install and run backend:

```bash
cd server
npm install
npm run dev
```

In another terminal:

```bash
cd web
npm install
npm run dev
```

Open `http://localhost:5173`.

## Authentication flow

Google login is handled by Supabase Auth. After Supabase establishes the Google session, the frontend sends the Supabase access token to `/auth/supabase`. The backend verifies the token with Supabase Auth, maps the Supabase user UUID to the application user, and issues SpiderGPT's secure HTTP-only application session cookies.

The Supabase access token, refresh token, database credentials, and payment secrets are never exposed to the backend client beyond the normal Supabase browser session.

## AI

Supported server-side adapters: `gemini`, `openai`, and `openrouter`. Set `AI_PROVIDER`, `AI_API_KEY`, and `AI_MODEL`. For OpenAI-compatible providers, `AI_BASE_URL` can be used.

## Payments

The backend supports Razorpay subscriptions and Stripe Checkout subscriptions. Configure the relevant provider keys and recurring plan/price IDs. Payment access is not activated from frontend success alone: provider verification and webhooks update the authoritative subscription record.

Webhook endpoints:

- `POST /webhooks/razorpay`
- `POST /webhooks/stripe`

For production, use HTTPS and a public backend origin.

## Production checklist

- Use Supabase PostgreSQL.
- Enable Google in Supabase Auth.
- Use a strong random `JWT_SECRET`.
- Configure a real AI provider.
- Configure at least one payment provider.
- Configure payment webhooks.
- Set the exact public `WEB_ORIGIN`; never use `*`.
- Use HTTPS.
- Use Redis for distributed rate limiting.
- Keep service-role and payment secrets server-side only.
- Back up your Supabase database.
- Run migrations before starting the application.
- Test Razorpay/Stripe in sandbox/test mode before enabling live payments.

## Tests

```bash
cd server
npm install
npm test
```

## Docker

Docker is **not required** for local development because PostgreSQL and Google authentication are provided by Supabase. The included `docker-compose.yml` is only for running the application containers if desired; it does not start a local PostgreSQL database.
