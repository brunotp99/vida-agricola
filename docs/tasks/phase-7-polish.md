# Phase 7 — Polish, Testing & DevOps (Tasks 73–80)

**Goal**: Production-ready quality — comprehensive test coverage structure, CI/CD pipeline, performance optimizations, SEO, and final documentation.

**Prerequisite**: All phases 1–6 complete.

---

## Task 73 — Write unit tests for all service layer functions

**What to do**: Create `tests/unit/services/` with test files for each service. Use `vi.mock("@/lib/prisma")` to mock Prisma.

Services to test:
- `product.service.test.ts` — `findMany` returns paginated shape, `findBySlug` returns null for unknown slug, `findFeatured` only returns active products
- `cart.service.test.ts` — `addItem` throws on insufficient stock, incrementing quantity, `mergeGuestCart` consolidates without duplicates
- `order.service.test.ts` — `cancelOrder` throws from shipped state, `generateOrderNumber` format is `VA-YYYYMMDD-XXXXX`
- `inventory.service.test.ts` — `reserveStock` throws on zero stock
- `shipping.service.test.ts` — free shipping above €99, express is always €19.99

Target: >80% statement coverage on `lib/services/`.

**Files**: `tests/unit/services/*.test.ts`

**Acceptance**: `pnpm test:coverage` shows >80% on `lib/services/`; all tests pass

---

## Task 74 — Write integration tests for Server Actions

**What to do**: Create `tests/integration/actions/` with tests using a real test database.

Test files:
- `cart.test.ts` — add item, increment quantity on duplicate, out-of-stock rejection, remove item
- `wishlist.test.ts` — add, toggle (add/remove), list for user
- `checkout.test.ts` — see Task 50 for test cases
- `orders.test.ts` — create order, cancel from pending (success), cancel from shipped (failure), admin status update

See [testing/integration-testing.md](../testing/integration-testing.md) for setup instructions.

**Files**: `tests/integration/actions/*.test.ts`, `vitest.integration.config.ts`

**Acceptance**: `pnpm test:integration` passes all tests against the test database; tests are isolated (no shared state between tests)

---

## Task 75 — Set up Playwright E2E tests

**What to do**: Create the two critical E2E flows documented in [testing/e2e-testing.md](../testing/e2e-testing.md):

1. **Purchase flow**: Guest adds item → registers → cart merges → completes checkout with Stripe test card `4242 4242 4242 4242` → lands on order confirmation page → order visible in account
2. **Admin product flow**: Admin logs in → creates a product → the product appears on the storefront

Configure `playwright.config.ts` to start the dev server automatically if not already running.

**Files**: `playwright.config.ts`, `tests/e2e/purchase-flow.spec.ts`, `tests/e2e/admin-product.spec.ts`

**Acceptance**: `pnpm e2e` passes both flows against a seeded test database; Playwright report shows screenshots of key steps

---

## Task 76 — Create GitHub Actions CI pipeline

**What to do**: Create `.github/workflows/ci.yml` with jobs:

```yaml
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm tsc --noEmit

  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: vida_agricola_test
        options: >-
          --health-cmd pg_isready
          --health-interval 5s
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - run: pnpm install --frozen-lockfile
      - run: pnpm prisma migrate deploy
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/vida_agricola_test
      - run: pnpm test
      - run: pnpm test:integration

  build:
    needs: [lint, test]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/vida_agricola
          BETTER_AUTH_SECRET: ci-secret-32-chars-placeholder-ok
          NEXT_PUBLIC_APP_URL: http://localhost:3000
```

Cache `node_modules` and `.next/cache` between runs.

**Files**: `.github/workflows/ci.yml`

**Acceptance**: Opening a PR triggers the pipeline; a failing Vitest test blocks the merge; the pipeline completes in < 5 minutes on a clean run

---

## Task 77 — Configure Vercel deployment with database migrations

**What to do**:
- Update `vercel.json` to replace the v0 inject step:
  ```json
  {
    "buildCommand": "prisma migrate deploy && next build",
    "installCommand": "pnpm install"
  }
  ```
