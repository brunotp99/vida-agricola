# Target Folder Structure

This is the directory layout after full implementation. Directories that do not yet exist are marked with `[NEW]`.

```
/
├── app/
│   ├── (auth)/                        [NEW] Route group — no shared layout
│   │   ├── login/page.tsx             [NEW]
│   │   ├── register/page.tsx          [NEW]
│   │   ├── forgot-password/page.tsx   [NEW]
│   │   └── reset-password/page.tsx    [NEW]
│   │
│   ├── (shop)/                        [NEW] Route group — inherits root layout
│   │   ├── page.tsx                   → move from app/page.tsx
│   │   ├── product/[slug]/page.tsx    → move from app/product/[slug]/page.tsx
│   │   ├── category/[slug]/page.tsx   → move from app/category/[slug]/page.tsx
│   │   ├── cart/page.tsx              → move from app/cart/page.tsx
│   │   ├── checkout/page.tsx          → rewrite from app/checkout/page.tsx
│   │   ├── order-confirmation/page.tsx [NEW]
│   │   ├── search/page.tsx            [NEW]
│   │   ├── wishlist/page.tsx          [NEW]
│   │   ├── deals/page.tsx             [NEW]
│   │   ├── brands/page.tsx            [NEW]
│   │   └── brand/[slug]/page.tsx      [NEW]
│   │
│   ├── account/                       → refactor from app/account/page.tsx
│   │   ├── page.tsx                   (dashboard overview)
│   │   ├── orders/page.tsx            [NEW]
│   │   ├── orders/[id]/page.tsx       [NEW]
│   │   ├── addresses/page.tsx         [NEW]
│   │   ├── wishlist/page.tsx          [NEW]
│   │   └── settings/page.tsx          [NEW]
│   │
│   ├── admin/                         [NEW] All admin pages
│   │   ├── layout.tsx                 (sidebar + RBAC guard)
│   │   ├── page.tsx                   (dashboard with stats + charts)
│   │   ├── products/
│   │   │   ├── page.tsx               (data table)
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/edit/page.tsx
│   │   ├── categories/page.tsx
│   │   ├── orders/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── users/page.tsx
│   │   ├── inventory/page.tsx
│   │   ├── analytics/page.tsx
│   │   ├── blog/page.tsx
│   │   └── coupons/page.tsx
│   │
│   ├── api/
│   │   ├── auth/[...all]/route.ts     [NEW] Better Auth handler
│   │   ├── webhooks/stripe/route.ts   [NEW]
│   │   ├── search/autocomplete/route.ts [NEW]
│   │   └── sitemap/route.ts           [NEW]
│   │
│   ├── layout.tsx                     → update: add SessionProvider, CartProvider
│   ├── globals.css
│   └── not-found.tsx                  [NEW]
│
├── components/
│   ├── ui/                            (71 shadcn primitives — do not modify)
│   ├── admin/                         [NEW]
│   │   ├── data-table.tsx
│   │   ├── product-form.tsx
│   │   ├── category-form.tsx
│   │   ├── order-status-badge.tsx
│   │   ├── stats-card.tsx
│   │   └── revenue-chart.tsx
│   ├── auth/                          [NEW]
│   │   ├── login-form.tsx
│   │   ├── register-form.tsx
│   │   └── forgot-password-form.tsx
│   ├── checkout/                      [NEW]
│   │   ├── address-form.tsx
│   │   ├── payment-form.tsx
│   │   ├── order-summary.tsx
│   │   └── stripe-elements.tsx
│   ├── search/                        [NEW]
│   │   ├── search-bar.tsx
│   │   ├── search-results.tsx
│   │   └── autocomplete-dropdown.tsx
│   ├── account/                       [NEW]
│   │   └── review-form.tsx
│   ├── header.tsx                     → update: real session, real cart count
│   ├── footer.tsx                     → update: wire newsletter form
│   ├── product-card.tsx               → update: real add-to-cart, real wishlist
│   ├── product-detail.tsx             → update: real reviews
│   ├── product-filters.tsx            → update: URL-based filter state
│   ├── hero-slider.tsx                (no change needed)
│   ├── flash-deals.tsx                → update: load from DB
│   ├── categories-grid.tsx            → update: load from DB
│   ├── mega-menu.tsx                  → fix TS bug, load from DB
│   ├── mobile-menu.tsx                (no change needed)
│   ├── brands-carousel.tsx            → update: load from DB
│   ├── testimonials.tsx               (keep static or move to DB)
│   ├── promo-banners.tsx              → update: wire newsletter
│   └── theme-provider.tsx             (no change needed)
│
├── lib/
│   ├── auth.ts                        [NEW] Better Auth config
│   ├── auth-client.ts                 [NEW] Better Auth React client
│   ├── prisma.ts                      [NEW] PrismaClient singleton
│   ├── stripe.ts                      [NEW] Stripe singleton
│   ├── env.ts                         [NEW] Validated env vars (t3-env)
│   ├── actions/
│   │   ├── cart.ts                    [NEW]
│   │   ├── checkout.ts                [NEW]
│   │   ├── wishlist.ts                [NEW]
│   │   ├── newsletter.ts              [NEW]
│   │   ├── reviews.ts                 [NEW]
│   │   ├── users.ts                   [NEW]
│   │   └── admin/
│   │       ├── products.ts            [NEW]
│   │       ├── categories.ts          [NEW]
│   │       ├── orders.ts              [NEW]
│   │       ├── users.ts               [NEW]
│   │       ├── inventory.ts           [NEW]
│   │       └── coupons.ts             [NEW]
│   ├── services/
│   │   ├── product.service.ts         [NEW]
│   │   ├── category.service.ts        [NEW]
│   │   ├── brand.service.ts           [NEW]
│   │   ├── cart.service.ts            [NEW]
│   │   ├── order.service.ts           [NEW]
│   │   ├── checkout.service.ts        [NEW]
│   │   ├── search.service.ts          [NEW]
│   │   ├── inventory.service.ts       [NEW]
│   │   ├── wishlist.service.ts        [NEW]
│   │   ├── review.service.ts          [NEW]
│   │   ├── email.service.ts           [NEW]
│   │   └── shipping.service.ts        [NEW]
│   ├── validations/
│   │   ├── auth.schema.ts             [NEW]
│   │   ├── cart.schema.ts             [NEW]
│   │   ├── checkout.schema.ts         [NEW]
│   │   ├── product.schema.ts          [NEW]
│   │   ├── order.schema.ts            [NEW]
│   │   └── review.schema.ts           [NEW]
│   ├── utils.ts                       (keep as-is)
│   └── data.ts                        → deprecate after Phase 5
│
├── prisma/
│   ├── schema.prisma                  [NEW]
│   ├── seed.ts                        [NEW]
│   └── migrations/                    [NEW] (auto-generated)
│
├── hooks/
│   ├── use-cart.ts                    [NEW] Cart context hook
│   ├── use-mobile.ts                  (keep as-is)
│   └── use-toast.ts                   (keep as-is)
│
├── tests/
│   ├── unit/
│   │   ├── validations/               [NEW]
│   │   └── services/                  [NEW]
│   ├── integration/
│   │   └── actions/                   [NEW]
│   └── e2e/                           [NEW] Playwright specs
│
├── middleware.ts                      [NEW]
├── docker-compose.yml                 [NEW]
├── Dockerfile                         [NEW]
├── .env.example                       [NEW]
├── .eslintrc.json                     [NEW]
├── .prettierrc                        [NEW]
├── vitest.config.ts                   [NEW]
├── playwright.config.ts               [NEW]
└── CLAUDE.md                          → update after each phase
```
