# Testing Strategy

## Test Pyramid

```
         /\
        /E2E\       ~10 tests — critical user journeys
       /------\
      / Integr \    ~20 tests — server actions with real test DB
     /----------\
    /    Unit    \  ~50 tests — service functions, Zod schemas
   /--------------\
```

## Unit Tests (Vitest)

**What to test**: Service layer functions, Zod validation schemas, utility functions.

**What not to test**: Prisma client calls directly (integration tests cover those), React component rendering (Playwright covers user flows).

**Mocking**: Mock `@prisma/client` using `vi.mock` for unit tests that need to verify service logic without a database.

**Coverage target**: >80% statement coverage on `lib/services/` and `lib/validations/`.

**Run**: `pnpm test` or `pnpm test --coverage`

## Integration Tests (Vitest + real database)

**What to test**: Server Actions end-to-end — from the action function call through the service layer to the database and back.

**Database**: Uses a separate test database (`TEST_DATABASE_URL` pointing to the `postgres-test` Docker container on port 5433).

**Isolation**: Each test or test file runs in a Prisma `$transaction` that is rolled back after the test, so tests don't affect each other.

**What to cover**:
- `addToCartAction`: valid item, out-of-stock, invalid input
- `createPaymentIntentAction`: valid cart, empty cart, insufficient stock
- Stripe webhook handler: `payment_intent.succeeded` creates order, is idempotent
- `submitReviewAction`: verified purchaser, non-purchaser (403)

**Run**: `pnpm test:integration`

## E2E Tests (Playwright)

**What to test**: Critical user journeys that span multiple pages.

**Two mandatory flows**:
1. **Purchase flow**: Guest adds item → registers → cart merges → proceeds to checkout → completes with Stripe test card → lands on order confirmation page → order appears in account
2. **Admin product flow**: Admin logs in → creates a product → the product appears on the storefront category page

**Database state**: E2E tests run against a seeded test database (reset before the test suite).

**Stripe**: Use Stripe test mode cards (`4242 4242 4242 4242`). Do not use mocks for Stripe in E2E tests.

**Run**: `pnpm e2e`

## CI Pipeline

All three test layers run in GitHub Actions on every push to `main` and on every PR. The build is blocked if any test layer fails. See [devops/ci-cd.md](../devops/ci-cd.md).
