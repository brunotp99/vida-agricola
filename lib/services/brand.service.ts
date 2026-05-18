import { unstable_cache } from "next/cache"
import { prisma } from "@/lib/prisma"

async function findAll() {
  return prisma.brand.findMany({ orderBy: { name: "asc" } })
}

async function findBySlug(slug: string) {
  return prisma.brand.findUnique({ where: { slug } })
}

const findFeatured = unstable_cache(
  async () => {
    return prisma.brand.findMany({
      where: { featured: true },
      orderBy: { name: "asc" },
    })
  },
  ["brands-featured"],
  { revalidate: 3600, tags: ["brands"] },
)

async function findWithProductCount() {
  const brands = await prisma.brand.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { products: { where: { status: "active" } } } },
    },
  })
  return brands.map((b) => ({ ...b, productCount: b._count.products }))
}

export const BrandService = {
  findAll,
  findBySlug,
  findFeatured,
  findWithProductCount,
}
