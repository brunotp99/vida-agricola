# Phase 1 — Foundation (Tasks 1–15)

**Goal**: A runnable, correctly typed, linted, and containerised dev environment with a complete Prisma schema and seed data.

---

## Task 1 — Rename and configure the project

**What to do**:
- Update `package.json` `"name"` field to `"vida-agricola"`
- Update the `title` in `app/layout.tsx` metadata to reflect the final brand name
- Verify `pnpm dev` starts without errors

**Files**: `package.json`, `app/layout.tsx`

**Acceptance**: `pnpm dev` starts; browser tab shows "Vida Agrícola | Mercado Natural"

---

## Task 2 — Fix TypeScript strictness

**What to do**:
- In `next.config.mjs`: set `typescript.ignoreBuildErrors: false` and `eslint.ignoreDuringBuilds: false`
- Run `pnpm build` and fix all TypeScript errors that surface
- **Known bug**: `components/mega-menu.tsx` references `product.salePrice` which does not exist on the `Product` interface in `lib/data.ts` — fix this by removing or replacing it with `product.originalPrice`
- Fix any other errors revealed by enabling strict mode

**Files**: `next.config.mjs`, `components/mega-menu.tsx` (and any others with type errors)

**Acceptance**: `pnpm build` completes with zero TypeScript errors and zero ESLint errors

---

## Task 3 — Add ESLint + Prettier + Husky

**What to do**:
- Install: `pnpm add -D prettier eslint-config-prettier husky lint-staged`
- Create `.prettierrc`:
  ```json
  { "semi": false, "singleQuote": false, "tabWidth": 2, "printWidth": 100 }
  ```
- Update `.eslintrc.json` to extend `"next/core-web-vitals"` and `"prettier"`
- Run `pnpm husky init`
- Create `.husky/pre-commit`:
  ```bash
  pnpm lint-staged
  ```
- Add to `package.json`:
  ```json
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md,css}": ["prettier --write"]
  }
  ```

**Files**: `.prettierrc`, `.eslintrc.json`, `.husky/pre-commit`, `package.json`

**Acceptance**: Committing a file with an unused import is blocked; `pnpm lint` exits 0 on the clean codebase

---

## Task 4 — Add environment variable validation

**What to do**:
- Install: `pnpm add @t3-oss/env-nextjs zod` (zod is already installed)
- Create `lib/env.ts`:
  ```typescript
  import { createEnv } from "@t3-oss/env-nextjs"
  import { z } from "zod"

  export const env = createEnv({
    server: {
      DATABASE_URL: z.string().url(),
      BETTER_AUTH_SECRET: z.string().min(32),
      ADMIN_EMAIL: z.string().email(),
      ADMIN_PASSWORD: z.string().min(8),
      STRIPE_SECRET_KEY: z.string().optional(),
      STRIPE_WEBHOOK_SECRET: z.string().optional(),
      RESEND_API_KEY: z.string().optional(),
    },
    client: {
      NEXT_PUBLIC_APP_URL: z.string().url(),
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
    },
    runtimeEnv: { /* map all vars */ },
  })
  ```
- Create `.env.example` from the template in [devops/environment-variables.md](../devops/environment-variables.md)
- Import `lib/env.ts` in `lib/prisma.ts` to ensure it runs at server startup

**Files**: `lib/env.ts`, `.env.example`

**Acceptance**: Starting the server without `DATABASE_URL` throws `Invalid environment variables: DATABASE_URL: Invalid url`

---

## Task 5 — Docker Compose for local PostgreSQL

**What to do**:
- Create `docker-compose.yml` (see [devops/docker.md](../devops/docker.md) for the full file)
- Create `.env.local` from `.env.example` and set `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/vida_agricola`
- Verify connectivity: `docker compose up -d && psql $DATABASE_URL -c '\l'`

**Files**: `docker-compose.yml`, `.env.local`

**Acceptance**: `docker compose up -d` starts without errors; `psql` can connect

---

## Task 6 — Install and configure Prisma

**What to do**:
- Install: `pnpm add prisma @prisma/client`
- Run `pnpm prisma init --datasource-provider postgresql`
- Update `prisma/schema.prisma` datasource to use `env("DATABASE_URL")`
- Create `lib/prisma.ts`:
  ```typescript
  import { PrismaClient } from "@prisma/client"

  const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

  export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({ log: process.env.NODE_ENV === "development" ? ["query"] : [] })

  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
  ```

**Files**: `prisma/schema.prisma`, `lib/prisma.ts`

**Acceptance**: `pnpm prisma studio` opens without error

---

## Task 7 — Prisma schema: Users & Auth

**What to do**:
- Add `User`, `Account`, `Session`, `VerificationToken` models to `prisma/schema.prisma`
- Models must match Better Auth's expected field names (see [architecture/auth-design.md](../architecture/auth-design.md))
- Include `Role` enum with `admin`, `staff`, `customer`
- Run: `pnpm prisma migrate dev --name init-auth`

**Files**: `prisma/schema.prisma`

