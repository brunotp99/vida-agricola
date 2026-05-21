import { prisma } from "@/lib/prisma"
import { Prisma } from "@/lib/generated/prisma/client"
import { ProductService, productCardInclude } from "./product.service"

type SearchInput = {
  query: string
  categorySlug?: string
  brandSlug?: string
  priceMin?: number
  priceMax?: number
  sort?: "relevance" | "price-asc" | "price-desc" | "newest"
  page?: number
  limit?: number
}

async function search(input: SearchInput) {
  const { query, page = 1, limit = 12 } = input
  const offset = (page - 1) * limit
  const sanitized = query
    .trim()
    .replace(/[^a-zA-ZÀ-ÿ0-9\s]/g, "")
    .trim()

  if (!sanitized) {
    const { sort, query: _query, ...rest } = input
    const mappedSort =
      sort === "relevance" || sort === undefined ? "newest" : sort
    return ProductService.findMany({ ...rest, page, limit, sort: mappedSort })
  }

  const sort = input.sort ?? "relevance"

  type RawProduct = { id: string; name: string; slug: string; rank: number }
  const rawResults = await prisma.$queryRaw<RawProduct[]>`
    SELECT p.id, p.name, p.slug, ts_rank(p."searchVector", q) AS rank
    FROM "Product" p,
         plainto_tsquery('english', ${sanitized}) q
    WHERE p."searchVector" @@ q
      AND p.status = 'active'
      ${input.priceMin !== undefined ? Prisma.sql`AND p.price >= ${input.priceMin}` : Prisma.empty}
      ${input.priceMax !== undefined ? Prisma.sql`AND p.price <= ${input.priceMax}` : Prisma.empty}
    ORDER BY ${
      sort === "price-asc"
        ? Prisma.sql`p.price ASC`
        : sort === "price-desc"
          ? Prisma.sql`p.price DESC`
          : sort === "newest"
            ? Prisma.sql`p."createdAt" DESC`
            : Prisma.sql`ts_rank(p."searchVector", q) DESC`
    }
    LIMIT ${limit} OFFSET ${offset}
  `

  if (rawResults.length === 0) return { products: [], total: 0, pages: 0 }

  const ids = rawResults.map((r) => r.id)

  const products = await prisma.product.findMany({
    where: { id: { in: ids } },
    include: productCardInclude,
  })

  // Preserve search ranking order
  const ordered = ids
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => p !== undefined)

  return {
    products: ordered,
    total: rawResults.length,
    pages: Math.ceil(rawResults.length / limit),
  }
}

async function autocomplete(query: string): Promise<string[]> {
  if (query.length < 2) return []
  const results = await prisma.product.findMany({
    where: {
      status: "active",
      name: { contains: query, mode: "insensitive" },
    },
    select: { name: true },
    take: 8,
    orderBy: { name: "asc" },
  })
  return results.map((r) => r.name)
}

export const SearchService = { search, autocomplete }
