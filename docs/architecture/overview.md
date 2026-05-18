# Architecture Overview

## System Context

**Vida Agrícola** is a B2C ecommerce platform selling agricultural and poultry farming supplies in Portugal. The primary users are farmers, small agricultural businesses, and veterinary professionals buying feed, equipment, and health products.

### External Systems

| System | Purpose |
|--------|---------|
| **Stripe** | Payment processing; Payment Intents API |
| **Resend** (or SMTP) | Transactional email (order confirmation, shipping, password reset) |
| **Google / GitHub OAuth** | Social login via Better Auth providers |
| **Vercel** | Hosting, edge network, preview deployments |
| **PostgreSQL** | Primary relational database (self-hosted or Neon/Supabase) |

---

## Component Diagram

```
Browser
  │
  ▼
Next.js App Router (Vercel Edge)
  ├── Server Components  ─── read data (ProductService, CategoryService, …)
  ├── Server Actions     ─── mutate data (cart, order, auth, admin)
  ├── Client Components  ─── interactivity (filters, cart count, Stripe Elements)
  └── API Routes
        ├── /api/auth/[...all]          (Better Auth handler)
        ├── /api/webhooks/stripe        (Stripe event handler)
        └── /api/search/autocomplete    (low-latency typeahead)
  │
  ├── Prisma ORM ──────────────────── PostgreSQL
  ├── Better Auth ─────────────────── Session table in PostgreSQL
  └── Stripe Node SDK ─────────────── Stripe API
```

---

## Critical Data Flows

### Product Browse → Purchase

```
1. User lands on /category/animal-feed
   └── Server Component calls CategoryService.findBySlug + ProductService.findMany
       └── Prisma query with filters, pagination, indexes

2. User clicks Add to Cart
   └── Client Component calls addToCartAction (Server Action)
       └── CartService.addItem — checks stock, upserts CartItem row
       └── Header cart count updates via revalidatePath

3. User proceeds to /checkout
   └── Server Component loads cart, address, shipping options
   └── Client calls createPaymentIntentAction
       └── InventoryService.reserveStock (SELECT FOR UPDATE)
       └── Stripe PaymentIntents.create → returns clientSecret
   └── Stripe Elements mounts with clientSecret
   └── User submits card → Stripe handles payment

4. Stripe fires payment_intent.succeeded webhook
   └── /api/webhooks/stripe verifies signature
   └── OrderService.createOrder — creates Order + OrderItems rows
   └── CartService.clearCart
   └── EmailService.sendOrderConfirmation
   └── InventoryService.logMovement

5. User redirected to /order-confirmation?orderId=xxx
```

### Admin Product Update → Storefront

```
1. Admin opens /admin/products/[id]/edit
   └── Server Component loads product from ProductService

2. Admin submits form
   └── Server Action: lib/actions/admin/products.ts#updateProductAction
       └── Zod validates input
       └── Prisma updates Product row
       └── revalidatePath('/product/[slug]') and revalidatePath('/')

3. Next.js ISR invalidates cached pages
4. Next request to /product/[slug] fetches fresh data
```

---

## Technology Decisions

| Technology | Chosen | Rationale |
|-----------|--------|-----------|
| ORM | **Prisma** | Type-safe queries, migration tooling, Prisma Studio for data exploration |
| Auth | **Better Auth** | Native Next.js App Router support, built-in RBAC, no vendor lock-in |
| Mutations | **Server Actions** | Co-located with UI, automatic CSRF protection, no API boilerplate for internal mutations |
| Search | **PostgreSQL tsvector** | No extra infrastructure; sufficient for catalog size (<10k products) |
| Payments | **Stripe** | Industry standard, excellent webhook reliability, fraud detection built-in |
| Email | **Resend** | Simple API, React email templates, generous free tier |
| State | **React context + useOptimistic** | No Zustand/Redux needed; cart state is server-derived |

---

## What Is Out of Scope

- Mobile native app
- B2B invoicing / net-30 payment terms
- Multi-tenancy (single store only)
- Real-time inventory WebSocket updates
- ML-based recommendations (static "related products" by category is sufficient)
