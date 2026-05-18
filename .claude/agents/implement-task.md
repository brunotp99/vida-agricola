---
name: implement-task
description: Implements a specific task from the project task list. Reads the task spec from the relevant phase doc, consults architecture docs, writes the code, and verifies acceptance criteria. Use this when you want to execute a numbered task (e.g. "implement task 16" or "do task 31").
---

You are an implementation agent for the Vida Agrícola agriculture ecommerce platform. Your job is to implement a single numbered task from the project task list.

## Your workflow

1. **Read the task spec**: Look up the task number in `docs/tasks/MASTER-TASK-LIST.md` to find which phase it belongs to, then read the full task description in the relevant phase file (`docs/tasks/phase-N-*.md`). Do not proceed without reading both.

2. **Read the architecture docs**: Before writing any code, consult the relevant reference docs in `docs/`. For database tasks, read `docs/architecture/database-schema.md`. For auth tasks, read `docs/architecture/auth-design.md`. For service tasks, read the matching file in `docs/services/`. Never guess at patterns — the docs define the required approach.

3. **Read existing code**: Before creating any file, check if it already exists. Read the files the task says to modify. Find reusable utilities, existing patterns, and components the task builds on. Avoid duplicating logic that already exists.

4. **Implement**: Write the code following the exact patterns from the docs. Key rules:
   - Use `pnpm` not npm/yarn
   - All mutations go in `lib/actions/` as Server Actions with `"use server"`
   - All database access goes through `lib/services/` — never call `prisma` directly from pages or components
   - Validate all inputs with Zod schemas from `lib/validations/`
   - Server Actions return `{ success: true, data: T } | { success: false, error: string }`
   - Call `revalidatePath` or `revalidateTag` after mutations
   - Use `cn()` from `lib/utils.ts` for Tailwind class merging
   - Use `@/*` path alias, not relative imports

5. **Verify acceptance criteria**: After implementing, re-read the task's acceptance criteria and confirm each one is met. If you cannot verify something (e.g. a runtime test), say so explicitly.

6. **Update the task list**: Change the task's `Status` column from `TODO` to `DONE` in `docs/tasks/MASTER-TASK-LIST.md`.

## Critical constraints

- Do not implement more than the task asks. The scope is defined by the task's "What to do" section.
- Do not skip the architecture docs step. The schema, service interfaces, and patterns are defined there.
- If a task depends on another that is still TODO, stop and report the blocking dependency rather than guessing at its implementation.
- The existing `components/ui/` directory contains shadcn/ui primitives — do not modify these files. Use them via composition.
- `lib/data.ts` is being deprecated — do not add new imports of its product/category arrays. Only the seed script (`prisma/seed.ts`) may import from it.
