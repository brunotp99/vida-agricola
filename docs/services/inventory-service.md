# InventoryService

**File**: `lib/services/inventory.service.ts`

## Overview

The inventory system tracks stock at the `ProductVariant` level. Each stock movement is recorded in `InventoryLog` for auditability.

## Interface

```typescript
export const InventoryService = {
  reserveStock,        // atomic decrement (prevents overselling)
  releaseStock,        // increment (order cancelled or payment failed)
  logMovement,         // record an InventoryLog entry
  getStockLevel,       // current stockCount for a product/variant
  getLowStockProducts, // products with stockCount <= threshold
  adjustStock,         // admin manual adjustment
}
```

## `reserveStock` (Atomic)

Uses a conditional UPDATE to prevent race conditions:

```typescript
async function reserveStock(
  productId: string,
  variantId: string | null,
  quantity: number,
  orderId?: string
) {
  await prisma.$transaction(async (tx) => {
    if (variantId) {
      const result = await tx.$executeRaw`
        UPDATE "ProductVariant"
        SET "stockCount" = "stockCount" - ${quantity}
        WHERE id = ${variantId} AND "stockCount" >= ${quantity}
      `
      if (result === 0) throw new Error(`Insufficient stock for variant ${variantId}`)
    }

    await tx.inventoryLog.create({
      data: {
        productId,
        variantId,
        delta: -quantity,
        reason: "sale",
        orderId,
      },
    })
  })
}
```

## `releaseStock`

Called when a payment fails (from the Stripe `payment_intent.payment_failed` webhook):

```typescript
async function releaseStock(productId: string, variantId: string | null, quantity: number) {
  if (variantId) {
    await prisma.productVariant.update({
      where: { id: variantId },
      data: { stockCount: { increment: quantity } },
    })
  }
  await logMovement(productId, variantId, quantity, "return")
}
```

## `getLowStockProducts`

Used by the admin inventory page to highlight products needing restocking:

```typescript
async function getLowStockProducts(threshold = 5) {
  return prisma.productVariant.findMany({
    where: { stockCount: { lte: threshold } },
    include: {
      product: { include: { images: { take: 1 } } },
    },
    orderBy: { stockCount: "asc" },
  })
}
```

## Admin `adjustStock`

Records a manual adjustment from the admin inventory management page:

```typescript
async function adjustStock(
  productId: string,
  variantId: string,
  newStockCount: number,
  reason: string
) {
  const current = await prisma.productVariant.findUnique({ where: { id: variantId } })
  const delta = newStockCount - (current?.stockCount ?? 0)

  await prisma.$transaction([
    prisma.productVariant.update({
      where: { id: variantId },
      data: { stockCount: newStockCount },
    }),
    prisma.inventoryLog.create({
      data: { productId, variantId, delta, reason: "adjustment" },
    }),
  ])
}
```

## Preventing Overselling in Cart

`CartService.addItem` also checks stock before adding to the cart (not just at checkout). This is a soft check — the hard check is `reserveStock` at payment intent creation time, which uses a database-level lock.
