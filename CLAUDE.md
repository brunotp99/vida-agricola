# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project State

This project is being transformed from a **frontend-only prototype** into a **production-ready fullstack ecommerce platform**. The current code is 100% static — no backend, no database, no auth. The target stack adds PostgreSQL, Prisma, Better Auth, and Stripe.

See `docs/README.md` for the full documentation index.

---

## Commands

```bash
pnpm dev          # Start development server
pnpm build        # Production build
pnpm start        # Start production server
pnpm lint         # Run ESLint
```

```bash
docker compose up -d               # Start PostgreSQL locally
pnpm prisma migrate dev            # Create and apply a new migration
pnpm prisma migrate dev --name X   # Create migration named X
pnpm prisma db seed                # Seed the database
pnpm prisma migrate reset          # Drop DB, re-migrate, re-seed (local only)
pnpm prisma studio                 # Open database GUI at localhost:5555
```

```bash
pnpm test                  # Run Vitest unit tests
pnpm test:coverage         # Run with coverage report
pnpm test:integration      # Run integration tests against test DB
pnpm e2e                   # Run Playwright E2E tests
pnpm e2e:ui                # Playwright with interactive UI
```

### Stripe (for checkout development)

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
stripe trigger payment_intent.succeeded
```

**Package manager**: Always use `pnpm`. Never use `npm` or `yarn`.

---

## Docs System

All architecture documentation and task specifications live in `docs/`. This is the source of truth for how the fullstack implementation should be built.

### How to navigate it

| You want to…                     | Read…                                  |
| -------------------------------- | -------------------------------------- |
| Understand the overall system    | `docs/architecture/overview.md`        |
| See the full database schema     | `docs/architecture/database-schema.md` |
| Know why a technology was chosen | `docs/architecture/adr/` (5 ADRs)      |
| Understand a service's interface | `docs/services/[service-name].md`      |
| Find env vars and setup steps    | `docs/devops/local-setup.md`           |
| See all tasks and their status   | `docs/tasks/MASTER-TASK-LIST.md`       |
| Work on a specific phase         | `docs/tasks/phase-N-*.md`              |

### Task list structure

`docs/tasks/MASTER-TASK-LIST.md` — 80 tasks across 7 phases, each with key files, dependencies, and status (`TODO` / `IN PROGRESS` / `DONE` / `BLOCKED`).

Each task is fully specified in its phase file with:

- What to do (step by step)
- Which files to create or modify
- Explicit acceptance criteria

**Always read the task spec in the phase file before implementing** — the master list is just a summary.

---

## Agents

Four custom subagents are defined in `.claude/agents/` for this project. Invoke them with `/agent-name` or by asking Claude to use them.

| Agent            | Purpose                                               | Use when…                                           |
| ---------------- | ----------------------------------------------------- | --------------------------------------------------- |
| `implement-task` | Reads a task spec and implements it                   | You want to execute task N                          |
| `check-task`     | Verifies a task meets its acceptance criteria         | Before marking a task DONE                          |
| `next-task`      | Analyses the task list and recommends what to work on | You're not sure where to start                      |
| `docs-advisor`   | Answers architecture questions from the docs          | You need to understand a design decision or pattern |

Example usage:

```
implement task 16         → spawns implement-task agent for Task 16 (Better Auth)
check task 31             → spawns check-task agent for Task 31 (CartService)
what should I work on?    → spawns next-task agent for a status report
how should filters work?  → spawns docs-advisor agent
```

---

## Architecture

**Target stack**: Next.js 16 App Router · React 19 · TypeScript · Tailwind CSS v4 · shadcn/ui · PostgreSQL · Prisma ORM · Better Auth · Stripe · Resend

### Current directories (prototype state)

| Path             | Purpose                                                                             |
| ---------------- | ----------------------------------------------------------------------------------- |
| `app/`           | Pages: `/`, `/category/[slug]`, `/product/[slug]`, `/cart`, `/checkout`, `/account` |
| `components/ui/` | 71 shadcn/ui primitives — **do not modify**                                         |
| `components/`    | Domain components (header, product-card, mega-menu, etc.)                           |
| `lib/data.ts`    | **Deprecated**: static mock data being replaced by the database                     |
| `lib/utils.ts`   | `cn()` helper (clsx + tailwind-merge)                                               |
| `hooks/`         | `use-mobile.ts`, `use-toast.ts`                                                     |

### New directories (added during implementation)

| Path                   | Purpose                                  |
| ---------------------- | ---------------------------------------- |
| `prisma/`              | Schema, migrations, seed script          |
| `lib/prisma.ts`        | PrismaClient singleton                   |
| `lib/auth.ts`          | Better Auth configuration                |
| `lib/auth-client.ts`   | Better Auth React client                 |
| `lib/stripe.ts`        | Stripe singleton                         |
| `lib/env.ts`           | Validated env vars (t3-env)              |
| `lib/actions/`         | Server Actions (mutations)               |
| `lib/services/`        | Business logic layer (database access)   |
| `lib/validations/`     | Zod schemas                              |
| `middleware.ts`        | Route protection (auth + RBAC)           |
| `app/(auth)/`          | Login, register, password reset pages    |
| `app/admin/`           | Full admin dashboard                     |
| `components/admin/`    | Admin-specific components                |
| `components/auth/`     | Auth form components                     |
| `components/checkout/` | Stripe Elements checkout components      |
| `tests/`               | Vitest unit/integration + Playwright E2E |

### Key patterns

**Server Actions** handle all mutations. They live in `lib/actions/` with `"use server"`, validate input via Zod, and return `{ success: true, data } | { success: false, error }`. Call `revalidatePath` or `revalidateTag` after DB mutations.

**Services** (`lib/services/`) are the only place that calls `prisma`. Pages and components call services (via server components) or actions (via client components). Never call `prisma` directly from a page or component.

**Auth** is read in server components via `auth.api.getSession({ headers: await headers() })` and in client components via `authClient.useSession()`.

**Filters** on category/search pages live entirely in URL search params — no client-side `useState` for filter state.

### Routing patterns

- Dynamic routes use `async params` (Next.js 16+): `const { slug } = await params`
- `@/*` resolves to the project root
- Route groups: `(auth)` for auth pages (no header/footer), `(shop)` for storefront pages
- Admin routes at `/admin/*` require `role: admin` (enforced by `middleware.ts`)

---

## Deployment

Target: Vercel with a managed PostgreSQL provider (Neon recommended).

Build command (after Phase 1): `prisma migrate deploy && next build`

TypeScript and ESLint build errors are **enforced** — `ignoreBuildErrors` was removed in Phase 1 (Task 2).

### Prisma 7 notes

This project uses Prisma 7, which has a new architecture:

- `prisma.config.ts` — datasource URL for CLI commands (migrate, generate, seed)
- Runtime client requires a driver adapter: `@prisma/adapter-pg` with a `PrismaPg` instance
- Generated client lives at `lib/generated/prisma/` — import from `@/lib/generated/prisma/client`
- See `lib/prisma.ts` for the singleton pattern
