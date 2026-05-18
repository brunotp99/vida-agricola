# Phase 6 — Admin Dashboard (Tasks 63–72)

**Goal**: A full-featured admin panel at `/admin/*` protected by `role: admin`. Covers CRUD for all major entities, order management, inventory, and analytics.

**Prerequisite**: Phase 3 complete (all services built), Task 18 (middleware protecting `/admin`).

---

## Task 63 — Build the Admin layout and navigation sidebar

**What to do**:
- Create `app/admin/layout.tsx`:
  - Load session server-side; call `redirect("/")` if `role !== "admin"` (double protection beyond middleware)
  - Render a left sidebar with navigation links (use shadcn `Sheet` or a fixed sidebar)
  - Sidebar links: Dashboard, Products, Categories, Orders, Users, Inventory, Analytics, Blog, Coupons
  - Show the current page as active in the sidebar
  - Footer of sidebar: admin user name + "View Store" link (opens `/` in new tab)
  - Topbar: page title + admin user avatar

**Files**: `app/admin/layout.tsx`

**Acceptance**: Visiting `/admin` as a non-admin redirects to `/`; sidebar renders correctly for the admin user; all sidebar links are present and navigate to the correct routes (which may show empty pages until later tasks)

---

## Task 64 — Build the Admin Dashboard overview page

**What to do**: Create `app/admin/page.tsx`:

**Stats row** (using `components/admin/stats-card.tsx`):
- Total Revenue (all time) — `SUM(total)` from delivered/confirmed orders
- Orders Today — count of orders created today
- New Users (7 days) — count of users registered in the last 7 days
- Low Stock Items — count of variants with `stockCount <= 5`

**Charts** (using Recharts + shadcn Chart):
- Revenue over last 30 days — area chart (`components/admin/revenue-chart.tsx`)
- Recent Orders — table showing last 10 orders with status, total, customer name

Cache all dashboard queries with `unstable_cache` and a 15-minute TTL.

**Files**: `app/admin/page.tsx`, `components/admin/stats-card.tsx`, `components/admin/revenue-chart.tsx`

**Acceptance**: Dashboard shows real numbers from the seeded database; revenue chart renders with data points; the "Low Stock Items" stat correctly counts variants with low stock

---

## Task 65 — Build the Admin Products data table

**What to do**: Create `app/admin/products/page.tsx`:
- Build `components/admin/data-table.tsx` — a reusable sortable, paginated table using shadcn `Table`
- Columns: thumbnail, name, SKU, category, price, stock, status (badge), created date, actions (Edit, Delete)
- Server-side search by name/SKU via URL params (`?search=...`)
- Server-side pagination (20 per page)
- "New Product" button → links to `/admin/products/new`
- Delete action shows a confirmation dialog before calling `deleteProductAction`
- Status toggle (active/draft/archived) via a dropdown in the row

**Files**: `app/admin/products/page.tsx`, `components/admin/data-table.tsx`

**Acceptance**: Products table loads from the database; searching by name filters results; deleting a product shows a confirmation dialog and removes it from the list

---

## Task 66 — Build the Admin Product Create and Edit forms

**What to do**: Create `components/admin/product-form.tsx` with fields:
- Name → auto-generates slug (editable)
- SKU
- Description (textarea)
- Price + Compare At Price
- Category (dropdown from `CategoryService.findAll()`)
- Brand (dropdown from `BrandService.findAll()`)
- Images (URL inputs with add/remove via `useFieldArray`)
- Specifications (key-value pairs via `useFieldArray`)
- Tags (comma-separated or chip input)
- Status (select: draft/active/archived)
- Flags: featured, newArrival, bestSeller, flashDeal (checkboxes)

Create Server Actions in `lib/actions/admin/products.ts`:
- `createProductAction(input)` — creates product, images, variants, tags, specs
- `updateProductAction(id, input)` — updates all relations
- `deleteProductAction(id)` — soft-deletes by setting `status: "archived"` (or hard delete)

After mutation: `revalidateTag("products")` to bust the cache.

**Files**: `app/admin/products/new/page.tsx`, `app/admin/products/[id]/edit/page.tsx`, `components/admin/product-form.tsx`, `lib/actions/admin/products.ts`

**Acceptance**: Creating a product via the admin form saves it to the database; the product appears on the `/category/[slug]` storefront page without a redeploy; editing an existing product pre-populates the form with current values

---

## Task 67 — Build Admin Categories CRUD

**What to do**: Create `app/admin/categories/page.tsx`:
- Show categories as an indented tree (parent categories with children nested below)
- "Add Category" button opens a dialog form with: name, slug (auto-generated), description, imageUrl, parentId (select from existing categories), sortOrder
- Edit and delete buttons per row
- Warn on delete if the category has products assigned to it

Create `lib/actions/admin/categories.ts`:
- `createCategoryAction`, `updateCategoryAction`, `deleteCategoryAction`
- After mutation: `revalidateTag("categories")`

