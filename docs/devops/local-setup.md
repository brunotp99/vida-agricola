# Local Development Setup

## Prerequisites

- Node.js 20+
- pnpm (`npm install -g pnpm`)
- Docker Desktop (for PostgreSQL)
- Stripe CLI (for webhook testing)

## Setup Steps

### 1. Clone and install dependencies

```bash
git clone <repo-url>
cd agriculture-ecommerce-app
pnpm install
```

### 2. Start PostgreSQL

```bash
docker compose up -d
```

This starts a PostgreSQL 16 instance on `localhost:5432`.

### 3. Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` with your values. Minimum required for local dev:
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/vida_agricola
BETTER_AUTH_SECRET=<run: openssl rand -base64 32>
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
ADMIN_EMAIL=admin@vidaagricola.pt
ADMIN_PASSWORD=Admin1234!
```

Stripe keys are optional until you work on the checkout feature.

### 4. Run database migrations

```bash
pnpm prisma migrate dev
```

### 5. Seed the database

```bash
pnpm prisma db seed
```

### 6. Start the dev server

```bash
pnpm dev
```

The app is available at `http://localhost:3000`.

### 7. (Optional) Start Prisma Studio

```bash
pnpm prisma studio
```

Opens a database GUI at `http://localhost:5555`.

### 8. (Optional) Test Stripe webhooks

Install the Stripe CLI, then:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copy the displayed webhook signing secret to `STRIPE_WEBHOOK_SECRET` in `.env.local`.

## Common Commands

```bash
pnpm dev                      # Start dev server
pnpm build                    # Production build
pnpm lint                     # ESLint
pnpm test                     # Vitest unit + integration tests
pnpm e2e                      # Playwright E2E tests
pnpm prisma migrate dev       # Create and apply a new migration
pnpm prisma db seed           # Seed the database
pnpm prisma migrate reset     # Drop DB, re-migrate, re-seed (local only)
pnpm prisma studio            # Open Prisma Studio
docker compose up -d          # Start PostgreSQL
docker compose down           # Stop PostgreSQL
```
