# Phase 2 — Authentication (Tasks 16–24)

**Goal**: Full auth system with Better Auth — registration, login, OAuth, session, protected routes, and RBAC middleware.

**Prerequisite**: Phase 1 complete (Prisma schema with User/Session/Account/VerificationToken tables).

---

## Task 16 — Install and configure Better Auth

**What to do**:
- Install: `pnpm add better-auth`
- Create `lib/auth.ts` — see [architecture/auth-design.md](../architecture/auth-design.md) for the full configuration
- Create `lib/auth-client.ts` for client-side session access
- Create `app/api/auth/[...all]/route.ts`
- Add `BETTER_AUTH_SECRET` and `BETTER_AUTH_URL` to `.env.example` and `.env.local`

**Files**: `lib/auth.ts`, `lib/auth-client.ts`, `app/api/auth/[...all]/route.ts`

**Acceptance**: `POST /api/auth/sign-up/email` with `{ email, password, name }` creates a `User` row with `role: customer` in the database

---

## Task 17 — Add Google and GitHub OAuth providers

**What to do**:
- Register an OAuth app in [Google Cloud Console](https://console.cloud.google.com/) with redirect URI `http://localhost:3000/api/auth/callback/google`
- Register an OAuth app in [GitHub Developer Settings](https://github.com/settings/developers) with callback URL `http://localhost:3000/api/auth/callback/github`
- Add `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` to `lib/auth.ts` providers config and to `.env.example`
- Add "Sign in with Google" and "Sign in with GitHub" buttons to the login form (built in Task 19) calling `authClient.signIn.social({ provider: "google" })`

**Files**: `lib/auth.ts`, `.env.example`

**Acceptance**: Clicking "Sign in with Google" redirects to Google's OAuth consent screen

---

## Task 18 — Implement Next.js middleware for route protection

**What to do**:
- Create `middleware.ts` at the project root
- Implement the guard logic from [architecture/auth-design.md](../architecture/auth-design.md#middleware-route-protection-middlewarets)
- Protected customer routes: `/account`, `/checkout`, `/wishlist`, `/order-confirmation`
- Admin-only routes: `/admin`
- All other routes: public
- Add `config.matcher` to exclude `_next/static`, `_next/image`, `favicon.ico`, and `api/auth`

**Files**: `middleware.ts`

**Acceptance**:
- Visiting `/admin` as unauthenticated → redirected to `/`
- Visiting `/account` as unauthenticated → redirected to `/login?redirect=/account`
- Visiting `/account` as authenticated customer → allowed
- Visiting `/admin` as authenticated customer → redirected to `/`
- Visiting `/admin` as authenticated admin → allowed

---

## Task 19 — Build the Login page

**What to do**:
- Create route group `app/(auth)/` with its own `layout.tsx` (centered card layout, no header/footer)
- Create `components/auth/login-form.tsx` — React Hook Form + `LoginSchema` from `lib/validations/auth.schema.ts`
- On submit, call `authClient.signIn.email({ email, password })`
- On success, redirect to `?redirect` param or `/account`
- On error, show toast with error message
- Add "Forgot password?" link and "Create account" link
- Create `app/(auth)/login/page.tsx` that renders `LoginForm`

**Files**: `app/(auth)/layout.tsx`, `app/(auth)/login/page.tsx`, `components/auth/login-form.tsx`

**Acceptance**: Valid credentials create a session; invalid credentials show "Invalid email or password"; the form shows a loading spinner during submission

---

## Task 20 — Build the Register page

**What to do**:
- Create `components/auth/register-form.tsx` — fields: name, email, password, confirm password
- Validate with `RegisterSchema` (confirm password match, minimum length, etc.)
- On submit, call `authClient.signUp.email({ email, password, name })`
- On success, redirect to `/account`
- Create `app/(auth)/register/page.tsx`

**Files**: `app/(auth)/register/page.tsx`, `components/auth/register-form.tsx`

**Acceptance**: Registering creates a `User` row with `role: customer`; attempting to register with an existing email shows "Email already in use"

---

## Task 21 — Build the Forgot Password and Reset Password pages

**What to do**:
- Create `components/auth/forgot-password-form.tsx` — email field; calls `authClient.requestPasswordReset({ email, redirectTo: "/reset-password" })`
- Create `app/(auth)/forgot-password/page.tsx`
- Create `app/(auth)/reset-password/page.tsx` — reads `?token=` from URL; calls `authClient.resetPassword({ newPassword, token })`
- Show success message after submit (do not confirm whether the email exists, for security)

**Files**: `app/(auth)/forgot-password/page.tsx`, `app/(auth)/reset-password/page.tsx`

**Acceptance**: Submitting a valid email creates a `VerificationToken` row; the reset form with a valid token updates the password and invalidates all sessions for that user

---

## Task 22 — Update Header with real auth state

**What to do**:
- Convert the account icon area in `components/header.tsx` to use `authClient.useSession()`
- When unauthenticated: show "Sign In" button linking to `/login`
- When authenticated: show avatar dropdown with "My Account" (→ `/account`), "Orders" (→ `/account/orders`), "Sign Out" button
- "Sign Out" calls `authClient.signOut()` then `router.push("/")`
- Replace hardcoded `cartItemCount: 3` and `wishlistCount: 5` with real counts (load in the server component that wraps the header, or via a separate fetch)

**Files**: `components/header.tsx`

**Acceptance**: Logging in shows the user's name/avatar in the header; the cart count updates after adding an item

---

## Task 23 — Build auth server actions

**What to do**:
- Create `lib/actions/users.ts` with:
  - `updateProfileAction(input: { name: string; image?: string })` — updates `User.name` and `User.image`
  - `changePasswordAction(input: { currentPassword: string; newPassword: string })` — validates current password, updates hash
- Wire these to the account settings form in `app/account/page.tsx` (currently non-functional)

**Files**: `lib/actions/users.ts`, `app/account/page.tsx` (minor update)

**Acceptance**: Changing the display name in account settings updates the `User` row and reflects immediately in the header

---

## Task 24 — Seed an admin user

**What to do**:
- Update `prisma/seed.ts` to create a user with `role: admin` using `ADMIN_EMAIL` and `ADMIN_PASSWORD` from env vars
- Hash the password using Better Auth's hash function (or bcrypt directly)
- Use `upsert` to avoid duplicate errors on re-seed

**Files**: `prisma/seed.ts`

**Acceptance**: After `pnpm prisma db seed`, logging in with `ADMIN_EMAIL`/`ADMIN_PASSWORD` creates a session where `session.user.role === 'admin'`; visiting `/admin` with this session is allowed by the middleware
