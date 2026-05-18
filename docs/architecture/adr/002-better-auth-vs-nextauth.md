# ADR 002: Use Better Auth over NextAuth v5

**Status**: Accepted

## Context

We need authentication in a Next.js App Router project. The primary candidates are NextAuth v5 (Auth.js) and Better Auth.

## Decision

Use **Better Auth**.

## Rationale

- Better Auth has native support for Next.js App Router with typed session access in both server components and client components out of the box
- Built-in RBAC with `user.role` — no custom plugin required
- The `prismaAdapter` integrates with our Prisma schema without requiring a separate adapter package
- Better Auth's `auth.api.getSession` can be called directly in `middleware.ts` without edge-runtime limitations
- Active development with a focus on modern Next.js patterns

## Trade-offs

- NextAuth v5 (Auth.js) has a larger ecosystem and more community resources
- Better Auth is newer and may have fewer third-party plugins
- If we later need Credentials provider edge cases, Auth.js has more documented examples
