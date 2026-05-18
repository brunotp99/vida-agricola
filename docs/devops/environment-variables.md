# Environment Variables

All variables go in `.env.local` for local development. Production values go in the Vercel project settings.

## Required

| Variable | Purpose | Example |
|----------|---------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:postgres@localhost:5432/vida_agricola` |
| `BETTER_AUTH_SECRET` | Signs auth cookies (32+ chars) | `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | Base URL for auth redirects | `http://localhost:3000` |
| `NEXT_PUBLIC_APP_URL` | Public-facing app URL (used by auth-client) | `http://localhost:3000` |
| `ADMIN_EMAIL` | Email of the seeded admin user | `admin@vidaagricola.pt` |
| `ADMIN_PASSWORD` | Password of the seeded admin user | strong password |

## Stripe (required for checkout)

| Variable | Purpose |
|----------|---------|
| `STRIPE_SECRET_KEY` | Stripe server-side key (`sk_test_...` for dev) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe client-side key (`pk_test_...` for dev) |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret (`whsec_...` from Stripe CLI or dashboard) |

## OAuth (optional — app works without them)

| Variable | Purpose |
|----------|---------|
| `GOOGLE_CLIENT_ID` | Google OAuth app client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth app client secret |
| `GITHUB_CLIENT_ID` | GitHub OAuth app client ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth app client secret |

## Email (optional — required for transactional emails)

| Variable | Purpose |
|----------|---------|
| `RESEND_API_KEY` | Resend API key for sending emails |
| `EMAIL_FROM` | Sender address (e.g. `noreply@vidaagricola.pt`) |

## `.env.example` Template

```
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/vida_agricola

# Auth
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Admin seed credentials
ADMIN_EMAIL=admin@vidaagricola.pt
ADMIN_PASSWORD=

# Stripe
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# OAuth (optional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# Email (optional)
RESEND_API_KEY=
EMAIL_FROM=noreply@vidaagricola.pt
```

## Validation (`lib/env.ts`)

All env vars are validated at server startup using `@t3-oss/env-nextjs`. The app will throw a descriptive error if a required variable is missing or malformed, rather than failing silently at runtime.
