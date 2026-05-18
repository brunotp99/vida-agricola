# SearchService

**File**: `lib/services/search.service.ts`

## Interface

```typescript
export const SearchService = {
  search,        // full-text product search with filters and pagination
  autocomplete,  // fast typeahead suggestions (product names only)
}
```

## `search` Implementation

Uses the `tsvector` GIN index created in Task 11. Combines full-text ranking with filter conditions.

```typescript
async function search(input: {
  query: string
  categorySlug?: string
  brandSlug?: string
  priceMin?: number
  priceMax?: number
  sort?: "relevance" | "price-asc" | "price-desc" | "newest"
  page?: number
  limit?: number
}) {
  const { query, page = 1, limit = 12 } = input
  const offset = (page - 1) * limit

  // Sanitize query for tsquery
  const sanitized = query.trim().replace(/[^a-zA-ZÀ-ÿ0-9\s]/g, "").trim()
  if (!sanitized) {
    return ProductService.findMany({ ...input, page, limit })
  }

  const orderClause = {
    "relevance": 'ORDER BY ts_rank(p."searchVector", q) DESC',
    "price-asc": "ORDER BY p.price ASC",
    "price-desc": "ORDER BY p.price DESC",
    "newest": 'ORDER BY p."createdAt" DESC',
  }[input.sort ?? "relevance"]

  const results = await prisma.$queryRaw<Array<Product & { rank: number }>>`
    SELECT p.*, ts_rank(p."searchVector", q) AS rank
    FROM "Product" p,
         plainto_tsquery('portuguese', ${sanitized}) q
    WHERE p."searchVector" @@ q
      AND p.status = 'active'
      ${input.priceMin ? Prisma.sql`AND p.price >= ${input.priceMin}` : Prisma.empty}
      ${input.priceMax ? Prisma.sql`AND p.price <= ${input.priceMax}` : Prisma.empty}
    ${Prisma.raw(orderClause)}
    LIMIT ${limit} OFFSET ${offset}
  `

  return results
}
```

## `autocomplete` Implementation

Returns up to 8 product names that match the prefix. Used by the search bar dropdown.

```typescript
async function autocomplete(query: string): Promise<string[]> {
  if (query.length < 2) return []

  const results = await prisma.product.findMany({
    where: {
      status: "active",
      name: { contains: query, mode: "insensitive" },
    },
    select: { name: true, slug: true },
    take: 8,
    orderBy: { name: "asc" },
  })

  return results.map(r => r.name)
}
```

For better prefix matching, consider using `ILIKE '${query}%'` via `$queryRaw` for performance.

## Route Handler for Autocomplete

The autocomplete endpoint is a GET Route Handler (not a Server Action) because it's called client-side with debounce:

```
GET /api/search/autocomplete?q=chick
→ { suggestions: ["Chicken Feed 25kg", "Chicken Starter Mix", ...] }
```

Cache headers: `Cache-Control: public, max-age=60` — autocomplete results are the same for all users for a given query.

## Search Page URL Structure

Filters are stored in URL search params:
```
/search?q=chicken+feed&category=animal-feed&priceMin=10&priceMax=100&sort=price-asc&page=2
```

The search page is a Server Component that reads these params directly:

```typescript
export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; /* ... */ }>
}) {
  const params = await searchParams
  const results = await SearchService.search(params)
  // ...
}
```
