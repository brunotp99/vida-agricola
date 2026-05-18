# Phase 3 — Database Services Layer (Tasks 25–40)

**Goal**: All business logic in typed service functions backed by Prisma. The static `lib/data.ts` is phased out page by page. By the end of this phase, the homepage, product pages, and category pages all render database content.

**Prerequisite**: Phase 1 complete (Prisma schema seeded with data).

---

## Task 25 — Create ProductService

**What to do**: Create `lib/services/product.service.ts` with all functions documented in [services/product-service.md](../services/product-service.md).

Key functions:
- `findMany(options)` — paginated, filterable, sortable
- `findBySlug(slug)` — single product with all relations
- `findFeatured()`, `findBestSellers()`, `findNewArrivals()`, `findFlashDeals()` — each filtered and cached with `unstable_cache`
- `findRelated(productId, categoryId)` — same category, up to 4 products

**Files**: `lib/services/product.service.ts`

**Acceptance**: `ProductService.findFeatured()` returns products where `featured: true` and `status: active`; `findBySlug("chicken-feed-25kg")` returns the product with its images, variants, and category

---

## Task 26 — Create CategoryService

**What to do**: Create `lib/services/category.service.ts`:
- `findAll()` — all categories with subcategories
- `findBySlug(slug)` — category with parent and children
- `findWithSubcategories()` — hierarchical tree (for mega menu)
- `findFeatured()` — featured categories for homepage

**Files**: `lib/services/category.service.ts`

**Acceptance**: `findBySlug("animal-feed")` returns the category object including its 6 subcategories

---

## Task 27 — Create BrandService

**What to do**: Create `lib/services/brand.service.ts`:
- `findAll()` — all brands
- `findBySlug(slug)` — single brand
- `findFeatured()` — for the brands carousel
- `findWithProductCount()` — each brand with count of active products

**Files**: `lib/services/brand.service.ts`

**Acceptance**: `findWithProductCount()` returns brands with a `productCount` number field

---

## Task 28 — Convert homepage to use services

**What to do**:
- Make `app/page.tsx` a server component that calls `ProductService.findFeatured()`, `findFlashDeals()`, `findBestSellers()`, `findNewArrivals()`, and `CategoryService.findFeatured()`
- Pass results as props to `ProductSections`, `CategoriesGrid`, `FlashDeals`
- Remove all `from "@/lib/data"` imports from these components
- Wrap each section in `<Suspense>` with a skeleton fallback

**Files**: `app/page.tsx`, `components/product-sections.tsx`, `components/categories-grid.tsx`, `components/flash-deals.tsx`, `components/brands-carousel.tsx`

**Acceptance**: Homepage renders content from the database; removing a product via Prisma Studio removes it from the page on next request

---

## Task 29 — Convert product detail page to use ProductService

**What to do**:
- Replace the static lookup in `app/product/[slug]/page.tsx` with `ProductService.findBySlug(slug)`
- Remove `generateStaticParams` (the page is now dynamic)
- Call `notFound()` if the service returns null
- Add `generateMetadata` using the product name and description
- Update `components/mega-menu.tsx` to load categories from `CategoryService.findWithSubcategories()` instead of static data

**Files**: `app/product/[slug]/page.tsx`, `components/mega-menu.tsx`

**Acceptance**: Visiting `/product/chicken-feed-25kg` loads data from the DB; visiting `/product/does-not-exist` returns a 404 page

---

## Task 30 — Convert category page to use services + URL-based filters

**What to do**:
- Replace static lookups in `app/category/[slug]/page.tsx` with `CategoryService.findBySlug` and `ProductService.findMany({ categorySlug, ...filters })`
- Read filter values from URL search params (`searchParams`)
- Update `components/product-filters.tsx` to push URL params instead of managing local state (see [frontend/state-management.md](../frontend/state-management.md))

**Files**: `app/category/[slug]/page.tsx`, `components/product-filters.tsx`

**Acceptance**: Navigating to `/category/animal-feed?priceMin=10&priceMax=50` shows only products in that price range; the filter UI reflects the active filters from the URL

---

## Task 31 — Create CartService

**What to do**: Create `lib/services/cart.service.ts` with all functions documented in [services/cart-service.md](../services/cart-service.md).

Key behaviors:
- `addItem`: upsert with quantity increment; throws if stock insufficient
- `getOrCreateCart`: creates cart if not exists for userId/sessionId
- `mergeGuestCart`: merges guest cart items into user cart (called on login)
- Guest carts identified by `sessionId` cookie (set as a random UUID on first visit)

**Files**: `lib/services/cart.service.ts`

**Acceptance**: `CartService.addItem` throws when `stockCount < quantity`; calling it twice with the same product increments the quantity instead of creating a duplicate row

---

## Task 32 — Build cart server actions and persistent cart page

**What to do**:
- Create `lib/actions/cart.ts` with `addToCartAction`, `updateCartItemAction`, `removeFromCartAction`
- Rewrite `app/cart/page.tsx` as a server component that loads the cart from `CartService.getCartWithItems`
- Replace the hardcoded `useState` cart items with real database data
- After each mutation, call `revalidatePath("/cart")` and `revalidatePath("/")` (to update header cart count)

