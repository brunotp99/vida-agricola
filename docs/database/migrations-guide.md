# Prisma Migrations Guide

## Setup

After running `pnpm prisma init` and setting `DATABASE_URL` in `.env.local`, run:

```bash
pnpm prisma migrate dev --name init-auth
```

This creates `prisma/migrations/[timestamp]_init-auth/migration.sql` and applies it.

## Creating a New Migration

1. Edit `prisma/schema.prisma` with your changes
2. Run:
   ```bash
   pnpm prisma migrate dev --name describe-your-change
   ```
3. Prisma generates the SQL diff and applies it to your local database
4. Commit both `schema.prisma` and the new `migrations/` directory

## Migration Naming Convention

Use lowercase kebab-case describing what changed:
- `init-auth` — initial auth tables
- `add-catalog` — Product, Category, Brand tables
- `add-commerce` — Cart, Order, Coupon tables
- `add-fulltext-index` — tsvector column and GIN index

Never name a migration `test`, `fix`, or `update` — be specific.

## Applying Migrations in Production

Do **not** use `prisma migrate dev` in production (it may reset data). Use:

```bash
pnpm prisma migrate deploy
```

This applies pending migrations without prompting. Run it as part of the deployment pipeline before `next build`.

## Rolling Back a Migration

Prisma does not support automatic rollback. If a migration needs to be reversed:

1. Write a new migration that undoes the change:
   ```bash
   pnpm prisma migrate dev --name revert-previous-change
   ```
2. Manually write the reversal SQL if Prisma can't infer it

## The Full-Text Search Migration

Because Prisma doesn't support generated columns natively, the tsvector column requires a manual SQL migration:

```bash
pnpm prisma migrate dev --name add-fulltext-index --create-only
```

This creates the migration file without applying it. Edit the generated `.sql` file to add:

```sql
ALTER TABLE "Product"
  ADD COLUMN IF NOT EXISTS "searchVector" tsvector
  GENERATED ALWAYS AS (
    to_tsvector('portuguese',
      coalesce(name, '') || ' ' || coalesce(description, '')
    )
  ) STORED;

CREATE INDEX IF NOT EXISTS "Product_searchVector_idx"
  ON "Product" USING GIN ("searchVector");
```

Then apply it:

```bash
pnpm prisma migrate dev
```

## Resetting the Database (Local Only)

```bash
pnpm prisma migrate reset
```

This drops all tables, re-runs all migrations, and runs the seed script. Only use this locally.

## Checking Migration Status

```bash
pnpm prisma migrate status
```

Shows which migrations are applied and which are pending.
