import { describe, it, expect } from "vitest"
import { UpdateOrderStatusSchema } from "@/lib/validations/order.schema"

const validCuid = "clzq1abcd0000abcd1234efgh"

describe("UpdateOrderStatusSchema", () => {
  it("accepts valid status update", () => {
    const result = UpdateOrderStatusSchema.safeParse({ orderId: validCuid, status: "shipped" })
    expect(result.success).toBe(true)
  })

  it("rejects invalid status", () => {
    const result = UpdateOrderStatusSchema.safeParse({ orderId: validCuid, status: "lost" })
    expect(result.success).toBe(false)
  })

  it("rejects invalid orderId", () => {
    const result = UpdateOrderStatusSchema.safeParse({ orderId: "bad", status: "pending" })
    expect(result.success).toBe(false)
  })
})
