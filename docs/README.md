# Vida Agrícola — Project Documentation

## Current State

This project is a **frontend-only prototype** built with Next.js 16 App Router, TypeScript, Tailwind CSS v4, and shadcn/ui. There is no backend, no database, no authentication, and no real form submissions. All data comes from `lib/data.ts` as static arrays.

## Target State

A **production-ready fullstack ecommerce platform** using:
- **PostgreSQL** — relational database
- **Prisma ORM** — type-safe database access
- **Better Auth** — authentication with email/password and OAuth
- **Next.js App Router** — server components + server actions
- **Stripe** — payment processing

## How to Use This Docs Folder

If you are starting fresh, follow the phases in order under `tasks/`. Each phase file lists granular tasks with acceptance criteria. The `MASTER-TASK-LIST.md` is the single-file status tracker.

If you are looking up how a specific system works, use the reference docs below.

---

## Document Map

### Architecture
| Doc | Description |
|-----|-------------|
| [architecture/overview.md](architecture/overview.md) | System context, data flow, technology decisions |
| [architecture/database-schema.md](architecture/database-schema.md) | Full Prisma schema with all models, relations, and indexes |
| [architecture/auth-design.md](architecture/auth-design.md) | Better Auth configuration, RBAC model, session strategy |
| [architecture/api-design.md](architecture/api-design.md) | Server Actions vs Route Handlers decision, naming conventions |
| [architecture/folder-structure.md](architecture/folder-structure.md) | Target directory layout after full implementation |
| [architecture/adr/](architecture/adr/) | Architecture Decision Records (5 decisions documented) |

### Database
| Doc | Description |
|-----|-------------|
| [database/schema-reference.md](database/schema-reference.md) | Table-by-table column listing with constraints and indexes |
| [database/migrations-guide.md](database/migrations-guide.md) | How to create, run, roll back, and name Prisma migrations |
| [database/seed-guide.md](database/seed-guide.md) | Seeding strategy, data volumes, reset and reseed instructions |
| [database/query-patterns.md](database/query-patterns.md) | Common query patterns, N+1 prevention, pagination |

### Authentication
| Doc | Description |
|-----|-------------|
| [auth/setup.md](auth/setup.md) | Installing and wiring Better Auth with Next.js |
| [auth/rbac.md](auth/rbac.md) | Role definitions, middleware guard map, permission rules |
| [auth/session-management.md](auth/session-management.md) | Cookie strategy, session invalidation, remember-me |

### Services
| Doc | Description |
|-----|-------------|
| [services/product-service.md](services/product-service.md) | ProductService interface, caching strategy, variant model |
| [services/cart-service.md](services/cart-service.md) | CartService, guest-to-authenticated merge, persistence |
| [services/order-service.md](services/order-service.md) | Order lifecycle states, transition rules |
| [services/checkout-service.md](services/checkout-service.md) | Stripe Payment Intent flow, idempotency, webhook handling |
| [services/search-service.md](services/search-service.md) | Full-text search via PostgreSQL tsvector, autocomplete |
| [services/inventory-service.md](services/inventory-service.md) | Stock reservation, oversell prevention, low-stock alerts |

### Admin
| Doc | Description |
|-----|-------------|
| [admin/overview.md](admin/overview.md) | Admin section scope, RBAC requirements, route map |
| [admin/analytics-dashboard.md](admin/analytics-dashboard.md) | Revenue charts, metrics, data sources |

### Frontend
| Doc | Description |
|-----|-------------|
| [frontend/state-management.md](frontend/state-management.md) | Global state strategy, context providers, optimistic UI |
| [frontend/forms-guide.md](frontend/forms-guide.md) | React Hook Form + Zod + Server Action pattern |
| [frontend/routing-guide.md](frontend/routing-guide.md) | New route map, protected route middleware, redirects |

### DevOps
| Doc | Description |
|-----|-------------|
| [devops/local-setup.md](devops/local-setup.md) | Prerequisites, pnpm install, env vars, Docker setup |
| [devops/environment-variables.md](devops/environment-variables.md) | Every env var: purpose, required/optional, example value |
| [devops/docker.md](devops/docker.md) | Dockerfile and compose file explanation |
| [devops/deployment.md](devops/deployment.md) | Vercel deployment, DATABASE_URL, migration on deploy |

### Testing
| Doc | Description |
|-----|-------------|
| [testing/strategy.md](testing/strategy.md) | Test pyramid: unit vs integration vs E2E, coverage targets |
| [testing/unit-testing.md](testing/unit-testing.md) | Vitest setup, service layer tests, mocking Prisma |
| [testing/integration-testing.md](testing/integration-testing.md) | Server Action tests with a real test database |
| [testing/e2e-testing.md](testing/e2e-testing.md) | Playwright setup, critical user journeys |

### Tasks
| Doc | Description |
|-----|-------------|
| [tasks/MASTER-TASK-LIST.md](tasks/MASTER-TASK-LIST.md) | All 80 tasks in a single status-tracking table |
| [tasks/phase-1-foundation.md](tasks/phase-1-foundation.md) | Tasks 1–15: tooling, Docker, Prisma, seed |
| [tasks/phase-2-auth.md](tasks/phase-2-auth.md) | Tasks 16–24: Better Auth, RBAC, login/register pages |
| [tasks/phase-3-database-services.md](tasks/phase-3-database-services.md) | Tasks 25–40: service layer, all Prisma queries |
| [tasks/phase-4-cart-checkout.md](tasks/phase-4-cart-checkout.md) | Tasks 41–50: cart persistence, Stripe, order creation |
| [tasks/phase-5-frontend-wiring.md](tasks/phase-5-frontend-wiring.md) | Tasks 51–62: replace static data, new pages, search |
| [tasks/phase-6-admin.md](tasks/phase-6-admin.md) | Tasks 63–72: admin dashboard, all CRUD panels |
| [tasks/phase-7-polish.md](tasks/phase-7-polish.md) | Tasks 73–80: testing, CI/CD, performance, SEO |
