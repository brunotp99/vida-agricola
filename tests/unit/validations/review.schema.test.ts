import { describe, it, expect } from "vitest"
import { SubmitReviewSchema } from "@/lib/validations/review.schema"

const validCuid = "clzq1abcd0000abcd1234efgh"

describe("SubmitReviewSchema", () => {
  it("accepts valid review", () => {
    const result = SubmitReviewSchema.safeParse({
      productId: validCuid,
      rating: 5,
      title: "Great product",
      body: "I really enjoyed this product. Would definitely recommend it.",
    })
    expect(result.success).toBe(true)
  })

  it("accepts review without title and body (both optional)", () => {
    const result = SubmitReviewSchema.safeParse({ productId: validCuid, rating: 3 })
    expect(result.success).toBe(true)
  })

  it("rejects rating below 1", () => {
    const result = SubmitReviewSchema.safeParse({ productId: validCuid, rating: 0 })
    expect(result.success).toBe(false)
  })

  it("rejects rating above 5", () => {
    const result = SubmitReviewSchema.safeParse({ productId: validCuid, rating: 6 })
    expect(result.success).toBe(false)
  })

  it("rejects too-short body", () => {
    const result = SubmitReviewSchema.safeParse({ productId: validCuid, rating: 4, body: "Short" })
    expect(result.success).toBe(false)
  })
})