**Acceptance**: Migration succeeds; `User`, `Account`, `Session`, `VerificationToken` tables exist in the DB

---

## Task 8 — Prisma schema: Catalog models

**What to do**:
- Add `Category` (with self-referential parent/children), `Brand`, `Product`, `ProductImage`, `ProductVariant`, `ProductTag`, `Specification` models
- See full schema in [architecture/database-schema.md](../architecture/database-schema.md)
- Run: `pnpm prisma migrate dev --name add-catalog`

**Files**: `prisma/schema.prisma`

**Acceptance**: Migration succeeds; all 7 tables exist with correct columns and foreign keys

---

## Task 9 — Prisma schema: Commerce models

**What to do**:
- Add `Cart`, `CartItem`, `WishlistItem`, `Order`, `OrderItem`, `Address`, `Review`, `Coupon`, `CouponUsage` models
- Add `OrderStatus` and `CouponType` enums
- Run: `pnpm prisma migrate dev --name add-commerce`

**Files**: `prisma/schema.prisma`

**Acceptance**: Migration succeeds; all models navigable in Prisma Studio

---

## Task 10 — Prisma schema: CMS & Analytics models

**What to do**:
- Add `BlogPost`, `BlogTag`, `NewsletterSub`, `InventoryLog`, `AnalyticsEvent` models
- Add `BlogStatus` enum
- Run: `pnpm prisma migrate dev --name add-cms-analytics`

**Files**: `prisma/schema.prisma`

**Acceptance**: Migration succeeds

---

## Task 11 — Full-text search tsvector migration

**What to do**:
- Create migration without applying: `pnpm prisma migrate dev --name add-fulltext-index --create-only`
- Edit the generated SQL file to add the generated `tsvector` column and GIN index (see [architecture/adr/004-postgres-fulltext-search.md](../architecture/adr/004-postgres-fulltext-search.md))
- Apply: `pnpm prisma migrate dev`

**Files**: `prisma/migrations/[timestamp]_add-fulltext-index/migration.sql`

**Acceptance**: `SELECT "searchVector" FROM "Product" LIMIT 1` returns a valid tsvector after seeding

---

## Task 12 — Create database seed script

**What to do**:
- Install: `pnpm add -D tsx`
- Add to `package.json`:
  ```json
  "prisma": { "seed": "tsx prisma/seed.ts" }
  ```
- Create `prisma/seed.ts` that seeds all data from `lib/data.ts` into the database (products, categories, brands)
- Seed 5 coupons including `WELCOME15` (see [database/seed-guide.md](../database/seed-guide.md))
- Seed the admin user using `ADMIN_EMAIL` / `ADMIN_PASSWORD` env vars
- Use `upsert` for idempotency (match on `slug` or `email`)
- Run: `pnpm prisma db seed`

**Files**: `prisma/seed.ts`, `package.json`

**Acceptance**: `pnpm prisma db seed` runs without error; `Product` table has 12 rows; re-running does not create duplicates

---

## Task 13 — Create Zod validation schemas

**What to do**:
- Create `lib/validations/auth.schema.ts` — `LoginSchema`, `RegisterSchema`, `ForgotPasswordSchema`, `ResetPasswordSchema`
- Create `lib/validations/cart.schema.ts` — `AddToCartSchema`, `UpdateCartItemSchema`
- Create `lib/validations/checkout.schema.ts` — `AddressSchema`, `CreatePaymentIntentSchema`
- Create `lib/validations/product.schema.ts` — `CreateProductSchema`, `UpdateProductSchema`
- Create `lib/validations/order.schema.ts` — `UpdateOrderStatusSchema`
- Create `lib/validations/review.schema.ts` — `SubmitReviewSchema`

**Files**: `lib/validations/*.ts`

**Acceptance**: Each schema can parse a valid object and reject an invalid one (verified by unit tests in Task 14)

---

## Task 14 — Set up Vitest for unit testing

**What to do**:
- Install: `pnpm add -D vitest @vitejs/plugin-react @vitest/coverage-v8`
- Create `vitest.config.ts` (see [testing/unit-testing.md](../testing/unit-testing.md))
- Add scripts to `package.json`: `"test": "vitest run"`, `"test:coverage": "vitest run --coverage"`
- Write smoke tests for each Zod schema (at least 2 tests per schema: valid input passes, invalid input fails)

**Files**: `vitest.config.ts`, `tests/unit/validations/*.test.ts`, `package.json`

**Acceptance**: `pnpm test` runs and all schema tests pass

---

## Task 15 — Update CLAUDE.md

**What to do**:
- Add to the Commands table: `pnpm test`, `pnpm prisma migrate dev`, `pnpm prisma db seed`, `docker compose up -d`, `pnpm prisma studio`
- Update the Architecture section to mention Prisma, Better Auth, and the new `lib/services/`, `lib/actions/`, `lib/validations/` directories
- Add a link to the `docs/` folder

**Files**: `CLAUDE.md`

**Acceptance**: A new developer reading `CLAUDE.md` has all the commands needed to run the project from scratch
