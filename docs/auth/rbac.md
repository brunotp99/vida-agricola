# Role-Based Access Control

## Roles

| Role | Who has it | How assigned |
|------|-----------|-------------|
| `customer` | All registered users | Auto on sign-up via Better Auth config |
| `staff` | Customer support, warehouse team | Admin assigns via `/admin/users` |
| `admin` | Site owners, developers | Seeded via `prisma/seed.ts` using `ADMIN_EMAIL` env var |

## Route Guard Map

| Route pattern | Required role | Redirects to |
|--------------|--------------|-------------|
| `/admin/*` | `admin` | `/` |
| `/account/*` | any authenticated | `/login?redirect=...` |
| `/checkout` | any authenticated | `/login?redirect=/checkout` |
| `/wishlist` | any authenticated | `/login?redirect=/wishlist` |
| Everything else | public | — |

## Middleware Implementation

See [`middleware.ts` in architecture/auth-design.md](../architecture/auth-design.md#middleware-route-protection-middlewarets).

## Server Action Authorization

Admin actions check the role before any database operation:

```typescript
export async function deleteProductAction(id: string) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session || session.user.role !== "admin") {
    return { success: false, error: "Forbidden" }
  }
  // ... proceed
}
```

Staff-level actions allow both `staff` and `admin`:

```typescript
if (!session || !["admin", "staff"].includes(session.user.role)) {
  return { success: false, error: "Forbidden" }
}
```

## Admin User Setup

The admin user is created during the seed step. Required env vars:
```
ADMIN_EMAIL=admin@vidaagricola.pt
ADMIN_PASSWORD=<strong password>
```

To promote an existing customer to admin via Prisma:
```bash
pnpm prisma studio
# Find the user → change role field to "admin"
```

Or via a one-off script:
```typescript
await prisma.user.update({
  where: { email: "user@example.com" },
  data: { role: "admin" },
})
```
