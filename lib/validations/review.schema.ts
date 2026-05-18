import { z } from "zod"

export const SubmitReviewSchema = z.object({
  productId: z.string().cuid("Invalid product ID"),
  rating: z.number().int().min(1, "Rating must be at least 1").max(5, "Rating cannot exceed 5"),
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title cannot exceed 100 characters")
    .optional(),
  body: z
    .string()
    .min(10, "Review body must be at least 10 characters")
    .max(2000, "Review body cannot exceed 2000 characters")
    .optional(),
})

export type SubmitReviewInput = z.infer<typeof SubmitReviewSchema>