**Files**: `lib/actions/cart.ts`, `app/cart/page.tsx`

**Acceptance**: Items added via `addToCartAction` persist across page refreshes; the header cart count badge shows the real item count

---

## Task 33 — Create WishlistService

**What to do**: Create `lib/services/wishlist.service.ts`:
- `getWishlist(userId)` — all wishlist items with product data
- `addItem(userId, productId)` — upsert (no error if already exists)
- `removeItem(userId, productId)` — delete
- `isWishlisted(userId, productId)` — boolean check

**Files**: `lib/services/wishlist.service.ts`

**Acceptance**: Adding and removing wishlist items reflects immediately in the database

---

## Task 34 — Build wishlist server actions and wishlist page

**What to do**:
- Create `lib/actions/wishlist.ts` with `addToWishlistAction`, `removeFromWishlistAction`, `toggleWishlistAction`
- Create `app/wishlist/page.tsx` as a protected server component (middleware handles redirect if unauthenticated)
- Load wishlist from `WishlistService.getWishlist(session.user.id)`

**Files**: `lib/actions/wishlist.ts`, `app/wishlist/page.tsx`

**Acceptance**: Wishlist page shows the user's saved products; the heart button in `ProductCard` is filled when the product is wishlisted

---

## Task 35 — Create OrderService

**What to do**: Create `lib/services/order.service.ts` with all functions documented in [services/order-service.md](../services/order-service.md).

Key behaviors:
- `createOrder`: creates Order + OrderItems, clears cart, logs inventory movements
- `cancelOrder`: only allowed from `pending` or `confirmed` state
- `updateStatus`: admin-only, any valid state transition
- Order number format: `VA-YYYYMMDD-XXXXX`

**Files**: `lib/services/order.service.ts`

**Acceptance**: `createOrder` creates all required rows in one transaction; `cancelOrder` from a `shipped` order throws "Order cannot be cancelled at this stage"

---

## Task 36 — Update account order history to use real data

**What to do**:
- Refactor the Orders tab in `app/account/page.tsx` to load from `OrderService.findByUser(session.user.id)`
- Replace the hardcoded `orders` array
- Add pagination (12 orders per page via URL param)
- Create `app/account/orders/[id]/page.tsx` showing full order detail (items, shipping address, status, total)

**Files**: `app/account/page.tsx`, `app/account/orders/[id]/page.tsx`

**Acceptance**: Orders tab shows real database orders; order detail page shows all items and current status

---

## Task 37 — Create SearchService

**What to do**: Create `lib/services/search.service.ts` with functions documented in [services/search-service.md](../services/search-service.md).

- `search(query, options)` — full-text via `plainto_tsquery('portuguese', query)` with GIN index
- `autocomplete(query)` — fast prefix search returning product names

**Files**: `lib/services/search.service.ts`

**Acceptance**: `SearchService.search("ração frango")` returns products ranked by relevance; `autocomplete("chin")` responds in < 100ms

---

## Task 38 — Create InventoryService

**What to do**: Create `lib/services/inventory.service.ts` with all functions documented in [services/inventory-service.md](../services/inventory-service.md).

Key behaviors:
- `reserveStock`: uses `$executeRaw` with conditional UPDATE to prevent overselling under concurrent load
- `releaseStock`: increments stock (called on payment failure or order cancellation)
- `logMovement`: always records an `InventoryLog` entry

**Files**: `lib/services/inventory.service.ts`

**Acceptance**: Two concurrent calls to `reserveStock` for the last unit of stock result in exactly one success and one "Insufficient stock" error

---

## Task 39 — Create EmailService

**What to do**:
- Install: `pnpm add resend`
- Create `lib/services/email.service.ts` with:
  - `sendOrderConfirmation(order)` — triggered after Stripe webhook
  - `sendOrderShipped(order, trackingNumber)` — triggered when admin sets status to "shipped"
  - `sendPasswordReset(email, token)` — triggered by Better Auth
  - `sendWelcome(user)` — triggered after registration
- Create plain HTML email templates as TypeScript template literals in `lib/email-templates/`
- Add `RESEND_API_KEY` and `EMAIL_FROM` to `.env.example`

**Files**: `lib/services/email.service.ts`, `lib/email-templates/*.ts`

**Acceptance**: In staging, placing a test order triggers a real email to the test address with the order details

---

## Task 40 — Create ReviewService

**What to do**: Create `lib/services/review.service.ts`:
- `createReview(userId, productId, rating, title, body)` — verify user has a delivered order containing this product before allowing; set `verified: true` if so
- `findByProduct(productId)` — returns reviews with user name/image
- `deleteReview(reviewId, userId)` — only the review author or an admin can delete
- Calculate average rating as a database aggregate, not in code

**Files**: `lib/services/review.service.ts`

**Acceptance**: A user without a delivered order for product X gets "You must purchase this product to leave a review"; verified purchaser can submit a review; the average rating on the product page recalculates
