import { describe, it, expect } from "vitest"
import { CreateProductSchema, UpdateProductSchema } from "@/lib/validations/product.schema"

const validCuid = "clzq1abcd0000abcd1234efgh"

const validProduct = {
  name: "Premium Layer Feed",
  slug: "premium-layer-feed",
  sku: "PLF-001",
  price: 32.99,
  status: "draft" as const,
}

describe("CreateProductSchema", () => {
  it("accepts valid product data", () => {
    const result = CreateProductSchema.safeParse(validProduct)
    expect(result.success).toBe(true)
  })

  it("rejects invalid slug with uppercase", () => {
    const result = CreateProductSchema.safeParse({ ...validProduct, slug: "Invalid-Slug" })
    expect(result.success).toBe(false)
  })

  it("rejects negative price", () => {
    const result = CreateProductSchema.safeParse({ ...validProduct, price: -5 })
    expect(result.success).toBe(false)
  })

  it("rejects invalid status", () => {
    const result = CreateProductSchema.safeParse({ ...validProduct, status: "unknown" })
    expect(result.success).toBe(false)
  })
})

describe("UpdateProductSchema", () => {
  it("accepts partial update with valid id", () => {
    const result = UpdateProductSchema.safeParse({ id: validCuid, price: 29.99 })
    expect(result.success).toBe(true)
  })

  it("rejects missing id", () => {
    const result = UpdateProductSchema.safeParse({ price: 29.99 })
    expect(result.success).toBe(false)
  })
})
