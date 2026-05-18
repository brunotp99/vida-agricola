# ADR 003: Use Server Actions for Internal Mutations

**Status**: Accepted

## Context

We need a strategy for data mutations (add to cart, place order, admin CRUD). Options are: REST API routes, tRPC, GraphQL, or Next.js Server Actions.

## Decision

Use **Server Actions** for all internal mutations.

## Rationale

- **CSRF protection is automatic** — Server Actions only accept same-origin requests with a `Content-Type: application/x-www-form-urlencoded` or `Content-Type: multipart/form-data` header
- **No serialization boilerplate** — the action function signature is the contract; TypeScript checks it at compile time
- **`revalidatePath` / `revalidateTag`** can be called directly inside the action to invalidate ISR cache — no separate cache invalidation layer needed
- **Progressive enhancement** — forms using `action={serverAction}` work without JavaScript enabled
- **Co-location** — the mutation logic is close to the UI that triggers it

## Trade-offs

- Server Actions are not accessible from external clients (mobile apps, third-party integrations) — any future public API would require Route Handlers
- Debugging is slightly harder than REST endpoints (no dedicated HTTP request to inspect in DevTools for action calls from client components — though `use server` calls are visible as POST requests to the current URL)
