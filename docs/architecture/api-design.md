# API Design

## Server Actions vs Route Handlers

### Rule: Server Actions for Mutations

All internal data mutations use **Server Actions** defined in `lib/actions/`. They benefit from:
- Automatic CSRF protection (same-origin only)
- No boilerplate API route required
- Co-location with the UI
- Type-safe inputs and outputs
- `revalidatePath` / `revalidateTag` for ISR invalidation

### Rule: Route Handlers for Externally-Triggered Endpoints

Route Handlers (`app/api/`) are used only when:
1. **Stripe webhooks** — initiated by Stripe servers, not the browser
2. **Better Auth** — library-managed at `app/api/auth/[...all]/route.ts`
3. **Search autocomplete** — requires a low-latency GET endpoint for client-side debounce
4. **Sitemap generation** — crawled by search engines directly

---

## Server Action Pattern

All Server Actions live in `lib/actions/` and follow this shape:

```typescript
// lib/actions/cart.ts
"use server"

import { z } from "zod"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { CartService } from "@/lib/services/cart.service"
import { revalidatePath } from "next/cache"

const AddToCartSchema = z.object({
  productId: z.string().cuid(),
  variantId: z.string().cuid().optional(),
  quantity: z.number().int().min(1).max(99),
})

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string }

export async function addToCartAction(
  input: z.infer<typeof AddToCartSchema>
): Promise<ActionResult<void>> {
  const parsed = AddToCartSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: "Invalid input" }
  }

  const session = await auth.api.getSession({ headers: await headers() })
  const userId = session?.user.id ?? null

  try {
    await CartService.addItem(userId, parsed.data)
    revalidatePath("/cart")
    return { success: true, data: undefined }
  } catch (err) {
    if (err instanceof Error) {
      return { success: false, error: err.message }
    }
    return { success: false, error: "Unexpected error" }
  }
}
```

### Conventions

- File location: `lib/actions/[domain].ts` or `lib/actions/admin/[domain].ts`
- Every action validates with Zod before touching the database
- Return type: `{ success: true, data: T } | { success: false, error: string }`
- Call `revalidatePath` or `revalidateTag` after mutations that affect cached pages
- Admin actions additionally check `session.user.role === 'admin'` and return `{ success: false, error: 'Forbidden' }` if not

---

## Route Handler Pattern

```typescript
// app/api/search/autocomplete/route.ts
import { NextRequest, NextResponse } from "next/server"
import { SearchService } from "@/lib/services/search.service"

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") ?? ""

  if (q.length < 2) {
    return NextResponse.json({ suggestions: [] })
  }

  const suggestions = await SearchService.autocomplete(q)
  return NextResponse.json({ suggestions }, {
    headers: { "Cache-Control": "public, max-age=60" },
  })
}
```

---

## Zod Schema Catalogue

| Schema file | Used in |
|-------------|---------|
| `lib/validations/auth.schema.ts` | Login, register, forgot-password, reset-password actions |
| `lib/validations/cart.schema.ts` | `addToCartAction`, `updateCartItemAction` |
| `lib/validations/checkout.schema.ts` | `createPaymentIntentAction`, address form |
| `lib/validations/product.schema.ts` | Admin product create/edit actions |
| `lib/validations/order.schema.ts` | Order status update, cancellation |
| `lib/validations/review.schema.ts` | `submitReviewAction` |

---

## Error Handling

All errors from actions are `ActionResult.error` strings shown inline in the form. Server-side errors are logged but never exposed to the client in detail. The catch block pattern ensures no stack traces leak to the browser.

For HTTP Route Handlers, return `NextResponse.json({ error: "..." }, { status: 4xx })` with an appropriate status code.
