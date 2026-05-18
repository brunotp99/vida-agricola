# Authentication Design

## Library: Better Auth

Better Auth is configured in `lib/auth.ts` and mounted at `app/api/auth/[...all]/route.ts`. It uses the Prisma adapter with the PostgreSQL database.

## Configuration (`lib/auth.ts`)

```typescript
import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { prisma } from "./prisma"

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: { enabled: true },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24,       // refresh if older than 1 day
    cookieCache: { enabled: true, maxAge: 5 * 60 },
  },
  user: {
    additionalFields: {
      role: { type: "string", defaultValue: "customer" },
    },
  },
})
```

## API Route (`app/api/auth/[...all]/route.ts`)

```typescript
import { auth } from "@/lib/auth"
import { toNextJsHandler } from "better-auth/next-js"

export const { GET, POST } = toNextJsHandler(auth)
```

---

## Roles

| Role | Description | Assigned by |
|------|-------------|-------------|
| `customer` | Default for all registered users | Auto on sign-up |
| `staff` | Can manage orders, inventory, and content | Admin via `/admin/users` |
| `admin` | Full access including user management | Seeded via `prisma/seed.ts` |

Roles are stored in the `User.role` column as a PostgreSQL enum.

---

## Middleware Route Protection (`middleware.ts`)

```typescript
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"

const PUBLIC_ROUTES = ["/", "/login", "/register", "/forgot-password", "/reset-password"]
const CUSTOMER_ROUTES = ["/account", "/checkout", "/wishlist", "/order-confirmation"]
const ADMIN_ROUTES = ["/admin"]

export async function middleware(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers })
  const path = request.nextUrl.pathname

  if (ADMIN_ROUTES.some(r => path.startsWith(r))) {
    if (!session || session.user.role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url))
    }
  }

  if (CUSTOMER_ROUTES.some(r => path.startsWith(r))) {
    if (!session) {
      return NextResponse.redirect(
        new URL(`/login?redirect=${encodeURIComponent(path)}`, request.url)
      )
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
```

---

## Authentication Flows

### Registration
1. User submits email + password to `POST /api/auth/sign-up/email`
2. Better Auth hashes the password (bcrypt), creates `User` with `role: customer`, creates `Session`
3. Frontend receives session cookie and redirects to `/account`

### Login
1. User submits email + password to `POST /api/auth/sign-in/email`
2. Better Auth validates credentials, creates/refreshes `Session`
3. If `?redirect=` param exists, redirects there; otherwise to `/account`

### OAuth (Google / GitHub)
1. User clicks "Sign in with Google" → redirected to `GET /api/auth/sign-in/google`
2. OAuth callback: `GET /api/auth/callback/google`
3. Better Auth upserts `User` and `Account` records, creates `Session`

### Password Reset
1. User submits email to `POST /api/auth/forgot-password` → creates `VerificationToken` with `type: "password-reset"`
2. `EmailService.sendPasswordReset` sends a link with the token
3. User opens link → `GET /reset-password?token=xxx`
4. User submits new password → `POST /api/auth/reset-password` → validates token, updates password hash, invalidates all sessions for that user

### Session Retrieval in Server Components

```typescript
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

const session = await auth.api.getSession({ headers: await headers() })
// session.user.id, session.user.email, session.user.role
```

### Session Retrieval in Client Components

```typescript
import { authClient } from "@/lib/auth-client"

const { data: session } = authClient.useSession()
```

`lib/auth-client.ts`:
```typescript
import { createAuthClient } from "better-auth/react"
export const authClient = createAuthClient()
```
