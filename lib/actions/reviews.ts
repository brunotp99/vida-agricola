"use server"

import { z } from "zod"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { ReviewService } from "@/lib/services/review.service"

const SubmitReviewSchema = z.object({
  productId: z.string().min(1),
  productSlug: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(120).optional(),
  body: z.string().max(2000).optional(),
})

export async function submitReviewAction(input: z.infer<typeof SubmitReviewSchema>) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return { success: false, error: "You must be signed in to leave a review" }

  const result = SubmitReviewSchema.safeParse(input)
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message }
  }

  const { productId, productSlug, rating, title, body } = result.data

  try {
    await ReviewService.createReview(session.user.id, productId, rating, title, body)
    revalidatePath(`/product/${productSlug}`)
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to submit review",
    }
  }
}
