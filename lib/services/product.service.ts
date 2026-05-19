import { unstable_cache } from "next/cache"
import { prisma } from "@/lib/prisma"
import type { Prisma } from "@/lib/generated/prisma/client"

export type FindManyOptions = {
  categorySlug?: string
  brandSlug?: string
  priceMin?: number
  priceMax?: number
  minRating?: number
  inStock?: boolean
  featured?: boolean
  onSale?: boolean
  sort?: "price-asc" | "price-desc" | "newest" | "rating" | "popular"
  page?: number
  limit?: number
}

export const productCardInclude = {
  images: { take: 1, orderBy: { sortOrder: "asc" as const } },
  brand: true,
  category: true,
  _count: { select: { reviews: true } },
  reviews: { select: { rating: true } },
  variants: { select: { stock: true } },
} satisfies Prisma.ProductInclude

export type ProductCardData = Prisma.ProductGetPayload<{ include: typeof productCardInclude }>

/** Safe-to-pass-to-client-components version with prices as plain numbers */
export type SerializedProductCard = Omit<ProductCardData, "price" | "compareAtPrice"> & {
  price: number
  compareAtPrice: number | null
}

function decimalToNumber(val: unknown): number {
  if (typeof val === "number") return val
  if (typeof val === "string") return parseFloat(val)
  if (val != null && typeof (val as { toNumber?: unknown }).toNumber === "function") {
    return (val as { toNumber(): number }).toNumber()
  }
  return Number(val)
}

export function serializeProductCard(p: ProductCardData): SerializedProductCard {
  return {
    ...p,
    price: decimalToNumber(p.price),
    compareAtPrice: p.compareAtPrice == null ? null : decimalToNumber(p.compareAtPrice),
  }
}

async function findMany(options: FindManyOptions = {}) {
  const {
    categorySlug,
    brandSlug,
    priceMin,
    priceMax,
    minRating,
    inStock,
    featured,
    onSale,
    sort = "newest",
    page = 1,
    limit = 12,
  } = options
  const skip = (page - 1) * limit

  const where: Prisma.ProductWhereInput = {
    status: "active",
    ...(featured !== undefined && { featured }),
    ...(categorySlug && { category: { slug: categorySlug } }),
    ...(brandSlug && { brand: { slug: brandSlug } }),
    ...(priceMin !== undefined || priceMax !== undefined
      ? {
          price: {
            ...(priceMin !== undefined && { gte: priceMin }),
            ...(priceMax !== undefined && { lte: priceMax }),
          },
        }
      : {}),
    ...(inStock && { variants: { some: { stock: { gt: 0 } } } }),
    ...(minRating !== undefined && {
      reviews: { some: { rating: { gte: minRating } } },
    }),
    ...(onSale && {
      OR: [{ flashDeal: true }, { compareAtPrice: { not: null } }],
    }),
  }

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    sort === "price-asc"
      ? { price: "asc" }
      : sort === "price-desc"
        ? { price: "desc" }
        : sort === "newest"
          ? { createdAt: "desc" }
          : { createdAt: "desc" }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: productCardInclude,
      orderBy,
      skip,
      take: limit,
    }),
    prisma.product.count({ where }),
  ])

  return { products, total, pages: Math.ceil(total / limit) }
}

const findBySlug = async (slug: string) => {
  return prisma.product.findUnique({
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
}

export type ProductDetail = NonNullable<Awaited<ReturnType<typeof findBySlug>>>

const findFeatured = unstable_cache(
  async () => {
    return prisma.product.findMany({
      where: { status: "active", featured: true },
      include: productCardInclude,
      orderBy: { createdAt: "desc" },
      take: 8,
    })
  },
  ["products-featured"],
  { revalidate: 300, tags: ["products"] },
)

const findBestSellers = unstable_cache(
  async () => {
    return prisma.product.findMany({
      where: { status: "active", bestSeller: true },
      include: productCardInclude,
      orderBy: { createdAt: "desc" },
      take: 8,
    })
  },
  ["products-best-sellers"],
  { revalidate: 300, tags: ["products"] },
)

const findNewArrivals = unstable_cache(
  async () => {
    return prisma.product.findMany({
      where: { status: "active", newArrival: true },
      include: productCardInclude,
      orderBy: { createdAt: "desc" },
      take: 8,
    })
  },
  ["products-new-arrivals"],
  { revalidate: 300, tags: ["products"] },
)

const findFlashDeals = unstable_cache(
  async () => {
    return prisma.product.findMany({
      where: { status: "active", flashDeal: true },
      include: productCardInclude,
      orderBy: { createdAt: "desc" },
      take: 4,
    })
  },
  ["products-flash-deals"],
  { revalidate: 300, tags: ["products"] },
)

async function findRelated(productId: string, categoryId: string | null) {
  return prisma.product.findMany({
    where: {
      status: "active",
      id: { not: productId },
      ...(categoryId && { categoryId }),
    },
    include: productCardInclude,
    take: 4,
    orderBy: { createdAt: "desc" },
  })
}

export const ProductService = {
  findMany,
  findBySlug,
  findFeatured,
  findBestSellers,
  findNewArrivals,
  findFlashDeals,
  findRelated,
}
