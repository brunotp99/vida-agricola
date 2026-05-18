# Database Seed Guide

## Overview

The seed script at `prisma/seed.ts` populates the database with:
- 6 top-level categories (with subcategories)
- 8 brands
- 12 products (from `lib/data.ts`, migrated to DB format)
- 1 admin user (credentials from env vars)
- 1 customer user (for testing)
- 3 sample orders with order items
- 5 coupons (including the legacy "WELCOME15")
- 3 testimonials (stored as CMS records if a Testimonial model is added, or kept static)

## Running the Seed

```bash
pnpm prisma db seed
```

Configure the seed command in `package.json`:
```json
{
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
}
```

Install `tsx` as a dev dependency: `pnpm add -D tsx`

## Resetting and Reseeding

```bash
pnpm prisma migrate reset
# This runs: drop all tables → re-run migrations → run seed
```

## Admin User Credentials

The admin user is created with credentials from environment variables:
```
ADMIN_EMAIL=admin@vidaagricola.pt
ADMIN_PASSWORD=<set in .env.local>
```

The customer test user uses hardcoded development credentials:
```
Email: customer@test.com
Password: Test1234!
```

## Seed Data Structure

### Products (from `lib/data.ts`)

All 12 products are seeded with their existing slugs to preserve any bookmarked URLs:
- prod-001 → prod-012 (mapped to new CUID ids)
- Images from Unsplash are kept as external URLs
- Prices, ratings, descriptions are preserved from the static data

### Coupons

| Code | Type | Value | Min Order | Max Uses |
|------|------|-------|-----------|---------|
| WELCOME15 | percentage | 15% | — | unlimited |
| FARM10 | percentage | 10% | €50 | 100 |
| SUMMER25 | fixed | €25 | €100 | 50 |
| POULTRY5 | fixed | €5 | €30 | unlimited |
| NEWUSER20 | percentage | 20% | — | 1 per user |

## Idempotency

The seed script uses `upsert` for all records (matching on `slug` or `email`) so it can be run multiple times without creating duplicates. Orders are only created if the order `orderNumber` doesn't already exist.
