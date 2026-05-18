# Better Auth Setup

## Installation

```bash
pnpm add better-auth
```

## Files to Create

### `lib/auth.ts`

See the full configuration in [architecture/auth-design.md](../architecture/auth-design.md#configuration-libauthts).

### `lib/auth-client.ts`

```typescript
import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
})
```

### `app/api/auth/[...all]/route.ts`

```typescript
import { auth } from "@/lib/auth"
import { toNextJsHandler } from "better-auth/next-js"

export const { GET, POST } = toNextJsHandler(auth)
```

## Environment Variables Required

```
BETTER_AUTH_SECRET=<random 32+ character string>
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
```

Generate `BETTER_AUTH_SECRET`:
```bash
openssl rand -base64 32
```

## Wiring into the Root Layout

Wrap the app with a session provider so client components can access `useSession`:

```typescript
// app/layout.tsx
import { SessionProvider } from "@/components/session-provider"

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}
```

```typescript
// components/session-provider.tsx
"use client"
import { authClient } from "@/lib/auth-client"

export function SessionProvider({ children }: { children: React.ReactNode }) {
  return <authClient.Provider>{children}</authClient.Provider>
}
```

## Getting the Session

**In Server Components:**
```typescript
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

const session = await auth.api.getSession({ headers: await headers() })
// session?.user.id, session?.user.role
```

**In Client Components:**
```typescript
import { authClient } from "@/lib/auth-client"

const { data: session, isPending } = authClient.useSession()
```

**In Middleware:**
```typescript
import { auth } from "@/lib/auth"
const session = await auth.api.getSession({ headers: request.headers })
```
