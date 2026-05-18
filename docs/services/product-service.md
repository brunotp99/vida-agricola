# ProductService

**File**: `lib/services/product.service.ts`

## Interface

```typescript
export const ProductService = {
  findMany,      // paginated list with filters
  findBySlug,    // single product by slug (includes images, variants, reviews summary)
  findFeatured,  // featured: true, status: active
  findBestSellers, // bestSeller: true, status: active
  findNewArrivals, // newArrival: true, status: active
  findFlashDeals,  // flashDeal: true, status: active
  findRelated,   // same category, excluding current product
  search,        // full-text via SearchService
}
```

## `findMany` Filters

```typescript
type FindManyOptions = {
  categorySlug?: string
  brandSlug?: string
  subcategorySlug?: string
  priceMin?: number
  priceMax?: number
  minRating?: number
  inStock?: boolean
  featured?: boolean
  tags?: string[]
  sort?: "price-asc" | "price-desc" | "newest" | "rating" | "popular"
  page?: number   // default: 1
  limit?: number  // default: 12
}
```

Returns: `{ products: Product[], total: number, pages: number }`

## Caching

Apply `unstable_cache` to `findFeatured`, `findBestSellers`, `findNewArrivals`, and `findFlashDeals` since they are shown on the homepage and don't change on every request:

```typescript
import { unstable_cache } from "next/cache"

export const findFeatured = unstable_cache(
  async () => {
    return prisma.product.findMany({
      where: { status: "active", featured: true },
      include: { images: { take: 1 }, category: true },
      orderBy: { createdAt: "desc" },
      take: 8,
    })
  },
  ["products-featured"],
  { revalidate: 300, tags: ["products"] } // 5-minute TTL
)
```

After an admin updates a product, call `revalidateTag("products")` to bust the cache.

## Stock Status

Products without variants: stock is inferred as `inStock: true` if any variant has `stockCount > 0`.

For products without variants, add a virtual `stockCount` field to the Product model (or use a `defaultVariant`).

## `findBySlug` Include Shape

```typescript
prisma.product.findUnique({
  where: { slug, status: "active" },
  include: {
    images: { orderBy: { sortOrder: "asc" } },
    variants: { orderBy: { price: "asc" } },
    category: { include: { parent: true } },
    brand: true,
    tags: true,
    specifications: { orderBy: { key: "asc" } },
    reviews: {
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { user: { select: { name: true, image: true } } },
    },
    _count: { select: { reviews: true } },
  },
})
```
