# Admin Dashboard Overview

## Access

The admin section is at `/admin/*`. Requires `role: admin` — middleware redirects any other user to `/`.

Staff users with `role: staff` can access order management and inventory but not user management, analytics, or site configuration.

## Route Map

| Route | Purpose | Roles |
|-------|---------|-------|
| `/admin` | Dashboard: revenue, orders today, low-stock alerts, recent orders | admin, staff |
| `/admin/products` | Product data table with search, filter, status toggle | admin |
| `/admin/products/new` | Create product form | admin |
| `/admin/products/[id]/edit` | Edit product form | admin |
| `/admin/categories` | Category tree, add/edit/delete | admin |
| `/admin/orders` | Order list with status filter, date range | admin, staff |
| `/admin/orders/[id]` | Order detail, status update, refund button | admin, staff |
| `/admin/users` | User list, role assignment, ban toggle | admin |
| `/admin/inventory` | Stock levels, low-stock highlight, manual adjustment | admin, staff |
| `/admin/analytics` | Revenue charts, top products, conversion funnel | admin |
| `/admin/blog` | Blog post list, create/edit/publish | admin, staff |
| `/admin/coupons` | Coupon list, create/edit/activate/deactivate | admin |

## Layout (`app/admin/layout.tsx`)

The admin layout renders:
- A persistent left sidebar with navigation links
- A topbar showing the current admin user's name and a "View Store" link
- A `<main>` area for page content

The layout checks the session server-side. If the user is not admin, it calls `redirect("/")` immediately (in addition to the middleware check).

## Data Table Pattern

All list views use the `components/admin/data-table.tsx` component built on shadcn `Table`. It supports:
- Column definitions
- Client-side search (filters the loaded data)
- Server-side pagination (via URL params)
- Row actions (edit, delete, view)

## Form Pattern

All create/edit forms use `components/admin/product-form.tsx` (and equivalent) built with React Hook Form + Zod. Submissions call Server Actions in `lib/actions/admin/`.

On success, the form calls `router.push('/admin/[entity]')` and shows a toast notification.

## Stats Cards

`components/admin/stats-card.tsx` renders a metric with:
- Title
- Value (formatted)
- Delta vs previous period (e.g. "+12% vs last week")
- Icon

Used on the main dashboard page for: Total Revenue, Orders Today, New Users (7d), Low Stock Items.