- Document all required production env vars in [devops/deployment.md](../devops/deployment.md)
- Choose and document a production PostgreSQL provider (Neon recommended for Vercel)
- Ensure `STRIPE_WEBHOOK_SECRET` is configured for the production Stripe webhook endpoint

**Files**: `vercel.json`, `docs/devops/deployment.md`

**Acceptance**: A `git push` to `main` triggers Vercel deployment; migrations run before the build; the production site is accessible and the admin can log in

---

## Task 78 — Add dynamic metadata and SEO

**What to do**:
- Add `generateMetadata` to `app/product/[slug]/page.tsx`:
  ```typescript
  export async function generateMetadata({ params }) {
    const product = await ProductService.findBySlug((await params).slug)
    return {
      title: `${product.name} | Vida Agrícola`,
      description: product.description,
      openGraph: { images: [product.images[0]?.url] },
    }
  }
  ```
- Add `generateMetadata` to `app/category/[slug]/page.tsx` similarly
- Create `app/api/sitemap/route.ts` — generates XML sitemap with all active product and category URLs
- Create `app/robots.txt/route.ts` — returns `Disallow: /admin`

**Files**: `app/product/[slug]/page.tsx`, `app/category/[slug]/page.tsx`, `app/api/sitemap/route.ts`, `app/robots.txt/route.ts`

**Acceptance**: `curl https://yourdomain.com/sitemap.xml` returns valid XML with all product and category URLs; product pages show correct Open Graph tags when shared on social media

---

## Task 79 — Add performance optimizations

**What to do**:

**1. Fix image configuration in `next.config.mjs`**:
- Set `images.unoptimized: false`
- Add image domains: `images.remotePatterns` for Unsplash (`images.unsplash.com`)

**2. Add `loading.tsx` skeleton files**:
- `app/product/[slug]/loading.tsx` — product detail skeleton
- `app/category/[slug]/loading.tsx` — product grid skeleton with 12 placeholder cards

**3. Add Suspense boundaries on the homepage**:
- Wrap `FeaturedProducts`, `FlashDeals`, `BestSellers`, `NewArrivals` each in `<Suspense fallback={<ProductGridSkeleton />}>`

**4. Cache hot service calls**:
- Wrap `CategoryService.findAll()` and `CategoryService.findWithSubcategories()` with `unstable_cache` (5 minute TTL, tag: `"categories"`)
- Ensure `revalidateTag("categories")` is called after admin category mutations

**5. Add `generateStaticParams` back for product pages** (optional ISR):
- Re-add `generateStaticParams` to `app/product/[slug]/page.tsx` to pre-render the 12 seeded products at build time
- Add `revalidate: 3600` (1 hour ISR) so new products auto-appear within an hour

**Files**: `next.config.mjs`, `app/product/[slug]/loading.tsx`, `app/category/[slug]/loading.tsx`, `app/page.tsx`, `lib/services/category.service.ts`

**Acceptance**: Lighthouse Performance score on the homepage is ≥ 80; product list page shows a skeleton grid during initial load; images are optimized (no `unoptimized: true`)

---

## Task 80 — Final documentation update

**What to do**:
- Update `docs/tasks/MASTER-TASK-LIST.md` — mark all completed tasks as `DONE`
- Update `CLAUDE.md`:
  - Add all new commands (including `pnpm e2e`, `pnpm test:integration`, `stripe listen`)
  - Update the Architecture section with the complete folder structure
  - Add a "Known Issues / Remaining Optional Improvements" section
  - Add a link to `docs/README.md`
- Update `docs/architecture/folder-structure.md` if the actual implementation differs from the plan
- Write `docs/REMAINING-IMPROVEMENTS.md` listing optional future enhancements:
  - Apple Pay / Google Pay via Stripe Payment Request Button
  - Mobile app (React Native)
  - ML-based recommendations
  - Multi-language support (PT/EN)
  - Supplier / purchase order management
  - Multi-warehouse inventory
  - B2B wholesale pricing

**Files**: `CLAUDE.md`, `docs/tasks/MASTER-TASK-LIST.md`, `docs/architecture/folder-structure.md`

**Acceptance**: A new developer reading only `CLAUDE.md` and `docs/README.md` can understand the project architecture, run it locally, and pick up any task from the master task list
