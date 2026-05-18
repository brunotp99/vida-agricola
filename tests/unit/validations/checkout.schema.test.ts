import { describe, it, expect } from "vitest"
import { AddressSchema, CreatePaymentIntentSchema } from "@/lib/validations/checkout.schema"

const validCuid = "clzq1abcd0000abcd1234efgh"

const validAddress = {
  name: "João Silva",
  line1: "Rua das Flores 123",
  city: "Lisboa",
  postalCode: "1000-001",
  country: "PT",
}

describe("AddressSchema", () => {
  it("accepts valid address", () => {
    const result = AddressSchema.safeParse(validAddress)
    expect(result.success).toBe(true)
  })

  it("rejects short name", () => {
    const result = AddressSchema.safeParse({ ...validAddress, name: "J" })
    expect(result.success).toBe(false)
  })

  it("rejects invalid country code (not 2 chars)", () => {
    const result = AddressSchema.safeParse({ ...validAddress, country: "POR" })
    expect(result.success).toBe(false)
  })

  it("defaults country to PT", () => {
    const { country: _c, ...noCountry } = validAddress
    const result = AddressSchema.safeParse(noCountry)
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.country).toBe("PT")
  })
})

describe("CreatePaymentIntentSchema", () => {
  it("accepts valid payment intent data", () => {
    const result = CreatePaymentIntentSchema.safeParse({ cartId: validCuid })
    expect(result.success).toBe(true)
  })

  it("rejects invalid cartId", () => {
    const result = CreatePaymentIntentSchema.safeParse({ cartId: "bad-id" })
    expect(result.success).toBe(false)
  })
})