**Files**: `app/admin/categories/page.tsx`, `lib/actions/admin/categories.ts`

**Acceptance**: Adding a new subcategory to "Animal Feed" makes it appear in the mega-menu on the next page load; deleting a category with products shows a warning and blocks deletion

---

## Task 68 — Build Admin Orders management

**What to do**:

`app/admin/orders/page.tsx`:
- Filterable list: by status (dropdown), date range (date pickers), search by order number or customer email
- Columns: order number, customer name, status badge, total, items count, created date, actions

`app/admin/orders/[id]/page.tsx`:
- Full order detail: items with images and prices, shipping address, payment info
- Status update dropdown — calling `OrderService.updateStatus`; changing to "shipped" triggers `EmailService.sendOrderShipped`
- "Issue Refund" button — calls `stripe.refunds.create({ payment_intent: order.paymentIntentId })`; updates order status to "refunded"

Create `lib/actions/admin/orders.ts`:
- `updateOrderStatusAction(orderId, status)` — validates state machine transition
- `issueRefundAction(orderId)` — creates Stripe refund, updates order status

**Files**: `app/admin/orders/page.tsx`, `app/admin/orders/[id]/page.tsx`, `lib/actions/admin/orders.ts`

**Acceptance**: Changing order status to "shipped" triggers the order shipped email; issuing a refund creates a refund in the Stripe test dashboard and updates the order status to "refunded"

---

## Task 69 — Build Admin Users management

**What to do**: Create `app/admin/users/page.tsx`:
- Columns: name, email, role badge, join date, order count, banned status, actions
- Role change: inline dropdown to promote to `staff` or demote to `customer` (cannot self-demote from `admin`)
- Ban/unban toggle: sets `User.banned = true`; middleware checks this and signs the user out on next request

Create `lib/actions/admin/users.ts`:
- `updateUserRoleAction(userId, role)` — validates caller is admin, prevents self-role-change
- `toggleUserBanAction(userId)` — toggles `banned` field

**Files**: `app/admin/users/page.tsx`, `lib/actions/admin/users.ts`

**Acceptance**: Promoting a user to `staff` updates their role; that user can now access `/admin/orders` but not `/admin/users`; banning a user signs them out on their next request

---

## Task 70 — Build Admin Inventory management

**What to do**: Create `app/admin/inventory/page.tsx`:
- Show all `ProductVariant` rows with current `stockCount`
- Highlight rows where `stockCount <= 5` in red/orange
- "Adjust Stock" button per row: opens a dialog with a number input for new stock count + a reason field
- Calls `InventoryService.adjustStock(productId, variantId, newStockCount, reason)`
- Show recent inventory log entries for each product (last 5 movements)

Create `lib/actions/admin/inventory.ts`:
- `adjustStockAction(variantId, newStockCount, reason)`

**Files**: `app/admin/inventory/page.tsx`, `lib/actions/admin/inventory.ts`

**Acceptance**: Adjusting stock updates `ProductVariant.stockCount` and writes to `InventoryLog`; the inventory page immediately shows the new count after adjustment

---

## Task 71 — Build Admin Coupons management

**What to do**: Create `app/admin/coupons/page.tsx`:
- Columns: code, type, value, min order, uses (used/max), expiry, active badge, actions
- "Create Coupon" button → form with all fields
- Edit and delete buttons per row
- Active/inactive toggle

Create `lib/actions/admin/coupons.ts`:
- `createCouponAction`, `updateCouponAction`, `deleteCouponAction`, `toggleCouponActiveAction`

**Files**: `app/admin/coupons/page.tsx`, `lib/actions/admin/coupons.ts`

**Acceptance**: Creating a coupon with code `SUMMER25` (€25 off orders over €100) makes it usable at checkout immediately; deactivating it prevents usage at checkout

---

## Task 72 — Build Admin Analytics page

**What to do**: Create `app/admin/analytics/page.tsx`:

**Period selector**: Button group (7d / 30d / 90d) — URL param `?period=30`

**Revenue chart** (area chart): Daily revenue for the selected period

**Top Products table**: Product name, units sold, revenue — top 10 for the period

**Category breakdown** (pie chart): Revenue per category for the period

**Conversion funnel** (horizontal bar chart):
- Product Views (from `AnalyticsEvent` where `type = "product_view"`)
- Add to Cart events
- Checkout Started events
- Orders Placed

**Key metrics cards**: Total Revenue, Average Order Value, Conversion Rate, Refund Rate

Cache all analytics queries for 15 minutes (see [admin/analytics-dashboard.md](../admin/analytics-dashboard.md)).

**Files**: `app/admin/analytics/page.tsx`

**Acceptance**: Charts render with data from the seeded orders; period selector switches between 7/30/90 day views; all four funnel stages show data from `AnalyticsEvent` records
