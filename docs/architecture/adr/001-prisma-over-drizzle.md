# ADR 001: Use Prisma over Drizzle

**Status**: Accepted

## Context

We need an ORM for PostgreSQL access in a Next.js App Router project with TypeScript. The two primary candidates are Prisma and Drizzle.

## Decision

Use **Prisma ORM**.

## Rationale

- **Prisma Studio** provides a GUI for data exploration during development — useful when building the seed script and debugging production issues
- **Prisma Migrate** generates SQL migration files from schema changes, which can be reviewed and version-controlled
- **Type safety** is automatically derived from the schema — no manual type definitions
- The `@prisma/client` generated types are deeply integrated with TypeScript autocomplete
- The team is likely more familiar with Prisma's declarative schema syntax

## Trade-offs

- Drizzle is lighter and generates SQL more predictably (easier to reason about query performance)
- Drizzle's type inference is compile-time only (no runtime overhead from `@prisma/client`)
- Prisma Client has a known N+1 risk if relations are not selected explicitly — mitigated by always specifying `include` or `select`
