# Session Management

## Session Storage

Sessions are stored in the `Session` table in PostgreSQL, not in JWTs. The session token is a random string stored in a `HttpOnly` `Secure` `SameSite=Lax` cookie managed by Better Auth.

## Session Lifetime

| Setting | Value |
|---------|-------|
| Session expiry | 30 days |
| Sliding window refresh | Refreshed if last access > 24 hours ago |
| Cookie max age | 30 days |

## Session Invalidation

Sessions are invalidated when:
- User explicitly signs out (`authClient.signOut()`)
- Password is reset (Better Auth clears all sessions for the user)
- Admin bans a user (middleware checks `user.banned` and signs out)
- Session `expiresAt` is in the past

## Multiple Devices

Each login creates a new `Session` row. A user can have multiple active sessions (one per device). Signing out only invalidates the current session token, not all sessions.

To sign out all devices from the account settings page, implement:
```typescript
await prisma.session.deleteMany({ where: { userId: session.user.id } })
```

## Checking Session Staleness in Middleware

The middleware checks the session on every non-static request. Better Auth handles sliding expiry — if the session is within the `updateAge` window, it updates `updatedAt` without a database write (uses the `cookieCache`).

## Cookie Details

Better Auth sets:
- `better-auth.session_token` — the session token
- `better-auth.session_data` — a short-lived cache of session data to reduce DB reads

Both cookies are `HttpOnly`, `Secure` (in production), `SameSite=Lax`.
