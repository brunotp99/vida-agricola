# Phase 5 — Frontend Wiring & New Pages (Tasks 51–62)

**Goal**: All missing routes created, all static data imports eliminated. Every page renders real database content by the end of this phase.

**Prerequisite**: Phases 3 and 4 complete (all services built, checkout working).

---

## Task 51 — Build the Search page

**What to do**:
- Create `app/search/page.tsx` as a server component
- Read search params: `q`, `category`, `priceMin`, `priceMax`, `sort`, `page`
- Call `SearchService.search(params)`
- Render results using the existing `ProductCard` component
- Show result count ("Showing 24 of 156 results for 'chicken feed'")
- Show pagination if `total > limit`
- Show "No results found" empty state with a "Browse all products" link

**Files**: `app/search/page.tsx`

**Acceptance**: `/search?q=ração+frango` returns relevant products; `/search?q=xyznotexist` shows the empty state

---

## Task 52 — Build the search autocomplete API and header dropdown

**What to do**:
- Create `app/api/search/autocomplete/route.ts` — GET handler calling `SearchService.autocomplete(q)`, cached with `Cache-Control: public, max-age=60`
- Create `components/search/autocomplete-dropdown.tsx` — renders suggestions list below the search input
- Update `components/header.tsx` search input:
  - On input change (debounced 200ms), fetch `/api/search/autocomplete?q=...`
  - Show dropdown with up to 8 suggestions
  - Clicking a suggestion navigates to `/search?q=...`
  - Pressing Enter navigates to `/search?q=...`
  - Close dropdown on blur or Escape

**Files**: `app/api/search/autocomplete/route.ts`, `components/search/autocomplete-dropdown.tsx`, `components/header.tsx`

**Acceptance**: Typing "chin" in the header search shows a dropdown within 300ms with product names containing "chin"; pressing Enter navigates to the search results page

---

## Task 53 — Build the Brands listing and Brand detail pages

**What to do**:
- Create `app/brands/page.tsx` — server component loading `BrandService.findWithProductCount()`; render brand cards in a grid similar to the categories grid
- Create `app/brand/[slug]/page.tsx` — server component loading `BrandService.findBySlug(slug)` and `ProductService.findMany({ brandSlug: slug })`; render products in a grid
- Fix the `components/brands-carousel.tsx` links to point to `/brand/[slug]` (currently linked but the route was 404)
- Update the footer "Brands" link

**Files**: `app/brands/page.tsx`, `app/brand/[slug]/page.tsx`, `components/brands-carousel.tsx`

**Acceptance**: `/brands` shows all 8 brands with product counts; `/brand/purina` shows only Purina products; visiting `/brand/does-not-exist` returns 404

---

## Task 54 — Build the Deals page

**What to do**:
- Create `app/deals/page.tsx` — server component loading products where `flashDeal: true` or `compareAtPrice IS NOT NULL`
- Show the discount percentage badge on each product card
- Include a countdown timer component (`components/deals-countdown.tsx`) — a client component that counts down to midnight (or a fixed future time)
- Fix the "Deals" nav link in the header

**Files**: `app/deals/page.tsx`, `components/deals-countdown.tsx`

**Acceptance**: Deals page renders discounted products from the database; the countdown timer ticks; the "Deals" header nav link is no longer a dead link

---

## Task 55 — Build the Blog listing and post pages

