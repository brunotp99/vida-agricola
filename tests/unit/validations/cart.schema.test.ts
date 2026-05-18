import { describe, it, expect } from "vitest"
import { AddToCartSchema, UpdateCartItemSchema } from "@/lib/validations/cart.schema"

const validCuid = "clzq1abcd0000abcd1234efgh"

describe("AddToCartSchema", () => {
  it("accepts valid add-to-cart data", () => {
    const result = AddToCartSchema.safeParse({ productId: validCuid, quantity: 2 })
    expect(result.success).toBe(true)
  })

  it("rejects quantity of 0", () => {
    const result = AddToCartSchema.safeParse({ productId: validCuid, quantity: 0 })
    expect(result.success).toBe(false)
  })

  it("rejects quantity over 99", () => {
    const result = AddToCartSchema.safeParse({ productId: validCuid, quantity: 100 })
    expect(result.success).toBe(false)
  })

  it("rejects invalid productId", () => {
    const result = AddToCartSchema.safeParse({ productId: "not-a-cuid", quantity: 1 })
    expect(result.success).toBe(false)
  })
})

describe("UpdateCartItemSchema", () => {
  it("accepts valid update (including quantity 0 for removal)", () => {
    const result = UpdateCartItemSchema.safeParse({ cartItemId: validCuid, quantity: 0 })
    expect(result.success).toBe(true)
  })

  it("rejects negative quantity", () => {
    const result = UpdateCartItemSchema.safeParse({ cartItemId: validCuid, quantity: -1 })
    expect(result.success).toBe(false)
  })
})
