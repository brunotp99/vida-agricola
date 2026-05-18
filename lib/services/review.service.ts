import { prisma } from "@/lib/prisma"

async function createReview(
  userId: string,
  productId: string,
  rating: number,
  title?: string,
  body?: string,
) {
  // Check if user has a delivered order containing this product
  const deliveredOrder = await prisma.order.findFirst({
    where: {
      userId,
      status: "delivered",
      items: { some: { productId } },
    },
  })

  const verified = !!deliveredOrder

  if (!deliveredOrder) {
    throw new Error("You must purchase this product to leave a review")
  }

  return prisma.review.upsert({
    where: { productId_userId: { productId, userId } },
    create: { productId, userId, rating, title, body, verified },
    update: { rating, title, body, verified },
  })
}

async function findByProduct(productId: string) {
  const [reviews, aggregate] = await Promise.all([
    prisma.review.findMany({
      where: { productId },
      include: { user: { select: { name: true, image: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.review.aggregate({
      where: { productId },
      _avg: { rating: true },
      _count: { rating: true },
    }),
  ])
  return {
    reviews,
    averageRating: aggregate._avg.rating ?? 0,
    totalReviews: aggregate._count.rating,
  }
}

async function deleteReview(reviewId: string, userId: string, isAdmin = false) {
  const review = await prisma.review.findUnique({ where: { id: reviewId } })
  if (!review) throw new Error("Review not found")
  if (!isAdmin && review.userId !== userId) throw new Error("Unauthorized")
  return prisma.review.delete({ where: { id: reviewId } })
}

export const ReviewService = { createReview, findByProduct, deleteReview }
