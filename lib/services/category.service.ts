import { unstable_cache } from "next/cache"
import { prisma } from "@/lib/prisma"
import type { Prisma } from "@/lib/generated/prisma/client"

const withChildrenInclude = {
  children: {
    orderBy: { sortOrder: "asc" as const },
  },
  parent: true,
} satisfies Prisma.CategoryInclude

async function findAll() {
  return prisma.category.findMany({
    include: withChildrenInclude,
    orderBy: { sortOrder: "asc" },
  })
}

async function findBySlug(slug: string) {
  return prisma.category.findUnique({
    where: { slug },
    include: withChildrenInclude,
  })
}

const findWithSubcategories = unstable_cache(
  async () => {
    return prisma.category.findMany({
      where: { parentId: null },
      include: {
        children: { orderBy: { sortOrder: "asc" } },
      },
      orderBy: { sortOrder: "asc" },
    })
  },
  ["categories-tree"],
  { revalidate: 3600, tags: ["categories"] },
)

const findFeatured = unstable_cache(
  async () => {
    return prisma.category.findMany({
      where: { featured: true, parentId: null },
      include: {
        children: { orderBy: { sortOrder: "asc" } },
      },
      orderBy: { sortOrder: "asc" },
    })
  },
  ["categories-featured"],
  { revalidate: 3600, tags: ["categories"] },
)

export const CategoryService = {
  findAll,
  findBySlug,
  findWithSubcategories,
  findFeatured,
}
export type CategoryWithChildren = Awaited<ReturnType<typeof findAll>>[number]
export type CategoryTree = Awaited<ReturnType<typeof findWithSubcategories>>[number]
