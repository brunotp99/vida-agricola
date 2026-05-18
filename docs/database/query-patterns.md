# Query Patterns

## N+1 Prevention

Always use `include` or `select` to fetch relations in a single query instead of lazy-loading.

**Bad** (N+1):
```typescript
const products = await prisma.product.findMany()
// Then in a loop:
const category = await prisma.category.findUnique({ where: { id: p.categoryId } })
```

**Good** (single query with JOIN):
```typescript
const products = await prisma.product.findMany({
  include: {
    category: true,
    images: { orderBy: { sortOrder: "asc" }, take: 1 },
    brand: { select: { name: true, slug: true } },
  },
})
```

## Pagination

Use **offset pagination** for admin tables (known total required for page numbers).
Use **cursor pagination** for storefront infinite scroll (no count needed, more efficient).

### Offset Pagination
```typescript
const [products, total] = await prisma.$transaction([
  prisma.product.findMany({
    where: filters,
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { createdAt: "desc" },
  }),
  prisma.product.count({ where: filters }),
])
return { products, total, pages: Math.ceil(total / limit) }
```

### Cursor Pagination
```typescript
const products = await prisma.product.findMany({
  take: limit + 1,
  cursor: cursor ? { id: cursor } : undefined,
  orderBy: { createdAt: "desc" },
  skip: cursor ? 1 : 0,
})
const hasMore = products.length > limit
return { products: products.slice(0, limit), nextCursor: hasMore ? products[limit - 1].id : null }
```

## Atomic Stock Update (Preventing Overselling)

Use `$executeRaw` for atomic decrement with a conditional:

```typescript
async function reserveStock(productId: string, quantity: number) {
  const result = await prisma.$executeRaw`
    UPDATE "ProductVariant"
    SET "stockCount" = "stockCount" - ${quantity}
    WHERE id = ${variantId}
      AND "stockCount" >= ${quantity}
  `
  if (result === 0) {
    throw new Error("Insufficient stock")
  }
}
```

Or use a transaction with `SELECT FOR UPDATE`:

```typescript
await prisma.$transaction(async (tx) => {
  const variant = await tx.$queryRaw<{ stockCount: number }[]>`
    SELECT "stockCount" FROM "ProductVariant"
    WHERE id = ${variantId}
    FOR UPDATE
  `
  if (variant[0].stockCount < quantity) {
    throw new Error("Insufficient stock")
  }
  await tx.productVariant.update({
    where: { id: variantId },
    data: { stockCount: { decrement: quantity } },
  })
})
```

## Full-Text Search

```typescript
const query = input.trim().replace(/[^a-zA-ZÀ-ÿ0-9\s]/g, "")

const products = await prisma.$queryRaw<Product[]>`
  SELECT p.*, ts_rank(p."searchVector", query) AS rank
  FROM "Product" p,
       plainto_tsquery('portuguese', ${query}) query
  WHERE p."searchVector" @@ query
    AND p.status = 'active'
  ORDER BY rank DESC
  LIMIT ${limit} OFFSET ${offset}
`
```

## Filtering Products

Build the `where` clause dynamically based on query params:

```typescript
const where: Prisma.ProductWhereInput = {
  status: "active",
  ...(categorySlug && { category: { slug: categorySlug } }),
  ...(brandSlug && { brand: { slug: brandSlug } }),
  ...(priceMin !== undefined && { price: { gte: priceMin } }),
  ...(priceMax !== undefined && { price: { lte: priceMax } }),
  ...(inStock && { variants: { some: { stockCount: { gt: 0 } } } }),
}
```

## Aggregations for Analytics

```typescript
// Revenue per day for the last 30 days
const revenue = await prisma.$queryRaw<{ day: Date; total: number }[]>`
  SELECT
    DATE_TRUNC('day', "createdAt") AS day,
    SUM(total)::float AS total
  FROM "Order"
  WHERE status IN ('confirmed', 'processing', 'shipped', 'delivered')
    AND "createdAt" >= NOW() - INTERVAL '30 days'
  GROUP BY day
  ORDER BY day ASC
`
```