**What to do**:
- Create `app/blog/page.tsx` — server component loading `BlogPost` records where `status: "published"`, ordered by `publishedAt` DESC
- Create `app/blog/[slug]/page.tsx` — server component for individual posts; add `generateMetadata` for SEO
- Fix the "Blog" footer link
- Note: Actual blog content will be created via the admin panel (Task 72's placeholder)

**Files**: `app/blog/page.tsx`, `app/blog/[slug]/page.tsx`

**Acceptance**: Blog page renders published posts; blog post page renders the body; the footer "Blog" link works; empty state shown if no published posts exist

---

## Task 56 — Update Account page with real session and service data

**What to do**:
- Replace hardcoded user data (`John Doe`, `john.doe@email.com`) with `session.user.name` and `session.user.email`
- Load dashboard stats from services: order count, wishlist count, pending orders
- Replace the hardcoded `orders` array (now loaded in Task 36)
- Replace the hardcoded `wishlist` array with `WishlistService.getWishlist(session.user.id)`
- Update the settings form to use `updateProfileAction` from Task 23

**Files**: `app/account/page.tsx`

**Acceptance**: Account dashboard shows the logged-in user's actual name and real stats; all tabs show real data

---

## Task 57 — Implement product reviews on product detail page

**What to do**:
- Update `components/product-detail.tsx` Reviews tab to:
  - Load reviews from `ReviewService.findByProduct(productId)` (passed as prop from server component)
  - Show average rating calculated from real review data
  - Show review count
  - Show a `ReviewForm` if the user is authenticated and has a delivered order for this product
  - Show "Sign in to leave a review" if unauthenticated
  - Show "Purchase this product to leave a review" if authenticated but no qualifying order
- Create `components/account/review-form.tsx` — React Hook Form + `SubmitReviewSchema`
- Create `lib/actions/reviews.ts#submitReviewAction`

**Files**: `components/product-detail.tsx`, `components/account/review-form.tsx`, `lib/actions/reviews.ts`

**Acceptance**: Verified purchasers can submit a review; it appears immediately; the star rating average updates; duplicate reviews from the same user are prevented (unique constraint enforced)

---

## Task 58 — Wire ProductCard add-to-cart and wishlist to server actions

**What to do**:
- Update `components/product-card.tsx`:
  - "Add to Cart" button calls `addToCartAction` using React 19's `useOptimistic` for instant feedback
  - Heart/wishlist button calls `toggleWishlistAction` — shows filled heart if wishlisted
  - Both buttons show loading state while the action runs
  - On success, show a toast notification
  - On error, show an error toast
- For the wishlist button, require authentication — clicking while unauthenticated redirects to `/login?redirect=...`

**Files**: `components/product-card.tsx`

**Acceptance**: Clicking "Add to Cart" updates the header badge count within 200ms; the heart button toggles state instantly; both actions show toast feedback

---

## Task 59 — Build the Wishlist page

**What to do**:
- Create `app/wishlist/page.tsx` — protected server component (middleware handles the redirect)
- Load `WishlistService.getWishlist(session.user.id)`
- Render product grid using `ProductCard` with an added "Remove" button
- Show empty state with "Start adding products to your wishlist" if empty

**Files**: `app/wishlist/page.tsx`

**Acceptance**: Wishlist page shows the user's saved products; removing an item via the button removes it from the database and updates the UI

---

## Task 60 — Add pagination to category and search pages

**What to do**:
- Ensure `ProductService.findMany` returns `{ products, total, pages }` (from Task 25)
- Create a `Pagination` component using shadcn `Button` and shadcn `Select` for page size
- Add pagination to:
  - `app/category/[slug]/page.tsx` — 12 per page via `?page=N`
  - `app/search/page.tsx` — 12 per page via `?page=N`
- Pagination preserves existing search params when navigating pages

**Files**: `lib/services/product.service.ts`, `app/category/[slug]/page.tsx`, `app/search/page.tsx`, `components/ui/pagination.tsx` (new or from shadcn)

**Acceptance**: Category page shows 12 products with prev/next buttons; clicking "Next" increments the page param and loads the next 12 products

---

## Task 61 — Implement newsletter subscription

**What to do**:
- Create `lib/actions/newsletter.ts#subscribeAction(email: string)`:
  - Validate email with Zod
  - Upsert `NewsletterSub` (no error if already subscribed, just set `active: true`)
  - Return appropriate message for new subscriptions vs re-subscriptions
- Wire the newsletter email inputs in:
  - `components/promo-banners.tsx` (`NewsletterBanner` component)
  - `components/footer.tsx` (newsletter section)
- Show a success message after submission; show an error for invalid emails

**Files**: `lib/actions/newsletter.ts`, `components/promo-banners.tsx`, `components/footer.tsx`

**Acceptance**: Submitting a valid email creates a `NewsletterSub` row; submitting the same email a second time returns "You're already subscribed"; invalid email shows validation error

---

## Task 62 — Remove all lib/data.ts static data imports

**What to do**:
- Run `grep -r "from '@/lib/data'" . --include="*.ts" --include="*.tsx"` and audit every result
- For each file still importing from `lib/data.ts`:
  - If it's a component importing `products[]` or `categories[]` — replace with a service call or a prop from a parent server component
  - If it's a utility function import (`formatPrice`, `calculateDiscount`) — keep those and move them to `lib/utils.ts`
- After replacing all data imports, add a deprecation comment to `lib/data.ts`: `// This file is kept only for the Prisma seed script. Do not import product/category arrays from here.`
- The seed script (`prisma/seed.ts`) may continue importing from `lib/data.ts`

**Files**: Any file importing from `lib/data.ts`

**Acceptance**: `grep -r "from '@/lib/data'" . --include="*.ts" --include="*.tsx" | grep -v seed.ts | grep -v data.ts` returns zero results
