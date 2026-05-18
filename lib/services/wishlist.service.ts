import { prisma } from "@/lib/prisma"
import type { Prisma } from "@/lib/generated/prisma/client"

const wishlistInclude = {
  product: {
    include: {
      images: { take: 1, orderBy: { sortOrder: "asc" as const } },
      brand: true,
      category: true,
      _count: { select: { reviews: true } },
      reviews: { select: { rating: true } },
      variants: { select: { stock: true } },
    },
  },
} satisfies Prisma.WishlistItemInclude

async function getWishlist(userId: string) {
  return prisma.wishlistItem.findMany({
    where: { userId },
    include: wishlistInclude,
    orderBy: { addedAt: "desc" },
  })
}

async function addItem(userId: string, productId: string) {
  return prisma.wishlistItem.upsert({
    where: { userId_productId: { userId, productId } },
    create: { userId, productId },
    update: {},
  })
}

async function removeItem(userId: string, productId: string) {
  return prisma.wishlistItem.deleteMany({ where: { userId, productId } })
}

async function isWishlisted(userId: string, productId: string) {
  const item = await prisma.wishlistItem.findUnique({
    where: { userId_productId: { userId, productId } },
  })
  return !!item
}

export const WishlistService = { getWishlist, addItem, removeItem, isWishlisted }
export type WishlistItemWithProduct = Awaited<ReturnType<typeof getWishlist>>[number]
