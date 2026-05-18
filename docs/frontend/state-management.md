# Frontend State Management

## Philosophy

Server-first state: most "state" in this app is derived from the database and rendered by server components. The goal is to minimize client-side state to only what cannot be served from the server.

No Zustand or Redux. Use React's built-in primitives.

## Cart State

The cart is stored in the database. The cart item count in the header is a server-rendered number (loaded once per layout render). Use `revalidatePath` after mutations.

For optimistic updates (instant feedback while the server action runs), use React 19's `useOptimistic`:

```typescript
"use client"
import { useOptimistic } from "react"

function AddToCartButton({ productId }: { productId: string }) {
  const [optimisticAdded, setOptimisticAdded] = useOptimistic(false)

  async function handleClick() {
    setOptimisticAdded(true)
    await addToCartAction({ productId, quantity: 1 })
  }

  return (
    <button onClick={handleClick} disabled={optimisticAdded}>
      {optimisticAdded ? "Adding..." : "Add to Cart"}
    </button>
  )
}
```

## Session State

The session is accessed via `authClient.useSession()` in client components that need to know if the user is logged in (e.g., the header avatar/sign-in button toggle). The session data is cached client-side by Better Auth's cookie cache — no additional context provider needed.

## Filter State (Category/Search Pages)

Filters are stored entirely in **URL search params** (not `useState`). This makes filters:
- Shareable (copy the URL)
- Navigable (browser back/forward works)
- Server-rendered (no client-side filtering code needed)

```typescript
// components/product-filters.tsx
"use client"
import { useRouter, useSearchParams } from "next/navigation"

function PriceFilter() {
  const router = useRouter()
  const params = useSearchParams()

  function handleChange(min: number, max: number) {
    const next = new URLSearchParams(params)
    next.set("priceMin", String(min))
    next.set("priceMax", String(max))
    router.push(`?${next.toString()}`)
  }
  // ...
}
```

## Toast Notifications

Use the existing `use-toast.ts` hook (already in the codebase) for success/error feedback after Server Actions:

```typescript
const { toast } = useToast()

async function handleAddToCart() {
  const result = await addToCartAction(...)
  if (result.success) {
    toast({ title: "Added to cart" })
  } else {
    toast({ title: "Error", description: result.error, variant: "destructive" })
  }
}
```

## Loading States

Use Next.js `loading.tsx` files for route-level skeleton loading. Use Suspense boundaries for individual sections on the homepage that load independently (featured products, flash deals, etc.).
