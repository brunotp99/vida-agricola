# Routing Guide

## Complete Route Map

### Public Routes (no auth required)
| Route | Page | Notes |
|-------|------|-------|
| `/` | Home | Server component, DB data |
| `/product/[slug]` | Product detail | Server component |
| `/category/[slug]` | Category listing | Server component, URL-based filters |
| `/search` | Search results | Server component, `?q=` param |
| `/brands` | Brand listing | Server component |
| `/brand/[slug]` | Brand products | Server component |
| `/deals` | Flash deals | Server component |
| `/blog` | Blog listing | Server component |
| `/blog/[slug]` | Blog post | Server component |
| `/login` | Login page | Client form |
| `/register` | Registration | Client form |
| `/forgot-password` | Password reset request | Client form |
| `/reset-password` | Password reset | Client form, `?token=` param |

### Authenticated Routes (any logged-in user)
| Route | Page | Notes |
|-------|------|-------|
| `/cart` | Shopping cart | Server component |
| `/checkout` | Checkout flow | Client, multi-step |
| `/order-confirmation` | Order success | Server component, `?orderId=` param |
| `/wishlist` | Saved products | Server component |
| `/account` | Account dashboard | Server component |
| `/account/orders` | Order history | Server component, paginated |
| `/account/orders/[id]` | Order detail | Server component |
| `/account/addresses` | Saved addresses | Client form |
| `/account/settings` | Profile settings | Client form |

### Admin Routes (role: admin or staff)
| Route | Page |
|-------|------|
| `/admin` | Dashboard |
| `/admin/products` | Product list |
| `/admin/products/new` | Create product |
| `/admin/products/[id]/edit` | Edit product |
| `/admin/categories` | Category management |
| `/admin/orders` | Order management |
| `/admin/orders/[id]` | Order detail |
| `/admin/users` | User management (admin only) |
| `/admin/inventory` | Stock management |
| `/admin/analytics` | Revenue & analytics (admin only) |
| `/admin/blog` | Blog management |
| `/admin/coupons` | Coupon management (admin only) |

## Route Groups

- `(auth)` — login, register, forgot/reset password. Share no layout with the main site (different background).
- `(shop)` — all storefront pages. Inherits the root layout with header and footer.
- `account/` — uses the root layout + an account sidebar (tabs).
- `admin/` — completely separate layout (no header/footer, sidebar navigation).

## Missing Routes (currently 404)

These routes are referenced in existing code but not implemented yet:
- `/brands` — linked from `brands-carousel.tsx`
- `/brand/[slug]` — linked from `brands-carousel.tsx`
- `/best-sellers` — linked from `product-sections.tsx`
- `/new-arrivals` — linked from `product-sections.tsx`
- `/featured` — linked from `product-sections.tsx`
- `/deals` — linked from header navigation
- `/blog` — linked from footer
- `/about` — linked from footer
- `/contact` — linked from footer
- `/search` — linked from header search

Implement all except `/about` and `/contact` (which are out of scope as static pages for now).

## Auth Redirects

The middleware handles all redirects. After login, Better Auth redirects to:
1. The `?redirect=` query param if present
2. `/account` by default

After registration: redirect to `/account`.

After logout: redirect to `/`.
