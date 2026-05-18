# CartService

**File**: `lib/services/cart.service.ts`

## Overview

The cart supports both **authenticated users** (cart linked to `userId`) and **guests** (cart linked to a `sessionId` cookie). When a guest logs in, their cart is merged into the authenticated user's cart.

## Interface

```typescript
export const CartService = {
  getOrCreateCart,     // get or create cart by userId or sessionId
  getCartWithItems,    // full cart with product data
  addItem,            // add or increment quantity
  updateItem,         // set quantity (0 = remove)
  removeItem,         // delete a CartItem row
  clearCart,          // remove all items (called after order creation)
  mergeGuestCart,     // merge guest cart into user cart on login
  getItemCount,       // total quantity across all items
}
```

## Cart Identity

The `CartService` always requires either `userId` or `sessionId`. The caller (usually a Server Action) determines which to pass:

```typescript
// In a Server Action:
const session = await auth.api.getSession({ headers: await headers() })
const userId = session?.user.id ?? null
const sessionId = userId ? null : cookies().get("guest-session-id")?.value

const cart = await CartService.getOrCreateCart({ userId, sessionId })
```

## `addItem` Logic

1. Get or create cart
2. Check `ProductVariant.stockCount >= quantity` (throw if not enough)
3. Upsert the `CartItem`:
   ```typescript
   prisma.cartItem.upsert({
     where: { cartId_productId_variantId: { cartId, productId, variantId } },
     create: { cartId, productId, variantId, quantity },
     update: { quantity: { increment: quantity } },
   })
   ```
4. After upsert, verify the new total quantity does not exceed `stockCount`

## `mergeGuestCart` Logic

Called from the Better Auth `onAfterSignIn` hook:

```typescript
async function mergeGuestCart(guestSessionId: string, userId: string) {
  const guestCart = await prisma.cart.findUnique({
    where: { sessionId: guestSessionId },
    include: { items: true },
  })
  if (!guestCart) return

  const userCart = await CartService.getOrCreateCart({ userId })

  for (const item of guestCart.items) {
    await CartService.addItem(userCart.id, {
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.quantity,
    })
  }

  await prisma.cart.delete({ where: { id: guestCart.id } })
}
```

## `getCartWithItems` Return Shape

```typescript
type CartWithItems = {
  id: string
  items: Array<{
    id: string
    quantity: number
    product: {
      id: string; name: string; slug: string; price: Decimal
      images: ProductImage[]
    }
    variant: ProductVariant | null
  }>
  subtotal: Decimal
  itemCount: number
}
```

The `subtotal` and `itemCount` are computed in the service (not stored in the DB) to avoid staleness.
